// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ProtectedEscrow} from "../src/ProtectedEscrow.sol";

interface IUSDT3009 {
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function RECEIVE_WITH_AUTHORIZATION_TYPEHASH() external view returns (bytes32);
}

/// @notice Full lifecycle against the REAL Whitechain Sepolia USDT (TetherTokenV2, EIP-3009).
///  Run: forge test --match-contract ProtectedEscrowFork --fork-url whitechain_sepolia
///  Skipped automatically when not forking.
contract ProtectedEscrowForkTest is Test {
    IERC20 constant USDT = IERC20(0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7);
    ProtectedEscrow esc;
    uint256 payerPk = 0xA11CE;
    uint256 payeePk = 0xB0B;
    address payer;
    address payee;
    address treasury = makeAddr("treasury");
    address arbiter = makeAddr("arbiter");

    function setUp() public {
        if (block.chainid != 1874) return;
        payer = vm.addr(payerPk);
        payee = vm.addr(payeePk);
        esc = new ProtectedEscrow(address(this), USDT, treasury, arbiter, 50, 200e6, 10_000e6);
        deal(address(USDT), payer, 1_000e6);
    }

    function _sign(uint256 pk, bytes32 digest) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        return abi.encodePacked(r, s, v);
    }

    function test_fork_fullLifecycle_realUSDT() public {
        if (block.chainid != 1874) return;
        ProtectedEscrow.Offer memory o = ProtectedEscrow.Offer({
            payee: payee,
            payer: address(0),
            amount: 180e6,
            deliverWithin: 3 days,
            inspectFor: 3 days,
            respondWithin: 3 days,
            offerExpiry: uint64(block.timestamp + 1 days),
            offerId: keccak256("fork")
        });
        bytes32 h = esc.hashOffer(o);
        uint256 total = 180e6 + esc.feeFor(180e6);
        uint256 validAfter = block.timestamp - 1;
        uint256 validBefore = block.timestamp + 1 hours;
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                IUSDT3009(address(USDT)).DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        IUSDT3009(address(USDT)).RECEIVE_WITH_AUTHORIZATION_TYPEHASH(),
                        payer,
                        address(esc),
                        total,
                        validAfter,
                        validBefore,
                        h
                    )
                )
            )
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(payerPk, digest);
        bytes32 id = esc.fund(o, _sign(payeePk, h), ProtectedEscrow.Auth(payer, validAfter, validBefore, v, r, s));
        assertEq(USDT.balanceOf(address(esc)), total);

        vm.prank(payee);
        esc.markDelivered(id);
        vm.prank(payer);
        esc.openDispute(id);
        vm.prank(payee);
        esc.offerPartial(id, 60e6);
        vm.prank(payer);
        esc.acceptPartial(id);

        uint256 fee = total - 180e6;
        uint256 feeKept = fee * 120e6 / 180e6;
        assertEq(USDT.balanceOf(payee), 120e6);
        assertEq(USDT.balanceOf(treasury), feeKept);
        assertEq(USDT.balanceOf(payer), 1_000e6 - total + 60e6 + (fee - feeKept));
        assertEq(USDT.balanceOf(address(esc)), 0);
    }
}
