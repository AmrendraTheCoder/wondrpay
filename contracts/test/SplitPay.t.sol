// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SplitPay} from "../src/SplitPay.sol";
import {BlocklistUSDT3009} from "./mocks/BlocklistUSDT3009.sol";

contract SplitPayTest is Test {
    SplitPay split;
    BlocklistUSDT3009 usdt;
    uint256 payerPk = 0xA11CE;
    address payer;
    address relayer = makeAddr("relayer");

    function setUp() public {
        vm.warp(1_800_000_000);
        payer = vm.addr(payerPk);
        usdt = new BlocklistUSDT3009();
        split = new SplitPay(IERC20(address(usdt)));
        usdt.mint(payer, 1_000e6);
    }

    function _people(uint256 n) internal returns (address[] memory to) {
        to = new address[](n);
        for (uint256 i; i < n; i++) to[i] = makeAddr(string.concat("p", vm.toString(i)));
    }

    function _even(uint256 n, uint256 each) internal pure returns (uint256[] memory a) {
        a = new uint256[](n);
        for (uint256 i; i < n; i++) a[i] = each;
    }

    function _auth(uint256 pk, uint256 value, bytes32 nonce) internal view returns (SplitPay.Auth memory a) {
        uint256 validAfter = block.timestamp - 1;
        uint256 validBefore = block.timestamp + 1 hours;
        bytes32 structHash = keccak256(
            abi.encode(usdt.RECEIVE_WITH_AUTHORIZATION_TYPEHASH(), vm.addr(pk), address(split), value, validAfter, validBefore, nonce)
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", usdt.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        a = SplitPay.Auth(vm.addr(pk), validAfter, validBefore, v, r, s);
    }

    // ------------------------------------------------------------ happy paths

    function test_salary_fivePeople_equal() public {
        address[] memory to = _people(5);
        uint256[] memory amt = _even(5, 100e6);
        bytes32 id = split.splitNonce(to, amt, "salary-nov");
        vm.prank(relayer);
        bytes32 got = split.splitPay(to, amt, "salary-nov", _auth(payerPk, 500e6, id));
        assertEq(got, id);
        for (uint256 i; i < 5; i++) assertEq(usdt.balanceOf(to[i]), 100e6);
        assertEq(usdt.balanceOf(payer), 500e6);
        assertEq(usdt.balanceOf(address(split)), 0, "contract keeps nothing");
        assertEq(usdt.balanceOf(relayer), 0);
    }

    function test_customAmounts() public {
        address[] memory to = _people(3);
        uint256[] memory amt = new uint256[](3);
        (amt[0], amt[1], amt[2]) = (1, 250e6, 33_333_333);
        vm.prank(relayer);
        split.splitPay(to, amt, 0, _auth(payerPk, 1 + 250e6 + 33_333_333, split.splitNonce(to, amt, 0)));
        assertEq(usdt.balanceOf(to[0]), 1);
        assertEq(usdt.balanceOf(to[1]), 250e6);
        assertEq(usdt.balanceOf(to[2]), 33_333_333);
        assertEq(usdt.balanceOf(address(split)), 0);
    }

    function test_maxRecipients() public {
        uint256 n = split.MAX_RECIPIENTS();
        address[] memory to = _people(n);
        uint256[] memory amt = _even(n, 1e6);
        split.splitPay(to, amt, 0, _auth(payerPk, n * 1e6, split.splitNonce(to, amt, 0)));
        assertEq(usdt.balanceOf(to[n - 1]), 1e6);
    }

    function testFuzz_conservesMoney(uint8 n, uint64 seed) public {
        address[] memory to = _people(bound(n, 1, 50));
        uint256[] memory amt = new uint256[](to.length);
        uint256 total;
        for (uint256 i; i < to.length; i++) {
            amt[i] = bound(uint256(keccak256(abi.encode(seed, i))), 1, 10e6);
            total += amt[i];
        }
        usdt.mint(payer, total);
        uint256 before = usdt.balanceOf(payer);
        _pay(to, amt, bytes32(uint256(seed)), total);
        assertEq(usdt.balanceOf(payer), before - total);
        assertEq(usdt.balanceOf(address(split)), 0);
        uint256 paid;
        for (uint256 i; i < to.length; i++) paid += usdt.balanceOf(to[i]);
        assertEq(paid, total);
    }

    function _pay(address[] memory to, uint256[] memory amt, bytes32 memo, uint256 total) internal {
        bytes32 id = split.splitNonce(to, amt, memo);
        split.splitPay(to, amt, memo, _auth(payerPk, total, id));
    }

    // ---------------------------------------------------------------- attacks

    function test_relayerCannotChangeRecipient() public {
        address[] memory to = _people(2);
        uint256[] memory amt = _even(2, 10e6);
        SplitPay.Auth memory a = _auth(payerPk, 20e6, split.splitNonce(to, amt, 0));
        to[1] = relayer; // swap in the attacker
        vm.expectRevert("invalid signature");
        vm.prank(relayer);
        split.splitPay(to, amt, 0, a);
    }

    function test_relayerCannotChangeAmounts_sameTotal() public {
        address[] memory to = _people(2);
        uint256[] memory amt = _even(2, 10e6);
        SplitPay.Auth memory a = _auth(payerPk, 20e6, split.splitNonce(to, amt, 0));
        (amt[0], amt[1]) = (1, 20e6 - 1); // same total, different shares
        vm.expectRevert("invalid signature");
        split.splitPay(to, amt, 0, a);
    }

    function test_relayerCannotReorderShares() public {
        address[] memory to = _people(2);
        uint256[] memory amt = new uint256[](2);
        (amt[0], amt[1]) = (5e6, 15e6);
        SplitPay.Auth memory a = _auth(payerPk, 20e6, split.splitNonce(to, amt, 0));
        (to[0], to[1]) = (to[1], to[0]);
        vm.expectRevert("invalid signature");
        split.splitPay(to, amt, 0, a);
    }

    function test_replay_reverts() public {
        address[] memory to = _people(2);
        uint256[] memory amt = _even(2, 10e6);
        SplitPay.Auth memory a = _auth(payerPk, 20e6, split.splitNonce(to, amt, "x"));
        split.splitPay(to, amt, "x", a);
        vm.expectRevert("authorization is used");
        split.splitPay(to, amt, "x", a);
    }

    function test_authCannotBeUsedDirectlyOnToken() public {
        address[] memory to = _people(1);
        uint256[] memory amt = _even(1, 10e6);
        bytes32 id = split.splitNonce(to, amt, 0);
        SplitPay.Auth memory a = _auth(payerPk, 10e6, id);
        vm.expectRevert("caller must be the payee");
        vm.prank(relayer);
        usdt.receiveWithAuthorization(a.from, address(split), 10e6, a.validAfter, a.validBefore, id, a.v, a.r, a.s);
    }

    function test_blocklistedRecipient_revertsWholeSplit_payerNotCharged() public {
        address[] memory to = _people(3);
        uint256[] memory amt = _even(3, 10e6);
        usdt.setBlocked(to[2], true);
        SplitPay.Auth memory a = _auth(payerPk, 30e6, split.splitNonce(to, amt, 0));
        vm.expectRevert();
        split.splitPay(to, amt, 0, a);
        assertEq(usdt.balanceOf(payer), 1_000e6, "payer keeps everything");
        assertEq(usdt.balanceOf(to[0]), 0);
    }

    function test_notEnoughBalance_reverts() public {
        address[] memory to = _people(2);
        uint256[] memory amt = _even(2, 600e6);
        SplitPay.Auth memory a = _auth(payerPk, 1_200e6, split.splitNonce(to, amt, 0));
        vm.expectRevert();
        split.splitPay(to, amt, 0, a);
    }

    function test_badInputs_revert() public {
        address[] memory none = new address[](0);
        uint256[] memory noAmt = new uint256[](0);
        SplitPay.Auth memory a = _auth(payerPk, 0, 0);
        vm.expectRevert(SplitPay.BadLength.selector);
        split.splitPay(none, noAmt, 0, a);

        address[] memory to = _people(2);
        vm.expectRevert(SplitPay.BadLength.selector);
        split.splitPay(to, _even(3, 1e6), 0, a);

        vm.expectRevert(SplitPay.BadLength.selector);
        split.splitPay(_people(51), _even(51, 1), 0, a);

        uint256[] memory amt = _even(2, 1e6);
        amt[1] = 0;
        vm.expectRevert(SplitPay.ZeroAmount.selector);
        split.splitPay(to, amt, 0, a);

        amt[1] = 1e6;
        to[0] = address(0);
        vm.expectRevert(SplitPay.ZeroAddress.selector);
        split.splitPay(to, amt, 0, a);

        to[0] = payer; // paying yourself
        vm.expectRevert(SplitPay.BadRecipient.selector);
        split.splitPay(to, amt, 0, a);

        to[0] = address(split);
        vm.expectRevert(SplitPay.BadRecipient.selector);
        split.splitPay(to, amt, 0, a);
    }

    function test_constructor_zeroToken_reverts() public {
        vm.expectRevert(SplitPay.ZeroAddress.selector);
        new SplitPay(IERC20(address(0)));
    }

    function test_nonce_bindsContractAndMemo() public {
        address[] memory to = _people(1);
        uint256[] memory amt = _even(1, 1e6);
        SplitPay other = new SplitPay(IERC20(address(usdt)));
        assertTrue(split.splitNonce(to, amt, "a") != split.splitNonce(to, amt, "b"));
        assertTrue(split.splitNonce(to, amt, "a") != other.splitNonce(to, amt, "a"));
    }
}
