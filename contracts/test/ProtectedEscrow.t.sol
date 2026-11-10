// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ProtectedEscrow} from "../src/ProtectedEscrow.sol";
import {BlocklistUSDT3009} from "./mocks/BlocklistUSDT3009.sol";
import {MockUSDTPermit} from "./mocks/MockUSDTPermit.sol";
import {Smart1271Wallet} from "./mocks/Smart1271Wallet.sol";

contract ProtectedEscrowTest is Test {
    BlocklistUSDT3009 usdt;
    ProtectedEscrow esc;

    address owner = makeAddr("owner");
    address treasury = makeAddr("treasury");
    uint256 arbiterPk = 0xA4B1;
    address arbiter;
    uint256 payerPk = 0xA11CE; // Asha
    address payer;
    uint256 payeePk = 0xB0B; // Ravi
    address payee;
    address relayer = makeAddr("relayer");
    address stranger = makeAddr("stranger");

    uint256 constant AMOUNT = 180e6;
    uint16 constant FEE_BPS = 50; // 0.5%
    uint256 constant FEE = AMOUNT * FEE_BPS / 10_000; // 0.9 USDT
    uint256 constant CAP = 200e6;
    uint256 constant HARD_CAP = 10_000e6;
    uint32 constant D3 = 3 days;

    function setUp() public {
        vm.warp(1_800_000_000);
        payer = vm.addr(payerPk);
        payee = vm.addr(payeePk);
        arbiter = vm.addr(arbiterPk);
        usdt = new BlocklistUSDT3009();
        esc = new ProtectedEscrow(owner, IERC20(address(usdt)), treasury, arbiter, FEE_BPS, CAP, HARD_CAP);
        usdt.mint(payer, 1_000e6);
    }

    // ================================================================ helpers

    function _sign(uint256 pk, bytes32 digest) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        return abi.encodePacked(r, s, v);
    }

    function _offer(address onlyPayer, uint256 amount, bytes32 salt)
        internal
        view
        returns (ProtectedEscrow.Offer memory)
    {
        return ProtectedEscrow.Offer({
            payee: payee,
            payer: onlyPayer,
            amount: amount,
            deliverWithin: D3,
            inspectFor: D3,
            respondWithin: D3,
            offerExpiry: uint64(block.timestamp + 1 days),
            offerId: salt
        });
    }

    function _auth(uint256 pk, uint256 value, bytes32 nonce) internal view returns (ProtectedEscrow.Auth memory) {
        uint256 validAfter = block.timestamp - 1;
        uint256 validBefore = block.timestamp + 1 hours;
        bytes32 structHash = keccak256(
            abi.encode(
                usdt.RECEIVE_WITH_AUTHORIZATION_TYPEHASH(),
                vm.addr(pk),
                address(esc),
                value,
                validAfter,
                validBefore,
                nonce
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", usdt.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        return ProtectedEscrow.Auth(vm.addr(pk), validAfter, validBefore, v, r, s);
    }

    function _fundOffer(ProtectedEscrow.Offer memory o, uint256 fromPk) internal returns (bytes32 id) {
        bytes32 h = esc.hashOffer(o);
        vm.prank(relayer);
        id = esc.fund(o, _sign(payeePk, h), _auth(fromPk, o.amount + esc.feeFor(o.amount), h));
    }

    function _fund() internal returns (bytes32) {
        return _fundOffer(_offer(address(0), AMOUNT, keccak256("deal-1")), payerPk);
    }

    function _act(uint256 pk, bytes32 id, ProtectedEscrow.ActionKind kind, uint128 amount) internal {
        address who = vm.addr(pk);
        ProtectedEscrow.Action memory a = ProtectedEscrow.Action({
            dealId: id,
            kind: uint8(kind),
            amount: amount,
            nonce: esc.nonces(who),
            validBefore: uint64(block.timestamp + 10 minutes)
        });
        vm.prank(relayer);
        esc.actWithSig(a, _sign(pk, esc.hashAction(a)));
    }

    function _state(bytes32 id) internal view returns (ProtectedEscrow.State) {
        return esc.getDeal(id).state;
    }

    function _delivered() internal returns (bytes32 id) {
        id = _fund();
        vm.prank(payee);
        esc.markDelivered(id);
    }

    function _disputed() internal returns (bytes32 id) {
        id = _delivered();
        vm.prank(payer);
        esc.openDispute(id);
    }

    function _escalated() internal returns (bytes32 id) {
        id = _disputed();
        vm.prank(payee);
        esc.contest(id);
    }

    /// payer started with 1,000 USDT
    function _assertBalances(uint256 payerDelta, uint256 payeeGot, uint256 treasuryGot) internal view {
        assertEq(usdt.balanceOf(payer), 1_000e6 - AMOUNT - FEE + payerDelta, "payer");
        assertEq(usdt.balanceOf(payee), payeeGot, "payee");
        assertEq(usdt.balanceOf(treasury), treasuryGot, "treasury");
        assertEq(usdt.balanceOf(address(esc)), 0, "escrow empty");
    }

    // ============================================================ happy paths

    function test_fund_movesMoneyIntoEscrow() public {
        bytes32 id = _fund();
        ProtectedEscrow.Deal memory d = esc.getDeal(id);
        assertEq(uint8(d.state), uint8(ProtectedEscrow.State.Funded));
        assertEq(d.payer, payer);
        assertEq(d.payee, payee);
        assertEq(d.amount, AMOUNT);
        assertEq(d.fee, FEE);
        assertEq(d.deadline, block.timestamp + D3);
        assertEq(usdt.balanceOf(address(esc)), AMOUNT + FEE);
        assertEq(usdt.balanceOf(payer), 1_000e6 - AMOUNT - FEE);
    }

    function test_buyerReleasesEarly() public {
        bytes32 id = _fund();
        vm.prank(payer);
        esc.release(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Released));
        _assertBalances(0, AMOUNT, FEE);
    }

    function test_deliver_thenBuyerConfirms() public {
        bytes32 id = _delivered();
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Delivered));
        vm.prank(payer);
        esc.release(id);
        _assertBalances(0, AMOUNT, FEE);
    }

    function test_buyerSilent_pokeReleases() public {
        bytes32 id = _delivered();
        vm.warp(block.timestamp + D3 + 1);
        vm.prank(stranger);
        esc.poke(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Released));
        _assertBalances(0, AMOUNT, FEE);
    }

    function test_sellerLate_pokeRefundsIncludingFee() public {
        bytes32 id = _fund();
        vm.warp(block.timestamp + D3 + 1);
        esc.poke(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Refunded));
        _assertBalances(AMOUNT + FEE, 0, 0);
    }

    function test_sellerCancels_fullRefund() public {
        bytes32 id = _fund();
        vm.prank(payee);
        esc.cancelBySeller(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Refunded));
        _assertBalances(AMOUNT + FEE, 0, 0);
    }

    function test_dispute_sellerAgrees() public {
        bytes32 id = _disputed();
        vm.prank(payee);
        esc.agreeRefund(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Refunded));
        _assertBalances(AMOUNT + FEE, 0, 0);
    }

    function test_dispute_partialAccepted_feeProRated() public {
        bytes32 id = _disputed();
        vm.prank(payee);
        esc.offerPartial(id, 60e6); // refund 60 of 180
        vm.prank(payer);
        esc.acceptPartial(id);
        uint256 feeKept = FEE * 120e6 / AMOUNT;
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Settled));
        _assertBalances(60e6 + (FEE - feeKept), 120e6, feeKept);
    }

    function test_dispute_partialOffered_buyerSilent_escalatesNotAccepted() public {
        bytes32 id = _disputed();
        vm.prank(payee);
        esc.offerPartial(id, 1); // a lowball offer: 1 unit back
        vm.warp(block.timestamp + D3 + 1);
        esc.poke(id); // silence must NOT accept the lowball offer
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Escalated));
        assertEq(esc.getDeal(id).offeredRefund, 1, "offer kept for the arbiter");
        vm.prank(arbiter);
        esc.rule(id, 60e6);
        uint256 feeKept = FEE * 120e6 / AMOUNT;
        _assertBalances(60e6 + (FEE - feeKept), 120e6, feeKept);
    }

    function test_offerPartial_onlyOnce_noEndlessStalling() public {
        bytes32 id = _disputed();
        vm.prank(payee);
        esc.offerPartial(id, 10e6);
        vm.warp(block.timestamp + D3 - 1);
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.OfferAlreadyMade.selector);
        esc.offerPartial(id, 20e6); // can't reset the clock again
        vm.warp(block.timestamp + 2);
        esc.poke(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Escalated));
    }

    function test_dispute_sellerSilent_pokeRefunds() public {
        bytes32 id = _disputed();
        vm.warp(block.timestamp + D3 + 1);
        esc.poke(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Refunded));
        _assertBalances(AMOUNT + FEE, 0, 0);
    }

    function test_contest_arbiterRules() public {
        bytes32 id = _escalated();
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Escalated));
        vm.prank(arbiter);
        esc.rule(id, 54e6); // 30% back to the payer
        uint256 feeKept = FEE * (AMOUNT - 54e6) / AMOUNT;
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Settled));
        _assertBalances(54e6 + (FEE - feeKept), AMOUNT - 54e6, feeKept);
    }

    function test_buyerRejectsPartial_escalates_arbiterRules() public {
        bytes32 id = _disputed();
        vm.prank(payee);
        esc.offerPartial(id, 20e6);
        vm.prank(payer);
        esc.escalate(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Escalated));
        assertEq(esc.getDeal(id).offeredRefund, 20e6, "offer kept for the record");
        vm.prank(arbiter);
        esc.rule(id, uint128(AMOUNT)); // full refund
        _assertBalances(AMOUNT + FEE, 0, 0);
    }

    function test_arbiterSilent_pokeRefunds() public {
        bytes32 id = _escalated();
        vm.warp(block.timestamp + esc.ARBITER_WINDOW() + 1);
        esc.poke(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Refunded));
        _assertBalances(AMOUNT + FEE, 0, 0);
    }

    function test_arbiterCanRuleZeroForPayer() public {
        bytes32 id = _escalated();
        vm.prank(arbiter);
        esc.rule(id, 0);
        _assertBalances(0, AMOUNT, FEE);
    }

    function test_restrictedOffer_onlyNamedBuyer() public {
        ProtectedEscrow.Offer memory o = _offer(payer, AMOUNT, keccak256("only-asha"));
        bytes32 id = _fundOffer(o, payerPk);
        assertEq(esc.getDeal(id).payer, payer);
    }

    function test_restrictedOffer_otherBuyerReverts() public {
        uint256 otherPk = 0xD00D;
        usdt.mint(vm.addr(otherPk), 1_000e6);
        ProtectedEscrow.Offer memory o = _offer(payer, AMOUNT, keccak256("only-asha"));
        bytes32 h = esc.hashOffer(o);
        bytes memory ps = _sign(payeePk, h);
        ProtectedEscrow.Auth memory a = _auth(otherPk, AMOUNT + FEE, h);
        vm.expectRevert(ProtectedEscrow.WrongPayer.selector);
        esc.fund(o, ps, a);
    }

    function test_gasless_fullLifecycle_viaSignatures() public {
        bytes32 id = _fund();
        _act(payeePk, id, ProtectedEscrow.ActionKind.MarkDelivered, 0);
        _act(payerPk, id, ProtectedEscrow.ActionKind.OpenDispute, 0);
        _act(payeePk, id, ProtectedEscrow.ActionKind.OfferPartial, 30e6);
        _act(payerPk, id, ProtectedEscrow.ActionKind.Escalate, 0);
        _act(arbiterPk, id, ProtectedEscrow.ActionKind.Rule, 90e6);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Settled));
        assertEq(esc.nonces(payee), 2);
        assertEq(esc.nonces(payer), 2);
        assertEq(esc.nonces(arbiter), 1);
        uint256 feeKept = FEE * 90e6 / AMOUNT;
        _assertBalances(90e6 + (FEE - feeKept), 90e6, feeKept);
    }

    function test_gasless_releaseAndRefundAndCancel() public {
        bytes32 a = _fund();
        _act(payerPk, a, ProtectedEscrow.ActionKind.Release, 0);
        assertEq(uint8(_state(a)), uint8(ProtectedEscrow.State.Released));

        bytes32 b = _fundOffer(_offer(address(0), 10e6, keccak256("b")), payerPk);
        _act(payeePk, b, ProtectedEscrow.ActionKind.CancelBySeller, 0);
        assertEq(uint8(_state(b)), uint8(ProtectedEscrow.State.Refunded));

        bytes32 c = _fundOffer(_offer(address(0), 10e6, keccak256("c")), payerPk);
        _act(payeePk, c, ProtectedEscrow.ActionKind.MarkDelivered, 0);
        _act(payerPk, c, ProtectedEscrow.ActionKind.OpenDispute, 0);
        _act(payeePk, c, ProtectedEscrow.ActionKind.AgreeRefund, 0);
        assertEq(uint8(_state(c)), uint8(ProtectedEscrow.State.Refunded));

        bytes32 d = _fundOffer(_offer(address(0), 10e6, keccak256("d")), payerPk);
        _act(payeePk, d, ProtectedEscrow.ActionKind.MarkDelivered, 0);
        _act(payerPk, d, ProtectedEscrow.ActionKind.OpenDispute, 0);
        _act(payeePk, d, ProtectedEscrow.ActionKind.OfferPartial, 4e6);
        _act(payerPk, d, ProtectedEscrow.ActionKind.AcceptPartial, 0);
        assertEq(uint8(_state(d)), uint8(ProtectedEscrow.State.Settled));

        bytes32 e = _fundOffer(_offer(address(0), 10e6, keccak256("e")), payerPk);
        _act(payeePk, e, ProtectedEscrow.ActionKind.MarkDelivered, 0);
        _act(payerPk, e, ProtectedEscrow.ActionKind.OpenDispute, 0);
        _act(payeePk, e, ProtectedEscrow.ActionKind.Contest, 0);
        assertEq(uint8(_state(e)), uint8(ProtectedEscrow.State.Escalated));
    }

    function test_smartWalletSeller_1271() public {
        Smart1271Wallet wallet = new Smart1271Wallet(payee);
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("smart"));
        o.payee = address(wallet);
        bytes32 h = esc.hashOffer(o);
        bytes32 id = esc.fund(o, _sign(payeePk, h), _auth(payerPk, AMOUNT + FEE, h));
        // the smart wallet marks delivered gaslessly with its owner's signature
        _act(payeePk, id, ProtectedEscrow.ActionKind.MarkDelivered, 0);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Delivered));
        vm.prank(payer);
        esc.release(id);
        assertEq(usdt.balanceOf(address(wallet)), AMOUNT);
    }

    function test_fundDirect() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("direct"));
        bytes memory ps = _sign(payeePk, esc.hashOffer(o));
        vm.startPrank(payer);
        usdt.approve(address(esc), AMOUNT + FEE);
        bytes32 id = esc.fundDirect(o, ps);
        vm.stopPrank();
        assertEq(esc.getDeal(id).payer, payer);
        assertEq(usdt.balanceOf(address(esc)), AMOUNT + FEE);
    }

    function test_fundWithPermit() public {
        MockUSDTPermit pt = new MockUSDTPermit();
        ProtectedEscrow e2 = new ProtectedEscrow(owner, IERC20(address(pt)), treasury, arbiter, FEE_BPS, CAP, HARD_CAP);
        pt.mint(payer, 1_000e6);
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("permit"));
        bytes32 h = e2.hashOffer(o);
        uint256 total = AMOUNT + FEE;
        uint256 pd = block.timestamp + 1 hours;
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                pt.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                        payer,
                        address(e2),
                        total,
                        pt.nonces(payer),
                        pd
                    )
                )
            )
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(payerPk, permitHash);
        uint64 vb = uint64(block.timestamp + 10 minutes);
        ProtectedEscrow.PermitFund memory p = ProtectedEscrow.PermitFund({
            payer: payer,
            permitDeadline: pd,
            v: v,
            r: r,
            s: s,
            validBefore: vb,
            consentSig: _sign(payerPk, e2.hashFundConsent(h, payer, vb))
        });
        vm.prank(relayer);
        bytes32 id = e2.fundWithPermit(o, _sign(payeePk, h), p);
        assertEq(e2.getDeal(id).payer, payer);
        assertEq(pt.balanceOf(address(e2)), total);
    }

    function test_fundWithPermit_leftoverAllowanceCannotBeHijacked() public {
        MockUSDTPermit pt = new MockUSDTPermit();
        ProtectedEscrow e2 = new ProtectedEscrow(owner, IERC20(address(pt)), treasury, arbiter, FEE_BPS, CAP, HARD_CAP);
        pt.mint(payer, 1_000e6);
        vm.prank(payer);
        pt.approve(address(e2), type(uint256).max); // a careless unlimited approval
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("hijack"));
        bytes32 h = e2.hashOffer(o);
        uint64 vb = uint64(block.timestamp + 10 minutes);
        // the attacker (here: the payee) has no payer consent signature
        ProtectedEscrow.PermitFund memory p = ProtectedEscrow.PermitFund({
            payer: payer,
            permitDeadline: 0,
            v: 0,
            r: 0,
            s: 0,
            validBefore: vb,
            consentSig: _sign(payeePk, e2.hashFundConsent(h, payer, vb))
        });
        vm.expectRevert(ProtectedEscrow.BadSignature.selector);
        e2.fundWithPermit(o, _sign(payeePk, h), p);
    }

    function test_zeroFee_deal() public {
        vm.prank(owner);
        esc.setFee(0);
        bytes32 id = _fundOffer(_offer(address(0), AMOUNT, keccak256("free")), payerPk);
        assertEq(esc.getDeal(id).fee, 0);
        vm.prank(payer);
        esc.release(id);
        assertEq(usdt.balanceOf(payee), AMOUNT);
        assertEq(usdt.balanceOf(treasury), 0);
    }

    // ================================================================ attacks

    function test_sameOfferCannotBeFundedTwice() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("once"));
        _fundOffer(o, payerPk);
        bytes32 h = esc.hashOffer(o);
        bytes memory ps = _sign(payeePk, h);
        ProtectedEscrow.Auth memory a = _auth(payerPk, AMOUNT + FEE, h);
        vm.expectRevert(ProtectedEscrow.AlreadyFunded.selector);
        esc.fund(o, ps, a);
    }

    function test_tamperedOffer_badPayeeSignature() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("tamper"));
        bytes memory ps = _sign(payeePk, esc.hashOffer(o));
        o.amount = 1e6; // buyer tries to pay less
        bytes32 h2 = esc.hashOffer(o);
        ProtectedEscrow.Auth memory a = _auth(payerPk, o.amount + esc.feeFor(o.amount), h2);
        vm.expectRevert(ProtectedEscrow.BadPayeeSignature.selector);
        esc.fund(o, ps, a);
    }

    function test_tamperedTimer_badPayeeSignature() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("timer"));
        bytes memory ps = _sign(payeePk, esc.hashOffer(o));
        o.inspectFor = 14 days;
        ProtectedEscrow.Auth memory a = _auth(payerPk, AMOUNT + FEE, esc.hashOffer(o));
        vm.expectRevert(ProtectedEscrow.BadPayeeSignature.selector);
        esc.fund(o, ps, a);
    }

    function test_payerAuthForOtherDeal_cannotFundThisOne() public {
        ProtectedEscrow.Offer memory o1 = _offer(address(0), AMOUNT, keccak256("one"));
        ProtectedEscrow.Offer memory o2 = _offer(address(0), AMOUNT, keccak256("two"));
        bytes32 h1 = esc.hashOffer(o1);
        bytes32 h2 = esc.hashOffer(o2);
        ProtectedEscrow.Auth memory a = _auth(payerPk, AMOUNT + FEE, h1); // payer only agreed to deal one
        bytes memory ps = _sign(payeePk, h2);
        vm.expectRevert(bytes("invalid signature"));
        esc.fund(o2, ps, a);
    }

    function test_relayerCannotRedirectPayer() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("redirect"));
        bytes32 h = esc.hashOffer(o);
        ProtectedEscrow.Auth memory a = _auth(payerPk, AMOUNT + FEE, h);
        a.from = stranger; // pretend someone else is paying
        bytes memory ps = _sign(payeePk, h);
        vm.expectRevert(bytes("invalid signature"));
        esc.fund(o, ps, a);
    }

    function test_selfDeal_reverts() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("self"));
        o.payee = payer;
        bytes32 h = esc.hashOffer(o);
        bytes memory ps = _sign(payerPk, h);
        ProtectedEscrow.Auth memory a = _auth(payerPk, AMOUNT + FEE, h);
        vm.expectRevert(ProtectedEscrow.SelfDeal.selector);
        esc.fund(o, ps, a);
    }

    function test_overCap_reverts() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), CAP + 1, keccak256("big"));
        bytes32 h = esc.hashOffer(o);
        bytes memory ps = _sign(payeePk, h);
        ProtectedEscrow.Auth memory a = _auth(payerPk, CAP + 1, h);
        vm.expectRevert(ProtectedEscrow.AmountTooLarge.selector);
        esc.fund(o, ps, a);
    }

    function test_zeroAmount_reverts() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), 0, keccak256("zero"));
        bytes32 h = esc.hashOffer(o);
        bytes memory ps = _sign(payeePk, h);
        ProtectedEscrow.Auth memory a = _auth(payerPk, 0, h);
        vm.expectRevert(ProtectedEscrow.ZeroAmount.selector);
        esc.fund(o, ps, a);
    }

    function test_expiredOffer_reverts() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("old"));
        bytes32 h = esc.hashOffer(o);
        bytes memory ps = _sign(payeePk, h);
        vm.warp(o.offerExpiry + 1);
        ProtectedEscrow.Auth memory a = _auth(payerPk, AMOUNT + FEE, h);
        vm.expectRevert(ProtectedEscrow.OfferExpired.selector);
        esc.fund(o, ps, a);
    }

    function test_badTimers_revert() public {
        uint32[3] memory bad = [uint32(59 minutes), uint32(31 days), uint32(0)];
        for (uint256 i; i < 3; i++) {
            ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, bytes32(i));
            o.deliverWithin = bad[i];
            _expectBadTimer(o);
        }
        ProtectedEscrow.Offer memory o2 = _offer(address(0), AMOUNT, "inspect");
        o2.inspectFor = 15 days;
        _expectBadTimer(o2);
        ProtectedEscrow.Offer memory o4 = _offer(address(0), AMOUNT, "short-inspect");
        o4.inspectFor = 23 hours; // a buyer always gets at least a day
        _expectBadTimer(o4);
        ProtectedEscrow.Offer memory o3 = _offer(address(0), AMOUNT, "respond");
        o3.respondWithin = 23 hours;
        _expectBadTimer(o3);
    }

    function _expectBadTimer(ProtectedEscrow.Offer memory o) internal {
        bytes32 h = esc.hashOffer(o);
        bytes memory ps = _sign(payeePk, h);
        ProtectedEscrow.Auth memory a = _auth(payerPk, AMOUNT + FEE, h);
        vm.expectRevert(ProtectedEscrow.BadTimer.selector);
        esc.fund(o, ps, a);
    }

    function test_wrongParty_directCalls() public {
        bytes32 id = _fund();
        vm.prank(payer);
        vm.expectRevert(ProtectedEscrow.NotParty.selector);
        esc.markDelivered(id); // only the seller

        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.NotParty.selector);
        esc.release(id); // only the buyer

        vm.prank(stranger);
        vm.expectRevert(ProtectedEscrow.NotParty.selector);
        esc.cancelBySeller(id);

        vm.prank(payee);
        esc.markDelivered(id);
        vm.prank(payer);
        esc.openDispute(id);
        vm.prank(payee);
        esc.contest(id);
        vm.prank(stranger);
        vm.expectRevert(ProtectedEscrow.NotParty.selector);
        esc.rule(id, 0); // only the arbiter
        vm.prank(owner);
        vm.expectRevert(ProtectedEscrow.NotParty.selector);
        esc.rule(id, 0); // not even the owner
    }

    function test_wrongSigner_gasless() public {
        bytes32 id = _fund();
        // the buyer signs a "MarkDelivered": checked against the seller, so it fails
        ProtectedEscrow.Action memory a = ProtectedEscrow.Action({
            dealId: id,
            kind: uint8(ProtectedEscrow.ActionKind.MarkDelivered),
            amount: 0,
            nonce: esc.nonces(payee),
            validBefore: uint64(block.timestamp + 10 minutes)
        });
        bytes memory sig = _sign(payerPk, esc.hashAction(a));
        vm.expectRevert(ProtectedEscrow.BadSignature.selector);
        esc.actWithSig(a, sig);
    }

    function test_replayedAction_badNonce() public {
        bytes32 id = _fund();
        ProtectedEscrow.Action memory a = ProtectedEscrow.Action({
            dealId: id,
            kind: uint8(ProtectedEscrow.ActionKind.MarkDelivered),
            amount: 0,
            nonce: 0,
            validBefore: uint64(block.timestamp + 10 minutes)
        });
        bytes memory sig = _sign(payeePk, esc.hashAction(a));
        esc.actWithSig(a, sig);
        vm.expectRevert(ProtectedEscrow.BadNonce.selector);
        esc.actWithSig(a, sig);
    }

    function test_expiredAction_reverts() public {
        bytes32 id = _fund();
        ProtectedEscrow.Action memory a = ProtectedEscrow.Action({
            dealId: id,
            kind: uint8(ProtectedEscrow.ActionKind.MarkDelivered),
            amount: 0,
            nonce: 0,
            validBefore: uint64(block.timestamp + 10 minutes)
        });
        bytes memory sig = _sign(payeePk, esc.hashAction(a));
        vm.warp(block.timestamp + 11 minutes);
        vm.expectRevert(ProtectedEscrow.ActionExpired.selector);
        esc.actWithSig(a, sig);
    }

    function test_actionOnUnknownDeal_reverts() public {
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.markDelivered(keccak256("nope"));
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.poke(keccak256("nope"));
    }

    function test_disputeAfterInspection_reverts() public {
        bytes32 id = _delivered();
        vm.warp(block.timestamp + D3 + 1);
        vm.prank(payer);
        vm.expectRevert(ProtectedEscrow.DeadlinePassed.selector);
        esc.openDispute(id);
    }

    function test_markDeliveredAfterDeadline_reverts() public {
        bytes32 id = _fund();
        vm.warp(block.timestamp + D3 + 1);
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.DeadlinePassed.selector);
        esc.markDelivered(id);
    }

    function test_contestAfterRespondWindow_reverts() public {
        bytes32 id = _disputed();
        vm.warp(block.timestamp + D3 + 1);
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.DeadlinePassed.selector);
        esc.contest(id);
    }

    function test_arbiterLate_reverts() public {
        bytes32 id = _escalated();
        vm.warp(block.timestamp + esc.ARBITER_WINDOW() + 1);
        vm.prank(arbiter);
        vm.expectRevert(ProtectedEscrow.DeadlinePassed.selector);
        esc.rule(id, 0);
    }

    function test_pokeBeforeDeadline_reverts() public {
        bytes32 id = _fund();
        vm.expectRevert(ProtectedEscrow.DeadlineNotPassed.selector);
        esc.poke(id);
    }

    function test_closedDeal_neverChangesAgain() public {
        bytes32 id = _fund();
        vm.prank(payer);
        esc.release(id);
        vm.prank(payer);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.release(id);
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.agreeRefund(id);
        vm.warp(block.timestamp + 30 days);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.poke(id);
    }

    function test_invalidStateTransitions() public {
        bytes32 id = _fund();
        vm.prank(payer);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.openDispute(id); // can't dispute before delivery
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.contest(id);
        vm.prank(payer);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.acceptPartial(id);
        vm.prank(payer);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.escalate(id); // no partial offer to reject

        vm.prank(payee);
        esc.markDelivered(id);
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.cancelBySeller(id); // cancel only before delivery
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.markDelivered(id); // twice
    }

    function test_buyerCanConcede_midDisputeAndEscalation() public {
        bytes32 a = _disputed();
        vm.prank(payer);
        esc.release(a); // buyer withdraws the complaint
        assertEq(uint8(_state(a)), uint8(ProtectedEscrow.State.Released));

        bytes32 b = _fundOffer(_offer(address(0), 10e6, keccak256("b")), payerPk);
        vm.prank(payee);
        esc.markDelivered(b);
        vm.prank(payer);
        esc.openDispute(b);
        vm.prank(payee);
        esc.contest(b);
        vm.prank(payer);
        esc.release(b);
        assertEq(uint8(_state(b)), uint8(ProtectedEscrow.State.Released));
    }

    function test_sellerCanConcede_afterEscalation() public {
        bytes32 id = _escalated();
        vm.prank(payee);
        esc.agreeRefund(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Refunded));
        _assertBalances(AMOUNT + FEE, 0, 0);
    }

    function test_escalated_partiesCannotTakeFromEachOther() public {
        bytes32 id = _escalated();
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.NotParty.selector);
        esc.release(id); // seller can't release to himself
        vm.prank(payer);
        vm.expectRevert(ProtectedEscrow.NotParty.selector);
        esc.agreeRefund(id); // buyer can't refund herself
    }

    function test_badPartialAmounts() public {
        bytes32 id = _disputed();
        vm.startPrank(payee);
        vm.expectRevert(ProtectedEscrow.BadSplit.selector);
        esc.offerPartial(id, 0);
        vm.expectRevert(ProtectedEscrow.BadSplit.selector);
        esc.offerPartial(id, uint128(AMOUNT));
        vm.stopPrank();
    }

    function test_arbiterCannotRuleAboveAmount() public {
        bytes32 id = _escalated();
        vm.prank(arbiter);
        vm.expectRevert(ProtectedEscrow.BadSplit.selector);
        esc.rule(id, uint128(AMOUNT + 1));
    }

    function test_partialOffer_restartsBuyerClock() public {
        bytes32 id = _disputed();
        vm.warp(block.timestamp + 2 days);
        vm.prank(payee);
        esc.offerPartial(id, 10e6);
        assertEq(esc.getDeal(id).deadline, block.timestamp + D3);
    }

    // ============================================================ admin powers

    function test_pause_blocksNewDealsOnly() public {
        bytes32 a = _fund();
        bytes32 b = _fundOffer(_offer(address(0), 10e6, keccak256("b")), payerPk);
        vm.prank(payee);
        esc.markDelivered(b);
        vm.prank(payer);
        esc.openDispute(b);
        vm.prank(payee);
        esc.contest(b);

        vm.prank(owner);
        esc.setNewDealsPaused(true);

        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("paused"));
        bytes32 h = esc.hashOffer(o);
        bytes memory ps = _sign(payeePk, h);
        ProtectedEscrow.Auth memory au = _auth(payerPk, AMOUNT + FEE, h);
        vm.expectRevert(ProtectedEscrow.Paused.selector);
        esc.fund(o, ps, au);

        // every path for existing deals keeps working
        vm.prank(payer);
        esc.release(a);
        vm.prank(arbiter);
        esc.rule(b, 5e6);
        assertEq(uint8(_state(a)), uint8(ProtectedEscrow.State.Released));
        assertEq(uint8(_state(b)), uint8(ProtectedEscrow.State.Settled));
    }

    function test_pause_doesNotBlockPoke() public {
        bytes32 id = _fund();
        vm.prank(owner);
        esc.setNewDealsPaused(true);
        vm.warp(block.timestamp + D3 + 1);
        esc.poke(id);
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Refunded));
    }

    function test_feeChange_doesNotAffectFundedDeal() public {
        bytes32 id = _fund();
        vm.prank(owner);
        esc.setFee(200);
        assertEq(esc.getDeal(id).fee, FEE);
        vm.prank(payer);
        esc.release(id);
        assertEq(usdt.balanceOf(treasury), FEE);
    }

    function test_feeAboveMax_reverts() public {
        vm.prank(owner);
        vm.expectRevert(ProtectedEscrow.FeeTooHigh.selector);
        esc.setFee(201);
    }

    function test_onlyOwnerAdmin() public {
        vm.startPrank(stranger);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        esc.setFee(10);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        esc.setNewDealsPaused(true);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        esc.setTreasury(stranger);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        esc.proposeArbiter(stranger);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        esc.setMaxDealAmount(1);
        vm.stopPrank();
    }

    function test_maxDeal_boundedByHardCap() public {
        vm.startPrank(owner);
        vm.expectRevert(ProtectedEscrow.AmountTooLarge.selector);
        esc.setMaxDealAmount(HARD_CAP + 1);
        vm.expectRevert(ProtectedEscrow.AmountTooLarge.selector);
        esc.setMaxDealAmount(0);
        esc.setMaxDealAmount(HARD_CAP);
        vm.stopPrank();
        assertEq(esc.maxDealAmount(), HARD_CAP);
    }

    function test_arbiterChange_timelocked() public {
        address newArb = makeAddr("newArb");
        vm.startPrank(owner);
        vm.expectRevert(ProtectedEscrow.NoPendingArbiter.selector);
        esc.acceptArbiter();
        esc.proposeArbiter(newArb);
        vm.expectRevert(ProtectedEscrow.TimelockActive.selector);
        esc.acceptArbiter();
        vm.warp(block.timestamp + 2 days);
        esc.acceptArbiter();
        vm.stopPrank();
        assertEq(esc.arbiter(), newArb);
    }

    function test_constructor_guards() public {
        IERC20 t = IERC20(address(usdt));
        vm.expectRevert(ProtectedEscrow.FeeTooHigh.selector);
        new ProtectedEscrow(owner, t, treasury, arbiter, 201, CAP, HARD_CAP);
        vm.expectRevert(ProtectedEscrow.AmountTooLarge.selector);
        new ProtectedEscrow(owner, t, treasury, arbiter, 50, HARD_CAP + 1, HARD_CAP);
        vm.expectRevert(ProtectedEscrow.ZeroAddress.selector);
        new ProtectedEscrow(owner, t, address(0), arbiter, 50, CAP, HARD_CAP);
        vm.expectRevert(ProtectedEscrow.ZeroAddress.selector);
        new ProtectedEscrow(owner, t, treasury, address(0), 50, CAP, HARD_CAP);
    }

    // ===================================================== blocklisted payout

    function test_blocklistedPayee_payoutDeferred_thenWithdrawn() public {
        bytes32 id = _fund();
        usdt.setBlocked(payee, true);
        vm.prank(payer);
        esc.release(id); // must not get stuck
        assertEq(uint8(_state(id)), uint8(ProtectedEscrow.State.Released));
        assertEq(esc.owed(payee), AMOUNT);
        assertEq(usdt.balanceOf(treasury), FEE);

        address fresh = makeAddr("fresh");
        vm.prank(payee);
        esc.withdraw(fresh);
        assertEq(usdt.balanceOf(fresh), AMOUNT);
        assertEq(esc.owed(payee), 0);
        assertEq(usdt.balanceOf(address(esc)), 0);
    }

    function test_withdraw_nothingOwed_reverts() public {
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.NothingOwed.selector);
        esc.withdraw(payee);
    }

    // ======================================================== remaining guards

    function test_setTreasury() public {
        address t2 = makeAddr("t2");
        vm.startPrank(owner);
        vm.expectRevert(ProtectedEscrow.ZeroAddress.selector);
        esc.setTreasury(address(0));
        esc.setTreasury(t2);
        vm.stopPrank();
        bytes32 id = _fund();
        vm.prank(payer);
        esc.release(id);
        assertEq(usdt.balanceOf(t2), FEE);
    }

    function test_domainSeparator_matchesEIP712() public view {
        bytes32 expected = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("WondrPayEscrow"),
                keccak256("1"),
                block.chainid,
                address(esc)
            )
        );
        assertEq(esc.domainSeparator(), expected);
    }

    function test_permitConsentExpired_reverts() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("late"));
        ProtectedEscrow.PermitFund memory p;
        p.payer = payer;
        p.validBefore = uint64(block.timestamp - 1);
        bytes memory ps = _sign(payeePk, esc.hashOffer(o));
        vm.expectRevert(ProtectedEscrow.ActionExpired.selector);
        esc.fundWithPermit(o, ps, p);
    }

    function test_zeroPayee_reverts() public {
        ProtectedEscrow.Offer memory o = _offer(address(0), AMOUNT, keccak256("nopayee"));
        o.payee = address(0);
        vm.prank(payer);
        vm.expectRevert(ProtectedEscrow.ZeroAddress.selector);
        esc.fundDirect(o, "");
    }

    function test_actWithSig_unknownDeal_reverts() public {
        ProtectedEscrow.Action memory a = ProtectedEscrow.Action({
            dealId: keccak256("nope"),
            kind: 0,
            amount: 0,
            nonce: 0,
            validBefore: uint64(block.timestamp + 1 minutes)
        });
        vm.expectRevert(ProtectedEscrow.WrongState.selector);
        esc.actWithSig(a, "");
    }

    function test_withdrawToZero_reverts() public {
        bytes32 id = _fund();
        usdt.setBlocked(payee, true);
        vm.prank(payer);
        esc.release(id);
        vm.prank(payee);
        vm.expectRevert(ProtectedEscrow.ZeroAddress.selector);
        esc.withdraw(address(0));
    }

    function test_proposeZeroArbiter_reverts() public {
        vm.prank(owner);
        vm.expectRevert(ProtectedEscrow.ZeroAddress.selector);
        esc.proposeArbiter(address(0));
    }

    function test_constructor_moreGuards() public {
        vm.expectRevert(ProtectedEscrow.ZeroAddress.selector);
        new ProtectedEscrow(owner, IERC20(address(0)), treasury, arbiter, 50, CAP, HARD_CAP);
        vm.expectRevert(ProtectedEscrow.AmountTooLarge.selector);
        new ProtectedEscrow(owner, IERC20(address(usdt)), treasury, arbiter, 50, 0, HARD_CAP);
        vm.expectRevert(ProtectedEscrow.AmountTooLarge.selector);
        new ProtectedEscrow(owner, IERC20(address(usdt)), treasury, arbiter, 50, CAP, type(uint128).max);
    }

    function test_blocklistedTreasury_feeDeferred() public {
        bytes32 id = _fund();
        usdt.setBlocked(treasury, true);
        vm.prank(payer);
        esc.release(id);
        assertEq(esc.owed(treasury), FEE);
        assertEq(usdt.balanceOf(payee), AMOUNT);
    }

    // =================================================================== fuzz

    function testFuzz_settleConservesMoney(uint256 amount, uint16 feeBps, uint256 payerShare) public {
        amount = bound(amount, 1, CAP);
        feeBps = uint16(bound(feeBps, 0, 200));
        payerShare = bound(payerShare, 0, amount);
        vm.prank(owner);
        esc.setFee(feeBps);
        usdt.mint(payer, amount * 2);
        bytes32 id = _fundOffer(_offer(address(0), amount, keccak256("fz")), payerPk);
        uint256 fee = esc.getDeal(id).fee;
        uint256 before = usdt.balanceOf(payer);
        vm.prank(payee);
        esc.markDelivered(id);
        vm.prank(payer);
        esc.openDispute(id);
        vm.prank(payee);
        esc.contest(id);
        vm.prank(arbiter);
        esc.rule(id, uint128(payerShare));
        uint256 got = usdt.balanceOf(payer) - before + usdt.balanceOf(payee) + usdt.balanceOf(treasury);
        assertEq(got, amount + fee, "conservation");
        assertEq(usdt.balanceOf(address(esc)), 0, "escrow empty");
        assertEq(usdt.balanceOf(payee), amount - payerShare, "payee share");
        assertLe(usdt.balanceOf(treasury), fee, "fee bounded");
    }
}
