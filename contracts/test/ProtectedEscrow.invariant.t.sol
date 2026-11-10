// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ProtectedEscrow} from "../src/ProtectedEscrow.sol";
import {BlocklistUSDT3009} from "./mocks/BlocklistUSDT3009.sol";

/// @dev Drives random sequences of real actions and time jumps against the escrow.
contract EscrowHandler is Test {
    ProtectedEscrow public esc;
    BlocklistUSDT3009 public usdt;
    address public arbiter;
    address[3] public payers;
    address[3] public payees;

    bytes32[] public ids;
    mapping(bytes32 => ProtectedEscrow.State) public closedAs; // final state when first seen closed
    uint256 public totalFunded;
    uint256 public totalPaidOut; // to payers, payees, treasury (pushed or owed)
    uint256 public salt;

    constructor(ProtectedEscrow esc_, BlocklistUSDT3009 usdt_, address arbiter_) {
        esc = esc_;
        usdt = usdt_;
        arbiter = arbiter_;
        for (uint256 i; i < 3; i++) {
            payers[i] = makeAddr(string.concat("payer", vm.toString(i)));
            payees[i] = makeAddr(string.concat("payee", vm.toString(i)));
            usdt.mint(payers[i], 1e15);
            vm.prank(payers[i]);
            usdt.approve(address(esc), type(uint256).max);
        }
    }

    function idsLength() external view returns (uint256) {
        return ids.length;
    }

    function _pick(uint256 seed) internal view returns (bytes32 id, ProtectedEscrow.Deal memory d) {
        id = ids[seed % ids.length];
        d = esc.getDeal(id);
    }

    // ---- actions (fundDirect avoids signing payee offers: payee is a contract-less EOA, so we sign via vm)
    function fund(uint256 who, uint256 amount, uint32 t1, uint32 t2, uint32 t3) external {
        if (esc.newDealsPaused()) return;
        amount = bound(amount, 1, esc.maxDealAmount());
        uint256 i = who % 3;
        (address payee, uint256 pk) = makeAddrAndKey(string.concat("payee", vm.toString(i)));
        ProtectedEscrow.Offer memory o = ProtectedEscrow.Offer({
            payee: payee,
            payer: address(0),
            amount: amount,
            deliverWithin: uint32(bound(t1, 1 hours, 30 days)),
            inspectFor: uint32(bound(t2, 1 hours, 14 days)),
            respondWithin: uint32(bound(t3, 1 days, 7 days)),
            offerExpiry: uint64(block.timestamp + 1 days),
            offerId: bytes32(++salt)
        });
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, esc.hashOffer(o));
        vm.prank(payers[(i + 1) % 3]);
        bytes32 id = esc.fundDirect(o, abi.encodePacked(r, s, v));
        ids.push(id);
        ProtectedEscrow.Deal memory d = esc.getDeal(id);
        totalFunded += d.amount + d.fee;
    }

    function markDelivered(uint256 seed) external {
        if (ids.length == 0) return;
        (bytes32 id, ProtectedEscrow.Deal memory d) = _pick(seed);
        if (d.state != ProtectedEscrow.State.Funded || block.timestamp > d.deadline) return;
        vm.prank(d.payee);
        esc.markDelivered(id);
    }

    function release(uint256 seed) external {
        if (ids.length == 0) return;
        (bytes32 id, ProtectedEscrow.Deal memory d) = _pick(seed);
        if (d.state != ProtectedEscrow.State.Funded && d.state != ProtectedEscrow.State.Delivered) return;
        vm.prank(d.payer);
        esc.release(id);
        _closed(id, d);
    }

    function dispute(uint256 seed) external {
        if (ids.length == 0) return;
        (bytes32 id, ProtectedEscrow.Deal memory d) = _pick(seed);
        if (d.state != ProtectedEscrow.State.Delivered || block.timestamp > d.deadline) return;
        vm.prank(d.payer);
        esc.openDispute(id);
    }

    function offerPartial(uint256 seed, uint128 r) external {
        if (ids.length == 0) return;
        (bytes32 id, ProtectedEscrow.Deal memory d) = _pick(seed);
        if (d.state != ProtectedEscrow.State.Disputed || block.timestamp > d.deadline || d.amount < 2) return;
        r = uint128(bound(r, 1, d.amount - 1));
        vm.prank(d.payee);
        esc.offerPartial(id, r);
    }

    function acceptPartial(uint256 seed) external {
        if (ids.length == 0) return;
        (bytes32 id, ProtectedEscrow.Deal memory d) = _pick(seed);
        if (d.state != ProtectedEscrow.State.Disputed || d.offeredRefund == 0) return;
        vm.prank(d.payer);
        esc.acceptPartial(id);
        _closed(id, d);
    }

    function agree(uint256 seed) external {
        if (ids.length == 0) return;
        (bytes32 id, ProtectedEscrow.Deal memory d) = _pick(seed);
        if (
            d.state != ProtectedEscrow.State.Funded && d.state != ProtectedEscrow.State.Delivered
                && d.state != ProtectedEscrow.State.Disputed
        ) return;
        vm.prank(d.payee);
        esc.agreeRefund(id);
        _closed(id, d);
    }

    function contest(uint256 seed) external {
        if (ids.length == 0) return;
        (bytes32 id, ProtectedEscrow.Deal memory d) = _pick(seed);
        if (d.state != ProtectedEscrow.State.Disputed || block.timestamp > d.deadline) return;
        vm.prank(d.payee);
        esc.contest(id);
    }

    function rule(uint256 seed, uint128 share) external {
        if (ids.length == 0) return;
        (bytes32 id, ProtectedEscrow.Deal memory d) = _pick(seed);
        if (d.state != ProtectedEscrow.State.Escalated || block.timestamp > d.deadline) return;
        share = uint128(bound(share, 0, d.amount));
        vm.prank(arbiter);
        esc.rule(id, share);
        _closed(id, d);
    }

    function poke(uint256 seed) external {
        if (ids.length == 0) return;
        (bytes32 id, ProtectedEscrow.Deal memory d) = _pick(seed);
        if (d.state == ProtectedEscrow.State.None || d.state >= ProtectedEscrow.State.Released) return;
        if (block.timestamp <= d.deadline) return;
        esc.poke(id);
        _closed(id, d);
    }

    function warp(uint256 secs) external {
        vm.warp(block.timestamp + bound(secs, 1 minutes, 10 days));
    }

    function _closed(bytes32 id, ProtectedEscrow.Deal memory d) internal {
        closedAs[id] = esc.getDeal(id).state;
        totalPaidOut += d.amount + d.fee;
    }
}

