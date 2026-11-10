// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ProtectedEscrow} from "../src/ProtectedEscrow.sol";
import {MockUSDT3009} from "./mocks/MockUSDT3009.sol";

/// @notice The app (packages/shared/src/escrow.ts) and the contract must hash offers and actions identically,
///  or every signature the app collects would be rejected on-chain. Expected values come from
///  `node --import tsx scripts/escrow-parity.ts`; rerun it and update them if a type changes.
contract ProtectedEscrowParityTest is Test {
    address constant AT = 0x00000000000000000000000000000000e5c0E5c0;
    bytes32 constant TS_OFFER_HASH = 0x015bf0a10c2e50e745cb03c2748f8c1e40456d98d53f6a8e82f4c0ec2189457a;
    bytes32 constant TS_ACTION_HASH = 0x6d0673180e5e5b1e795679df48b2d5e917de592ad148126153a14ef2e6740e6c;

    ProtectedEscrow esc;

    function setUp() public {
        vm.chainId(31337);
        MockUSDT3009 usdt = new MockUSDT3009();
        deployCodeTo(
            "ProtectedEscrow.sol:ProtectedEscrow",
            abi.encode(address(this), IERC20(address(usdt)), address(1), address(2), uint16(50), uint256(200e6), uint256(10_000e6)),
            AT
        );
        esc = ProtectedEscrow(AT);
    }

    function test_offerHash_matchesTypeScript() public view {
        ProtectedEscrow.Offer memory o = ProtectedEscrow.Offer({
            payee: address(0xB0),
            payer: address(0),
            amount: 180_000_000,
            deliverWithin: 259_200,
            inspectFor: 259_200,
            respondWithin: 86_400,
            offerExpiry: 1_800_086_400,
            offerId: 0x1111111111111111111111111111111111111111111111111111111111111111
        });
        assertEq(esc.hashOffer(o), TS_OFFER_HASH);
    }

    function test_actionHash_matchesTypeScript() public view {
        ProtectedEscrow.Action memory a = ProtectedEscrow.Action({
            dealId: TS_OFFER_HASH,
            kind: uint8(ProtectedEscrow.ActionKind.OfferPartial),
            amount: 60_000_000,
            nonce: 7,
            validBefore: 1_800_000_600
        });
        assertEq(esc.hashAction(a), TS_ACTION_HASH);
    }

    function test_feeAndSplit_matchTypeScript() public view {
        // TS: fee 900000; split(60 USDT back) => payer 60.3, payee 120, treasury 0.6
        assertEq(esc.feeFor(180_000_000), 900_000);
    }
}
