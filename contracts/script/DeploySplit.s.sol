// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SplitPay} from "../src/SplitPay.sol";

/// Deploys SplitPay (one payment, many recipients) on Whitechain Sepolia. It has no owner and no settings.
///   set -a; source ../.env; set +a
///   forge script script/DeploySplit.s.sol --rpc-url whitechain_sepolia --private-key $DEPLOYER_PK --broadcast
contract DeploySplit is Script {
    address constant USDT = 0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7;

    function run() external {
        require(block.chainid == 1874, "wrong chain: expected Whitechain Sepolia 1874");
        vm.startBroadcast();
        SplitPay split = new SplitPay(IERC20(USDT));
        vm.stopBroadcast();
        console2.log("SplitPay:", address(split));
    }
}
