// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockUSDT3009} from "./MockUSDT3009.sol";

/// @dev EIP-3009 USDT mock that refuses transfers to blocklisted addresses, like Tether's blacklist.
contract BlocklistUSDT3009 is MockUSDT3009 {
    mapping(address => bool) public blocked;

    function setBlocked(address who, bool b) external {
        blocked[who] = b;
    }

    function _update(address from, address to, uint256 value) internal override {
        require(!blocked[to] && !blocked[from], "blocked");
        super._update(from, to, value);
    }
}
