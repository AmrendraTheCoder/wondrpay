// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ProtectedEscrow} from "../src/ProtectedEscrow.sol";

/// Deploys ProtectedEscrow (Protected Pay) on Whitechain Sepolia.
///   set -a; source ../.env; set +a
///   forge script script/DeployEscrow.s.sol --rpc-url whitechain_sepolia --private-key $DEPLOYER_PK --broadcast
/// Roles default to the deployer on TESTNET ONLY. On mainnet, set ESCROW_OWNER, ESCROW_TREASURY and
/// ESCROW_ARBITER to separate 2-of-3 Safes (see docs/protected-pay/BUILD_PLAN.md §10).
contract DeployEscrow is Script {
    address constant USDT = 0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7;

    function run() external {
        require(block.chainid == 1874, "wrong chain: expected Whitechain Sepolia 1874");
        address owner = vm.envOr("ESCROW_OWNER", msg.sender);
        address treasury = vm.envOr("ESCROW_TREASURY", msg.sender);
        address arbiter = vm.envOr("ESCROW_ARBITER", msg.sender);
        uint16 feeBps = uint16(vm.envOr("ESCROW_FEE_BPS", uint256(50))); // 0.5%
        uint256 maxDeal = vm.envOr("ESCROW_MAX_DEAL", uint256(200e6)); // 200 USDT beta cap
        uint256 hardCap = vm.envOr("ESCROW_HARD_CAP", uint256(10_000e6));

        vm.startBroadcast();
        ProtectedEscrow esc = new ProtectedEscrow(owner, IERC20(USDT), treasury, arbiter, feeBps, maxDeal, hardCap);
        vm.stopBroadcast();

        console2.log("ProtectedEscrow:", address(esc));
        console2.log("owner / treasury / arbiter:", owner, treasury, arbiter);
    }
}