contract ProtectedEscrowInvariantTest is Test {
    ProtectedEscrow esc;
    BlocklistUSDT3009 usdt;
    EscrowHandler handler;
    address treasury = makeAddr("treasury");
    address arbiter = makeAddr("arbiter");

    function setUp() public {
        vm.warp(1_800_000_000);
        usdt = new BlocklistUSDT3009();
        esc = new ProtectedEscrow(makeAddr("owner"), IERC20(address(usdt)), treasury, arbiter, 50, 1_000e6, 10_000e6);
        handler = new EscrowHandler(esc, usdt, arbiter);
        targetContract(address(handler));
    }

    /// The escrow always holds exactly what open deals are owed (nothing more, nothing less).
    function invariant_balanceEqualsOpenLiabilities() public view {
        uint256 open;
        uint256 n = handler.idsLength();
        for (uint256 i; i < n; i++) {
            ProtectedEscrow.Deal memory d = esc.getDeal(handler.ids(i));
            if (d.state != ProtectedEscrow.State.None && d.state < ProtectedEscrow.State.Released) {
                open += d.amount + d.fee;
            }
        }
        assertEq(usdt.balanceOf(address(esc)), open);
    }

    /// Money in == money still held + money paid out.
    function invariant_conservation() public view {
        assertEq(handler.totalFunded(), usdt.balanceOf(address(esc)) + handler.totalPaidOut());
    }

    /// A closed deal never changes state again.
    function invariant_closedDealsAreFinal() public view {
        uint256 n = handler.idsLength();
        for (uint256 i; i < n; i++) {
            bytes32 id = handler.ids(i);
            ProtectedEscrow.State first = handler.closedAs(id);
            if (first != ProtectedEscrow.State.None) assertEq(uint8(esc.getDeal(id).state), uint8(first));
        }
    }

    /// The treasury never receives more than the fees of closed deals (fees are capped at 2%).
    function invariant_treasuryBounded() public view {
        assertLe(usdt.balanceOf(treasury), handler.totalPaidOut() * 200 / 10_000 + 1);
    }
}
