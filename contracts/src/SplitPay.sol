// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC3009} from "./interfaces/IERC3009.sol";

/// @title SplitPay
/// @notice One payment, many recipients (salaries, paying a group). Gasless for the payer.
///  - The payer signs ONE EIP-3009 `receiveWithAuthorization` to this contract for the total.
///  - The authorization nonce is the hash of the exact recipient list, amounts and memo, so whoever
///    submits it (normally the relayer) cannot change who is paid or how much.
///  - All or nothing: if any recipient cannot be paid (e.g. the token blocklists them), the whole
///    payment reverts and the payer is not charged.
///  - No owner, no admin, no fee, not upgradeable. The contract holds no money between transactions.
contract SplitPay is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev EIP-3009 signature pieces. `from` is the payer.
    struct Auth {
        address from;
        uint256 validAfter;
        uint256 validBefore;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    bytes32 public constant SPLIT_TAG = keccak256("WONDRPAY_SPLIT");
    uint256 public constant MAX_RECIPIENTS = 50;

    IERC20 public immutable token;

    event SplitPaid(bytes32 indexed splitId, address indexed from, uint256 total, uint256 recipients, bytes32 memo);
    event SplitShare(bytes32 indexed splitId, address indexed to, uint256 amount);

    error ZeroAddress();
    error ZeroAmount();
    error BadLength();
    error BadRecipient();

    constructor(IERC20 token_) {
        if (address(token_) == address(0)) revert ZeroAddress();
        token = token_;
    }

    /// @notice The id of a split and the nonce the payer must sign. Binds chain, this contract,
    ///  every recipient, every amount (in order) and the memo.
    function splitNonce(address[] calldata to, uint256[] calldata amounts, bytes32 memo) public view returns (bytes32) {
        return keccak256(abi.encode(SPLIT_TAG, block.chainid, address(this), keccak256(abi.encode(to, amounts)), memo));
    }

    /// @notice Pay `amounts[i]` to `to[i]` from the payer's one signed authorization for the sum.
    function splitPay(address[] calldata to, uint256[] calldata amounts, bytes32 memo, Auth calldata a)
        external
        nonReentrant
        returns (bytes32 splitId)
    {
        uint256 n = to.length;
        if (n == 0 || n > MAX_RECIPIENTS || n != amounts.length) revert BadLength();

        uint256 total;
        for (uint256 i; i < n; ++i) {
            address r = to[i];
            if (r == address(0)) revert ZeroAddress();
            if (r == a.from || r == address(this) || r == address(token)) revert BadRecipient();
            if (amounts[i] == 0) revert ZeroAmount();
            total += amounts[i];
        }

        splitId = splitNonce(to, amounts, memo);
        IERC3009(address(token)).receiveWithAuthorization(
            a.from, address(this), total, a.validAfter, a.validBefore, splitId, a.v, a.r, a.s
        );
        for (uint256 i; i < n; ++i) {
            token.safeTransfer(to[i], amounts[i]);
            emit SplitShare(splitId, to[i], amounts[i]);
        }
        emit SplitPaid(splitId, a.from, total, n, memo);
    }
}
