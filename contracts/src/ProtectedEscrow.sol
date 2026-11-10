// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC3009} from "./interfaces/IERC3009.sol";

/// @title ProtectedEscrow
/// @notice WondrPay "Protected Pay": a stablecoin payment that waits in this contract until the buyer
///  confirms, with deadlines that settle automatically and a dispute ladder. WondrPay never controls funds.
///
///  Lifecycle (see docs/protected-pay/BUILD_PLAN.md):
///   Funded --markDelivered--> Delivered --(buyer silent)--> Released
///   Funded --(seller late)--> Refunded            Delivered --openDispute--> Disputed
///   Disputed --agree / seller silent--> Refunded   Disputed --acceptPartial--> Settled ; (buyer silent on offer) --> Escalated
///   Disputed --contest / escalate--> Escalated --rule--> Settled ; (arbiter silent) --> Refunded
///
///  Trust model:
///   - The owner can only change the fee (capped, snapshotted per deal), treasury, beta cap, arbiter
///     (2-day timelock) and pause NEW deals. It cannot move funds, change a funded deal, or stop
///     releases, refunds, rulings, deadline enforcement or withdrawals.
///   - Every party action works gaslessly through a signature (relayed by anyone) or by calling directly.
///   - `poke` lets anyone enforce an expired deadline, so the rules hold even if WondrPay disappears.
contract ProtectedEscrow is EIP712, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ----------------------------------------------------------------- types

    enum State {
        None,
        Funded,
        Delivered,
        Disputed,
        Escalated,
        Released,
        Refunded,
        Settled
    }

    enum ActionKind {
        MarkDelivered, // payee
        Release, // payer
        OpenDispute, // payer
        AgreeRefund, // payee
        OfferPartial, // payee
        AcceptPartial, // payer
        Contest, // payee
        Escalate, // payer
        CancelBySeller, // payee
        Rule // arbiter (amount = payer's share)
    }

    /// @notice Signed by the payee (seller). The deal link carries it plus the signature.
    struct Offer {
        address payee;
        address payer; // address(0) = anyone with the link may fund
        uint256 amount; // token base units, excluding the fee
        uint32 deliverWithin; // seconds after funding to mark delivered
        uint32 inspectFor; // seconds the payer has after delivery to dispute
        uint32 respondWithin; // seconds the payee has to answer a dispute
        uint64 offerExpiry; // unix seconds; can't be funded after
        bytes32 offerId; // random salt; links to the off-chain deal record
    }

    struct Deal {
        address payer;
        uint64 deadline; // the active deadline; meaning depends on state
        uint32 inspectFor;
        address payee;
        uint32 respondWithin;
        State state;
        uint128 amount;
        uint128 fee;
        uint128 offeredRefund; // payee's pending partial-refund offer while Disputed
        uint64 fundedAt;
    }

    /// @notice A gasless party action.
    struct Action {
        bytes32 dealId;
        uint8 kind;
        uint128 amount;
        uint256 nonce;
        uint64 validBefore;
    }

    /// @dev EIP-3009 authorization pieces (`from` is the payer).
    struct Auth {
        address from;
        uint256 validAfter;
        uint256 validBefore;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    /// @dev EIP-2612 permit for exactly amount + fee, plus the payer's consent to this deal.
    struct PermitFund {
        address payer;
        uint256 permitDeadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
        uint64 validBefore; // consent expiry
        bytes consentSig; // payer's EIP-712 FundConsent(dealId,payer,validBefore)
    }

    // ------------------------------------------------------------- constants

    bytes32 public constant OFFER_TYPEHASH = keccak256(
        "Offer(address payee,address payer,uint256 amount,uint32 deliverWithin,uint32 inspectFor,uint32 respondWithin,uint64 offerExpiry,bytes32 offerId)"
    );
    bytes32 public constant ACTION_TYPEHASH =
        keccak256("Action(bytes32 dealId,uint8 kind,uint128 amount,uint256 nonce,uint64 validBefore)");
    bytes32 public constant FUND_CONSENT_TYPEHASH =
        keccak256("FundConsent(bytes32 dealId,address payer,uint64 validBefore)");

    uint16 public constant MAX_FEE_BPS = 200; // 2%, can never be exceeded
    uint32 public constant ARBITER_WINDOW = 7 days;
    uint32 public constant ARBITER_TIMELOCK = 2 days;

    uint32 public constant MIN_DELIVER = 1 hours;
    uint32 public constant MAX_DELIVER = 30 days;
    uint32 public constant MIN_INSPECT = 1 days; // a buyer always gets at least a day to check the goods
    uint32 public constant MAX_INSPECT = 14 days;
    uint32 public constant MIN_RESPOND = 1 days;
    uint32 public constant MAX_RESPOND = 7 days;

    IERC20 public immutable token;
    uint256 public immutable hardCap; // maxDealAmount can never exceed this

    // ----------------------------------------------------------------- state

    uint16 public feeBps;
    bool public newDealsPaused;
    address public treasury;
    address public arbiter;
    address public pendingArbiter;
    uint64 public pendingArbiterAt;
    uint256 public maxDealAmount;

    mapping(bytes32 dealId => Deal) private _deals;
    mapping(address signer => uint256) public nonces;
    /// @notice payouts that could not be pushed (e.g. recipient blocklisted by the token); claim with withdraw()
    mapping(address account => uint256) public owed;

    // ---------------------------------------------------------------- events

    event DealFunded(
        bytes32 indexed dealId,
        bytes32 indexed offerId,
        address indexed payer,
        address payee,
        uint256 amount,
        uint256 fee,
        uint64 deliverBy
    );
    event Delivered(bytes32 indexed dealId, uint64 inspectUntil);
    event DisputeOpened(bytes32 indexed dealId, uint64 respondBy);
    event PartialOffered(bytes32 indexed dealId, uint256 refundAmount, uint64 respondBy);
    event Escalated(bytes32 indexed dealId, uint64 ruleBy, bool byPayer);
    event DealClosed(
        bytes32 indexed dealId,
        State finalState,
        uint256 payerGot,
        uint256 payeeGot,
        uint256 feeKept,
        address closedBy
    );
    event PaymentDeferred(address indexed to, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event FeeChanged(uint16 feeBps);
    event TreasuryChanged(address treasury);
    event ArbiterProposed(address arbiter, uint64 effectiveAt);
    event ArbiterChanged(address arbiter);
    event MaxDealChanged(uint256 maxDealAmount);
    event NewDealsPaused(bool paused);

    // ---------------------------------------------------------------- errors

    error Paused();
    error ZeroAddress();
    error ZeroAmount();
    error AmountTooLarge();
    error OfferExpired();
    error BadTimer();
    error SelfDeal();
    error WrongPayer();
    error AlreadyFunded();
    error BadPayeeSignature();
    error BadSignature();
    error BadNonce();
    error ActionExpired();
    error NotParty();
    error WrongState();
    error DeadlinePassed();
    error DeadlineNotPassed();
    error BadSplit();
    error FeeTooHigh();
    error TimelockActive();
    error NoPendingArbiter();
    error NothingOwed();
    error OfferAlreadyMade();

    // ----------------------------------------------------------- constructor

    constructor(
        address owner_,
        IERC20 token_,
        address treasury_,
        address arbiter_,
        uint16 feeBps_,
        uint256 maxDealAmount_,
        uint256 hardCap_
    ) EIP712("WondrPayEscrow", "1") Ownable(owner_) {
        if (address(token_) == address(0) || treasury_ == address(0) || arbiter_ == address(0)) revert ZeroAddress();
        if (feeBps_ > MAX_FEE_BPS) revert FeeTooHigh();
        if (maxDealAmount_ == 0 || maxDealAmount_ > hardCap_ || hardCap_ > type(uint128).max / 2) {
            revert AmountTooLarge();
        }
        token = token_;
        treasury = treasury_;
        arbiter = arbiter_;
        feeBps = feeBps_;
        maxDealAmount = maxDealAmount_;
        hardCap = hardCap_;
    }

    // ----------------------------------------------------------------- views

    function hashOffer(Offer calldata o) public view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    OFFER_TYPEHASH,
                    o.payee,
                    o.payer,
                    o.amount,
                    o.deliverWithin,
                    o.inspectFor,
                    o.respondWithin,
                    o.offerExpiry,
                    o.offerId
                )
            )
        );
    }

    function hashAction(Action calldata a) public view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encode(ACTION_TYPEHASH, a.dealId, a.kind, a.amount, a.nonce, a.validBefore))
        );
    }

    function hashFundConsent(bytes32 dealId, address payer, uint64 validBefore) public view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(FUND_CONSENT_TYPEHASH, dealId, payer, validBefore)));
    }

    function getDeal(bytes32 dealId) external view returns (Deal memory) {
        return _deals[dealId];
    }

    /// @notice fee charged on top of `amount` for a deal funded now
    function feeFor(uint256 amount) public view returns (uint256) {
        return amount * feeBps / 10_000;
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // --------------------------------------------------------------- funding

    /// @notice Gasless funding: the payer signed EIP-3009 receiveWithAuthorization to this contract for
    ///  amount + fee with nonce == dealId (the offer hash). Anyone (normally the relayer) may submit.
    function fund(Offer calldata o, bytes calldata payeeSig, Auth calldata a)
        external
        nonReentrant
        returns (bytes32 dealId)
    {
        uint256 total;
        (dealId, total) = _open(o, payeeSig, a.from);
        IERC3009(address(token)).receiveWithAuthorization(
            a.from, address(this), total, a.validAfter, a.validBefore, dealId, a.v, a.r, a.s
        );
    }

    /// @notice Fallback funding for tokens without EIP-3009: an EIP-2612 permit for exactly amount + fee,
    ///  plus the payer's signed consent to this specific deal (so a leftover allowance can never be used
    ///  to fund a deal the payer did not choose).
    function fundWithPermit(Offer calldata o, bytes calldata payeeSig, PermitFund calldata p)
        external
        nonReentrant
        returns (bytes32 dealId)
    {
        if (block.timestamp > p.validBefore) revert ActionExpired();
        dealId = hashOffer(o);
        if (!SignatureChecker.isValidSignatureNow(p.payer, hashFundConsent(dealId, p.payer, p.validBefore), p.consentSig)) {
            revert BadSignature();
        }
        uint256 total;
        (dealId, total) = _open(o, payeeSig, p.payer);
        // a front-runner may have already used the permit; the transfer below is what matters
        try IERC20Permit(address(token)).permit(p.payer, address(this), total, p.permitDeadline, p.v, p.r, p.s) {}
            catch {}
        token.safeTransferFrom(p.payer, address(this), total);
    }

    /// @notice The payer funds directly (after approving this contract), paying their own gas.
    function fundDirect(Offer calldata o, bytes calldata payeeSig) external nonReentrant returns (bytes32 dealId) {
        uint256 total;
        (dealId, total) = _open(o, payeeSig, msg.sender);
        token.safeTransferFrom(msg.sender, address(this), total);
    }

    function _open(Offer calldata o, bytes calldata payeeSig, address payer)
        internal
        returns (bytes32 dealId, uint256 total)
    {
        if (newDealsPaused) revert Paused();
        if (o.amount == 0) revert ZeroAmount();
        if (o.amount > maxDealAmount) revert AmountTooLarge();
        if (block.timestamp > o.offerExpiry) revert OfferExpired();
        if (
            o.deliverWithin < MIN_DELIVER || o.deliverWithin > MAX_DELIVER || o.inspectFor < MIN_INSPECT
                || o.inspectFor > MAX_INSPECT || o.respondWithin < MIN_RESPOND || o.respondWithin > MAX_RESPOND
        ) revert BadTimer();
        if (o.payee == address(0) || payer == address(0)) revert ZeroAddress();
        if (o.payee == payer) revert SelfDeal();
        if (o.payer != address(0) && o.payer != payer) revert WrongPayer();

        dealId = hashOffer(o);
        if (_deals[dealId].state != State.None) revert AlreadyFunded();
        if (!SignatureChecker.isValidSignatureNow(o.payee, dealId, payeeSig)) revert BadPayeeSignature();

        uint256 fee = feeFor(o.amount);
        total = o.amount + fee;
        uint64 deliverBy = uint64(block.timestamp) + o.deliverWithin;

        _deals[dealId] = Deal({
            payer: payer,
            deadline: deliverBy,
            inspectFor: o.inspectFor,
            payee: o.payee,
            respondWithin: o.respondWithin,
            state: State.Funded,
            amount: uint128(o.amount),
            fee: uint128(fee),
            offeredRefund: 0,
            fundedAt: uint64(block.timestamp)
        });
        emit DealFunded(dealId, o.offerId, payer, o.payee, o.amount, fee, deliverBy);
    }

    // --------------------------------------------------------- party actions

    /// @notice Gasless entry point: any party action, signed by that party, submitted by anyone.
    function actWithSig(Action calldata act, bytes calldata sig) external nonReentrant {
        if (block.timestamp > act.validBefore) revert ActionExpired();
        Deal storage d = _deals[act.dealId];
        if (d.state == State.None) revert WrongState();
        ActionKind kind = ActionKind(act.kind);
        address signer = _expectedSigner(d, kind);
        if (act.nonce != nonces[signer]) revert BadNonce();
        if (!SignatureChecker.isValidSignatureNow(signer, hashAction(act), sig)) revert BadSignature();
        nonces[signer] = act.nonce + 1;
        _dispatch(act.dealId, d, kind, act.amount, signer);
    }

    function markDelivered(bytes32 dealId) external nonReentrant {
        _call(dealId, ActionKind.MarkDelivered, 0);
    }

    function release(bytes32 dealId) external nonReentrant {
        _call(dealId, ActionKind.Release, 0);
    }

    function openDispute(bytes32 dealId) external nonReentrant {
        _call(dealId, ActionKind.OpenDispute, 0);
    }

    function agreeRefund(bytes32 dealId) external nonReentrant {
        _call(dealId, ActionKind.AgreeRefund, 0);
    }

    function offerPartial(bytes32 dealId, uint128 refundAmount) external nonReentrant {
        _call(dealId, ActionKind.OfferPartial, refundAmount);
    }

    function acceptPartial(bytes32 dealId) external nonReentrant {
        _call(dealId, ActionKind.AcceptPartial, 0);
    }

    function contest(bytes32 dealId) external nonReentrant {
        _call(dealId, ActionKind.Contest, 0);
    }

    function escalate(bytes32 dealId) external nonReentrant {
        _call(dealId, ActionKind.Escalate, 0);
    }

    function cancelBySeller(bytes32 dealId) external nonReentrant {
        _call(dealId, ActionKind.CancelBySeller, 0);
    }

    /// @notice Arbiter ruling on an escalated deal: `payerShare` of `amount` goes back to the payer.
    function rule(bytes32 dealId, uint128 payerShare) external nonReentrant {
        _call(dealId, ActionKind.Rule, payerShare);
    }

    function _call(bytes32 dealId, ActionKind kind, uint128 amount) internal {
        Deal storage d = _deals[dealId];
        if (d.state == State.None) revert WrongState();
        if (msg.sender != _expectedSigner(d, kind)) revert NotParty();
        _dispatch(dealId, d, kind, amount, msg.sender);
    }

    function _expectedSigner(Deal storage d, ActionKind kind) internal view returns (address) {
        if (kind == ActionKind.Rule) return arbiter;
        if (
            kind == ActionKind.Release || kind == ActionKind.OpenDispute || kind == ActionKind.AcceptPartial
                || kind == ActionKind.Escalate
        ) return d.payer;
        return d.payee;
    }

    function _dispatch(bytes32 dealId, Deal storage d, ActionKind kind, uint128 amount, address actor) internal {
        State s = d.state;
        if (kind == ActionKind.MarkDelivered) {
            _require(s == State.Funded);
            _beforeDeadline(d);
            uint64 until = uint64(block.timestamp) + d.inspectFor;
            d.state = State.Delivered;
            d.deadline = until;
            emit Delivered(dealId, until);
        } else if (kind == ActionKind.Release) {
            // the buyer may always concede and pay the seller, even mid-dispute
            _require(s == State.Funded || s == State.Delivered || s == State.Disputed || s == State.Escalated);
            _settle(dealId, d, 0, State.Released, actor);
        } else if (kind == ActionKind.OpenDispute) {
            _require(s == State.Delivered);
            _beforeDeadline(d);
            uint64 by = uint64(block.timestamp) + d.respondWithin;
            d.state = State.Disputed;
            d.deadline = by;
            emit DisputeOpened(dealId, by);
        } else if (kind == ActionKind.AgreeRefund) {
            // the seller may always concede and refund in full, even after escalation
            _require(s == State.Funded || s == State.Delivered || s == State.Disputed || s == State.Escalated);
            _settle(dealId, d, d.amount, State.Refunded, actor);
        } else if (kind == ActionKind.CancelBySeller) {
            _require(s == State.Funded);
            _settle(dealId, d, d.amount, State.Refunded, actor);
        } else if (kind == ActionKind.OfferPartial) {
            _require(s == State.Disputed);
            _beforeDeadline(d);
            // One offer per dispute: otherwise a seller could re-offer forever and stall the refund.
            if (d.offeredRefund != 0) revert OfferAlreadyMade();
            if (amount == 0 || amount >= d.amount) revert BadSplit();
            uint64 by = uint64(block.timestamp) + d.respondWithin;
            d.offeredRefund = amount;
            d.deadline = by; // the payer now has respondWithin to accept or escalate (bounded: once)
            emit PartialOffered(dealId, amount, by);
        } else if (kind == ActionKind.AcceptPartial) {
            _require(s == State.Disputed && d.offeredRefund > 0);
            _settle(dealId, d, d.offeredRefund, State.Settled, actor);
        } else if (kind == ActionKind.Contest) {
            _require(s == State.Disputed);
            _beforeDeadline(d);
            _escalate(dealId, d, false);
        } else if (kind == ActionKind.Escalate) {
            _require(s == State.Disputed && d.offeredRefund > 0);
            _beforeDeadline(d);
            _escalate(dealId, d, true);
        } else {
            // Rule
            _require(s == State.Escalated);
            _beforeDeadline(d);
            if (amount > d.amount) revert BadSplit();
            _settle(dealId, d, amount, State.Settled, actor);
        }
    }

    function _escalate(bytes32 dealId, Deal storage d, bool byPayer) internal {
        uint64 by = uint64(block.timestamp) + ARBITER_WINDOW;
        d.state = State.Escalated;
        d.deadline = by;
        emit Escalated(dealId, by, byPayer);
    }

    // ------------------------------------------------------ deadline enforcer

    /// @notice Anyone may enforce an expired deadline. Never paused.
    ///  Funded -> Refunded (seller late) · Delivered -> Released (buyer silent)
    ///  Disputed -> Refunded (seller silent), or Escalated to the arbiter (buyer silent on a partial offer:
    ///  silence never accepts a lowball offer)
    ///  Escalated -> Refunded (arbiter silent)
    function poke(bytes32 dealId) external nonReentrant {
        Deal storage d = _deals[dealId];
        State s = d.state;
        if (s == State.None || s >= State.Released) revert WrongState();
        if (block.timestamp <= d.deadline) revert DeadlineNotPassed();
        if (s == State.Delivered) {
            _settle(dealId, d, 0, State.Released, msg.sender);
        } else if (s == State.Disputed && d.offeredRefund > 0) {
            _escalate(dealId, d, true);
        } else {
            _settle(dealId, d, d.amount, State.Refunded, msg.sender);
        }
    }

    // ----------------------------------------------------------- settlement

    /// @dev The fee is charged only on what the payee ends up with; the unused part goes back to the payer.
    ///  payerGot + payeeGot + feeKept == amount + fee, always.
    function _settle(bytes32 dealId, Deal storage d, uint256 payerShare, State finalState, address closedBy)
        internal
    {
        uint256 amount = d.amount;
        uint256 fee = d.fee;
        uint256 payeeShare = amount - payerShare;
        uint256 feeKept = fee * payeeShare / amount;
        uint256 payerGot = payerShare + (fee - feeKept);

        d.state = finalState;
        d.offeredRefund = 0;

        _pay(d.payer, payerGot);
        _pay(d.payee, payeeShare);
        _pay(treasury, feeKept);
        emit DealClosed(dealId, finalState, payerGot, payeeShare, feeKept, closedBy);
    }

    /// @dev Push the payout; if the token refuses (e.g. blocklisted recipient), record it for withdraw().
    function _pay(address to, uint256 amt) internal {
        if (amt == 0) return;
        (bool ok, bytes memory ret) = address(token).call(abi.encodeCall(IERC20.transfer, (to, amt)));
        if (!ok || (ret.length != 0 && !abi.decode(ret, (bool)))) {
            owed[to] += amt;
            emit PaymentDeferred(to, amt);
        }
    }

    /// @notice Claim payouts that could not be pushed earlier. Never paused.
    function withdraw(address to) external nonReentrant {
        uint256 amt = owed[msg.sender];
        if (amt == 0) revert NothingOwed();
        if (to == address(0)) revert ZeroAddress();
        owed[msg.sender] = 0;
        token.safeTransfer(to, amt);
        emit Withdrawn(msg.sender, amt);
    }

    // ----------------------------------------------------------------- admin

    function setFee(uint16 feeBps_) external onlyOwner {
        if (feeBps_ > MAX_FEE_BPS) revert FeeTooHigh();
        feeBps = feeBps_;
        emit FeeChanged(feeBps_);
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        emit TreasuryChanged(treasury_);
    }

    function setMaxDealAmount(uint256 max_) external onlyOwner {
        if (max_ == 0 || max_ > hardCap) revert AmountTooLarge();
        maxDealAmount = max_;
        emit MaxDealChanged(max_);
    }

    /// @notice Pauses NEW deals only. Existing deals keep every path open.
    function setNewDealsPaused(bool paused) external onlyOwner {
        newDealsPaused = paused;
        emit NewDealsPaused(paused);
    }

    function proposeArbiter(address arbiter_) external onlyOwner {
        if (arbiter_ == address(0)) revert ZeroAddress();
        pendingArbiter = arbiter_;
        pendingArbiterAt = uint64(block.timestamp) + ARBITER_TIMELOCK;
        emit ArbiterProposed(arbiter_, pendingArbiterAt);
    }

    function acceptArbiter() external onlyOwner {
        if (pendingArbiter == address(0)) revert NoPendingArbiter();
        if (block.timestamp < pendingArbiterAt) revert TimelockActive();
        arbiter = pendingArbiter;
        pendingArbiter = address(0);
        pendingArbiterAt = 0;
        emit ArbiterChanged(arbiter);
    }

    // --------------------------------------------------------------- helpers

    function _require(bool ok) internal pure {
        if (!ok) revert WrongState();
    }

    function _beforeDeadline(Deal storage d) internal view {
        if (block.timestamp > d.deadline) revert DeadlinePassed();
    }
}
