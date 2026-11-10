# Protected Pay: full build plan

**What this is:** the step-by-step plan for the first feature of the pivot. Protected Pay is a stablecoin payment that sits in escrow with timers, auto-refund rules and a dispute ladder, so either side can pay a stranger safely. WondrPay never holds or controls the money.

**Read with:** [reports/WondrPay founder playbook.md](../../reports/WondrPay%20founder%20playbook.md), parts 3–5 and 7.

**Written against the code as of commit `b4b3144`:**
- `contracts/src/PaymentRouter.sol`
- `MerchantRegistry.sol`
- `Autopay.sol`
- `packages/server` (relayer, refunds, refund-cases on Arkiv, World ID)
- `apps/web` (Next.js, crons in `apps/web/vercel.json`)

---

## 0. Should we start now?

**Yes, with one rule:** build the parts that are useful whatever the user interviews say, and keep the parts the interviews might change as **parameters, not code**.

| Safe to build now (needed in every scenario) | Decide after the 30 interviews (keep configurable) |
|---|---|
| Escrow contract, state machine, tests, audit prep | Default timer lengths (delivery, inspection, response) |
| Gasless fund and actions through the existing relayer | Fee size, and who pays it (buyer, seller or split) |
| Deal page, verified payee card, dispute flow | Telegram bot first, or merchant checkout first |
| Keeper that enforces deadlines | Deal size caps for the beta |

Run the interviews in weeks 1–2 **while** writing the contract. The contract takes 2 weeks anyway, and nothing in it depends on the interview answers.

---

## 1. What we're building: the user story

**Seller (Ravi)** sells a used phone to **buyer (Asha)**, a stranger from a Telegram group.

1. Ravi opens WondrPay (or the Telegram bot) and creates a deal: *"Pixel 7, 180 USDT, I'll deliver within 3 days."* He signs one message. This is his **offer**. He gets a link and a QR.
2. Asha opens the link and sees a **verified payee card**:
   - ✓ ravi.wondrpay.eth
   - ✓ verified human (World ID)
   - account 4 months old
   - 12 protected deals, 0 disputes lost
   - usually responds in 2 h
3. Asha taps **Pay protected**: 180 USDT plus a 0.90 USDT protection fee. She signs one message, with no gas and no WBT. The money goes into the **escrow contract**, not to Ravi and not to WondrPay.
4. Ravi ships and taps **Mark delivered**. That starts Asha's **inspection window** (3 days).
5. Then one of four things happens:
   - **Asha taps "Received, all good":** Ravi gets 180 USDT immediately.
   - **Asha does nothing for 3 days:** the money releases to Ravi automatically.
   - **Ravi never marks delivered by day 3:** Asha is refunded automatically.
   - **Asha opens a dispute:** Ravi has 3 days to answer.
     - If he **agrees**, Asha is refunded.
     - If he **offers part**, Asha can accept the partial refund or escalate.
     - If he **ignores it**, Asha is refunded automatically.
     - If he **contests it**, the arbiter (the WondrPay desk) decides a split within 7 days. If the arbiter doesn't decide in time, Asha is refunded.
6. Every step leaves a receipt anyone can check: on-chain events plus Arkiv entries.

**What WondrPay can never do:**
- take the money
- send it anywhere except to the payer, the payee or the fee treasury
- stop a deadline from paying out

---

## 2. Architecture

```
            ┌──────────── Telegram bot (notifications, deep links) ────────────┐
            │                                                                  │
 Seller ──► apps/web /deal/new ──► POST /api/deals ──► Arkiv: whitepay.deal (terms, title)
            │        (seller signs EIP-712 Offer in wallet)
 Buyer  ──► apps/web /d/[id] ──► GET /api/deals/[id]  (verified payee card ← reputation indexer)
            │        (buyer signs EIP-3009 receiveWithAuthorization, nonce = dealId)
            └──► POST /api/deals/[id]/fund ──► relayer ──► ProtectedEscrow.fund()  (USDT moves payer → escrow)
 Either ──► POST /api/deals/[id]/act {signed Action} ──► relayer ──► ProtectedEscrow.actWithSig()
 Anyone ──► cron /api/deals/tick ──► ProtectedEscrow.poke(dealId)  (enforces expired deadlines)
 Dispute messages and evidence ──► Arkiv: whitepay.dealevt (immutable, burn-owned, party-signed)
```

**Principles, all already used in `PaymentRouter`:**
1. **Signatures bind everything.** The buyer's EIP-3009 nonce equals the deal ID, which is the EIP-712 hash of the seller's offer. A signature can fund only that exact deal.
2. **The relayer is a convenience, not a gatekeeper.** Every action can also be sent directly by the party, or by anyone once a deadline has passed. If WondrPay disappears, the money still moves according to the rules.
3. **Pausing stops only *new* deals.** Releases, refunds and deadline enforcement never pause.
4. **No upgrade key. The admin can't touch funds.**

---

## 3. The smart contract: `contracts/src/ProtectedEscrow.sol`

### 3.1 State machine

| State | Meaning | Next states |
|---|---|---|
| `None` | Deal doesn't exist | `Funded` |
| `Funded` | Money in escrow, waiting for delivery | `Delivered`, `Refunded` (seller cancels, mutual cancel, or delivery deadline missed), `Released` (buyer releases early) |
| `Delivered` | Seller marked delivered, inspection window running | `Released` (buyer confirms, or window ends), `Disputed` |
| `Disputed` | Buyer opened a dispute, seller must respond | `Refunded` (seller agrees, or seller silent past deadline), `Settled` (buyer accepts partial offer), `Escalated` (seller contests, or buyer rejects partial) |
| `Escalated` | Arbiter must rule | `Settled` (arbiter split), `Refunded` (arbiter silent past deadline) |
| `Released` / `Refunded` / `Settled` | Final. Money paid out. | — |

### 3.2 Data types

```solidity
enum State { None, Funded, Delivered, Disputed, Escalated, Released, Refunded, Settled }

/// Signed by the PAYEE (seller). The deal link carries this plus the signature.
struct Offer {
    address payee;          // who gets paid
    address payer;          // address(0) = anyone may fund (open link); else only this buyer
    uint256 amount;         // USDT base units (6 decimals), excluding fee
    uint32  deliverWithin;  // seconds after funding by which payee must mark delivered
    uint32  inspectFor;     // seconds the payer has after delivery to dispute
    uint32  respondWithin;  // seconds the payee has to answer a dispute
    uint64  offerExpiry;    // offer can't be funded after this (unix seconds)
    bytes32 offerId;        // random salt, also links to the Arkiv deal entity
}

struct Deal {                // packed into 4 storage slots
    address payer;
    uint64  fundedAt;
    uint32  deliverWithin;
    address payee;
    uint64  deadline;        // the current active deadline (meaning depends on state)
    uint32  inspectFor;
    uint128 amount;
    uint128 fee;             // fee snapshot at funding time
    uint32  respondWithin;
    State   state;
    uint128 offeredRefund;   // payee's partial refund offer, while Disputed
}

/// Signed by a party for gasless actions.
struct Action {
    bytes32 dealId;
    uint8   kind;            // see ActionKind
    uint128 amount;          // used by OfferPartial / Rule
    uint256 nonce;           // per-signer, sequential
    uint64  validBefore;
}
enum ActionKind { MarkDelivered, Release, OpenDispute, AgreeRefund, OfferPartial,
                  AcceptPartial, Contest, Escalate, CancelBySeller, Rule }
```

**EIP-712 domain:** `name = "WondrPayEscrow"`, `version = "1"`, chainId, verifying contract.

**Type strings:** copy them exactly into `packages/shared`.

```
Offer(address payee,address payer,uint256 amount,uint32 deliverWithin,uint32 inspectFor,uint32 respondWithin,uint64 offerExpiry,bytes32 offerId)
Action(bytes32 dealId,uint8 kind,uint128 amount,uint256 nonce,uint64 validBefore)
```

### 3.3 Constants and admin settings

| Name | Value | Who can change it | Why |
|---|---|---|---|
| `MAX_FEE_BPS` | 200 (2%) | immutable | The fee can never be raised past 2% |
| `feeBps` | 50 (0.5%) | owner, ≤ `MAX_FEE_BPS` | Snapshotted per deal at funding, so changes never hit existing deals |
| `treasury` | WondrPay fee wallet (Safe) | owner | Where fees go |
| `arbiter` | WondrPay dispute desk (Safe, 2-of-3) | owner, through a **2-day timelock** (`proposeArbiter` → `acceptArbiter`) | Users can see a change coming |
| `ARBITER_WINDOW` | 7 days | immutable | The arbiter must rule within this |
| `maxDealAmount` | 200 USDT during beta | owner, ≤ `HARD_CAP` (immutable, e.g. 10,000 USDT) | Limits damage while the contract is new |
| Bounds for `deliverWithin` | 1 h – 30 days | immutable | Stops absurd timers |
| Bounds for `inspectFor` | 1 h – 14 days | immutable | |
| Bounds for `respondWithin` | 24 h – 7 days | immutable | The seller always gets at least a day to answer |
| `newDealsPaused` | false | owner | Stops only `fund*()` |

**What the owner can NOT do:**
- move funds
- change a funded deal
- pause releases, refunds or `poke`
- upgrade the contract

Write this list in the README and the natspec.

### 3.4 Functions (every check, in order)

#### Funding

**`fund(Offer o, bytes payeeSig, Auth a) → bytes32 dealId`**

This is the gasless path: the buyer signed EIP-3009, and anyone (normally the relayer) submits it. The checks, in order:

1. `!newDealsPaused`
2. `o.amount > 0`, `o.amount <= maxDealAmount`, and `o.amount + fee <= type(uint128).max`
3. `block.timestamp <= o.offerExpiry`
4. The timers are within the bounds in 3.3.
5. `o.payee != address(0)`, and `o.payee != a.from` (no self-deals).
6. `o.payer == address(0) || o.payer == a.from`
7. `dealId = hashOffer(o)`, and `deals[dealId].state == None`, so one offer funds one deal.
8. `SignatureChecker.isValidSignatureNow(o.payee, dealId, payeeSig)`. This supports smart-wallet (ERC-1271) sellers.
9. `fee = o.amount * feeBps / 10_000`. Round down, so the payer is never overcharged.
10. **Effects:** write the `Deal` with `state = Funded`, `deadline = now + deliverWithin`, and the timer and fee snapshots.
11. **Interaction:** `usdt.receiveWithAuthorization(a.from, address(this), o.amount + fee, a.validAfter, a.validBefore, dealId, v, r, s)`
12. Emit `DealFunded(dealId, offerId, payer, payee, amount, fee, deadline)`.

**`fundWithPermit(Offer o, bytes payeeSig, Permit p)`**

The same, but with an EIP-2612 permit followed by `transferFrom`. This is the fallback in case mainnet USDT lacks EIP-3009. Confirm with the Whitechain team.

**`fundDirect(Offer o, bytes payeeSig)`**

The payer calls this themselves after `approve`. It's for users with gas who don't want the relayer.

#### Party actions

Each one is a direct call where `msg.sender` must be the right party, plus a shared gasless entry point:

**`actWithSig(Action act, bytes sig)`**

- Recover the signer with `SignatureChecker` against the expected party for `act.kind`.
- Require `act.nonce == nonces[signer]`, then `nonces[signer]++`.
- Require `block.timestamp <= act.validBefore`.
- Dispatch to the internal function.

| Function | Who | Allowed in state | Effect |
|---|---|---|---|
| `markDelivered` | payee | `Funded`, before `deadline` | → `Delivered`, `deadline = now + inspectFor` |
| `release` | payer | `Funded` or `Delivered` | → `Released`: pay the payee everything, the treasury the fee |
| `openDispute` | payer | `Delivered`, before `deadline` | → `Disputed`, `deadline = now + respondWithin` |
| `agreeRefund` | payee | `Funded`, `Delivered` or `Disputed` | → `Refunded`: the payer gets amount + fee back |
| `cancelBySeller` | payee | `Funded` | Same as `agreeRefund` (the seller can't deliver) |
| `offerPartial(r)` | payee | `Disputed`, before `deadline`, `0 < r < amount` | Store `offeredRefund = r`. The state stays `Disputed`, and the deadline restarts at `now + respondWithin` so the payer has time to answer. |
| `acceptPartial` | payer | `Disputed` with `offeredRefund > 0` | → `Settled`: the payer gets `r`, the payee gets `amount − r`, and the fee is pro-rated (3.5) |
| `contest` | payee | `Disputed`, before `deadline` | → `Escalated`, `deadline = now + ARBITER_WINDOW` |
| `escalate` | payer | `Disputed` with `offeredRefund > 0` (rejecting the partial) | → `Escalated`, `deadline = now + ARBITER_WINDOW` |
| `rule(payerShare)` | arbiter | `Escalated`, before `deadline`, `payerShare <= amount` | → `Settled` with that split |

#### Deadline enforcement

**`poke(bytes32 dealId)`**: anyone can call it, and it's never paused.

| State | When `now > deadline`, the outcome is | Why |
|---|---|---|
| `Funded` | **Refunded** | The seller didn't deliver in time |
| `Delivered` | **Released** | The buyer didn't complain in time |
| `Disputed`, no partial offer | **Refunded** | The seller ignored the dispute |
| `Disputed`, partial offer pending | **Settled at the offered split** | The buyer ignored a partial offer. Silence counts as acceptance, mirroring "silence = release". |
| `Escalated` | **Refunded** | The arbiter failed; the buyer is protected. The protection fund can make the seller whole off-chain. |

Write the "partial offer, buyer silent" rule into the rulebook text so users know it.

### 3.5 Money maths (one internal function, `_settle(dealId, payerShare)`)

The fee is charged only on what the seller actually ends up receiving, so a refunded buyer pays nothing for a deal that failed:

```
payeeShare  = amount − payerShare
feeKept     = fee * payeeShare / amount           // rounds down
payerGets   = payerShare + (fee − feeKept)        // the unused fee goes back to the payer
payeeGets   = payeeShare
treasuryGets= feeKept
```

- **Invariant:** `payerGets + payeeGets + treasuryGets == amount + fee`. Assert it in tests (fuzz it).
- **Release:** `payerShare = 0`, so the payee gets the full amount and the treasury the full fee.
- **Full refund:** `payerShare = amount`, so the payer gets amount + fee back and the treasury gets 0.

### 3.6 Paying out safely (USDT can blocklist addresses)

If `transfer` to a blocklisted payee reverts, the whole deal would be stuck forever. Use **"push, and fall back to pull"**:

```solidity
function _pay(address to, uint256 amt) internal {
    if (amt == 0) return;
    (bool ok, bytes memory ret) = address(usdt).call(abi.encodeCall(IERC20.transfer, (to, amt)));
    if (!ok || (ret.length != 0 && !abi.decode(ret, (bool)))) {
        owed[to] += amt;                    // claim later with withdraw()
        emit PaymentDeferred(to, amt);
    }
}
function withdraw() external nonReentrant { uint256 a = owed[msg.sender]; owed[msg.sender] = 0; usdt.safeTransfer(msg.sender, a); }
```

Settlement always sets the final state **before** any `_pay` call (checks, then effects, then interactions), and every external entry point is `nonReentrant`.

### 3.7 Events (the indexer and receipts depend on these)

```
DealFunded(dealId, offerId, payer, payee, amount, fee, deliverBy)
Delivered(dealId, inspectUntil)
DisputeOpened(dealId, respondBy)
PartialOffered(dealId, refundAmount, respondBy)
Escalated(dealId, ruleBy, byPayer)
DealClosed(dealId, State finalState, payerGot, payeeGot, feeKept, closedBy)   // one event for all endings
PaymentDeferred(to, amount)
FeeChanged / TreasuryChanged / ArbiterProposed / ArbiterChanged / MaxDealChanged / NewDealsPaused
```

### 3.8 Errors

Use named custom errors. The web app maps each one to a friendly sentence in `apps/web/lib/errors.ts`; the "Never show raw errors" commit started this pattern.

`Paused, ZeroAmount, AmountTooLarge, OfferExpired, BadTimer, SelfDeal, WrongPayer, AlreadyFunded, BadPayeeSignature, BadSignature, BadNonce, ActionExpired, NotParty, WrongState, DeadlinePassed, DeadlineNotPassed, BadSplit, TimelockActive`

### 3.9 Gas and size targets

- `fund` under 150k gas; any single action under 80k.
- Keep the `Deal` in 4 slots, as packed above.
- No loops over user data anywhere.

---

## 4. Contract tests: `contracts/test/ProtectedEscrow.t.sol`

Reuse the mocks in `contracts/test/mocks`, which include the EIP-3009 USDT mock already used by the PaymentRouter tests. Target **80+ tests**, and keep them all green in CI (`.github/workflows`).

### 4.1 Happy paths (one test each)

1. Fund, then buyer releases early.
2. Fund, mark delivered, buyer releases.
3. Fund, mark delivered, the inspection window ends, `poke` releases.
4. Fund, the seller misses the delivery deadline, `poke` refunds (including the fee).
5. Fund, seller cancels, buyer refunded.
6. Delivered, dispute, seller agrees, refunded.
7. Delivered, dispute, partial offer, buyer accepts, settled split with a pro-rated fee.
8. Delivered, dispute, partial offer, buyer silent, `poke` settles at the offer.
9. Delivered, dispute, seller silent, `poke` refunds.
10. Delivered, dispute, seller contests, arbiter rules 30/70.
11. Delivered, dispute, partial offer, buyer escalates, arbiter rules.
12. Escalated, arbiter silent, `poke` refunds.
13. The open-link offer (`payer = 0`) is funded by any address. A restricted offer is funded only by the named buyer.
14. Every action works through `actWithSig` (gasless) **and** through direct calls.
15. Smart-wallet (ERC-1271) seller signature accepted.
16. `fundWithPermit` and `fundDirect` paths.

### 4.2 Attacks: each must revert or fail safely

- **Signatures:**
  - A signature reused for a second deal fails, because the nonce equals the deal ID.
  - Offer terms changed by one byte (amount, payee, timers) fail with `BadPayeeSignature`.
  - The relayer redirects funds by changing `a.from` or the offer: the 3009 signature check fails.
- **Who may act:**
  - The buyer marks delivered: `NotParty`.
  - The seller releases to themselves: `NotParty`.
  - A stranger calls the arbiter's `rule`: `NotParty`.
- **Timing:**
  - A dispute after the inspection window: `DeadlinePassed`.
  - `poke` before the deadline: `DeadlineNotPassed`.
  - An action whose `validBefore` has passed: `ActionExpired`.
- **Replays and repeats:**
  - An `actWithSig` replay with an old nonce: `BadNonce`.
  - Settling an already-closed deal, through any path: `WrongState`.
  - The same offer funded twice: `AlreadyFunded`.
- **Amounts and limits:**
  - Amounts above the cap: `AmountTooLarge`.
  - A self-deal: `SelfDeal`.
  - Timers outside the bounds: `BadTimer`.
- **Admin powers:**
  - The fee above `MAX_FEE_BPS` reverts.
  - Changing the fee doesn't change an already-funded deal's fee.
  - `pause` blocks `fund*` but **not** `poke`, release, refund, `rule` or `withdraw`.
  - The arbiter change before the 2-day timelock ends: `TimelockActive`.
- **Hostile tokens and callers:**
  - A blocklisted payee: payout is deferred to `owed`, and the deal still closes and `withdraw` works. Use a mock token that reverts transfers to a flagged address.
  - Reentrancy through a malicious token (mock) is blocked.

### 4.3 Fuzz and invariant tests

- **Fuzz `_settle`:** for any `amount` in [1, cap], any `feeBps` in [0, 200] and any `payerShare` in [0, amount], the three payouts sum exactly to `amount + fee`, and none is negative.
- **Fuzz timers and amounts** through full lifecycles.
- **Invariant (handler-based, random sequences of actions and time jumps):**
  - The escrow's USDT balance is at least the sum of (`amount + fee`) for all open deals, plus the sum of `owed`.
  - A closed deal never changes again.
  - Total paid out never exceeds total funded.

### 4.4 Fork test

- Fork **Whitechain Sepolia** with `forge test --fork-url whitechain_sepolia` and use the real USDT `0xcedf…55a7`.
- Run one full lifecycle with real EIP-3009 signatures.
- Repeat this on mainnet once the official USDT address is known.

### 4.5 Static analysis (before the audit)

- Run `slither .` and `aderyn .`, and fix or explain every finding in `contracts/AUDIT_NOTES.md`.
- Run `forge coverage`. Target 100% of lines in `ProtectedEscrow.sol`.
- Save the `forge test --gas-report` snapshot to `contracts/.gas-snapshot`.

---

## 5. Shared package: `packages/shared/src/escrow.ts` (new, exported from index)

- `ESCROW_ADDRESS` (per chain, the same pattern as `ROUTER_ADDRESS`).
- `ESCROW_ABI`: generate it from `contracts/out` and don't hand-type it. Add a script `scripts/abi-sync.ts` that copies the ABI into `packages/shared/src/abi/ProtectedEscrow.ts`.
- `escrowDomain(address)`, `OFFER_TYPES` and `ACTION_TYPES`, matching the Solidity type strings exactly. A unit test hashes one sample offer in TS and compares it with `hashOffer` from a forge script output.
- `ActionKind` enum (same order as Solidity) and `DealState` enum.
- `DEAL_DEFAULTS`: `{ deliverWithin: 3d, inspectFor: 3d, respondWithin: 3d }`. These are the interview-dependent values.
- `DEAL_BOUNDS`, mirroring the contract.
- `dealFee(amount, feeBps)` and `splitPreview(amount, fee, payerShare)`. These mirror 3.5 exactly so the UI shows the same numbers the contract will pay.
- Message builders for off-chain signed Arkiv events: `dealEventMessage({dealId, kind, text, evidence, issuedAt})`.

---

## 6. Arkiv data: `packages/shared/src/arkiv.ts`

Add two schemas, following the existing `Receipt` and `RefundEvent` patterns.

**`whitepay.deal`** stores the human-readable terms. It's written when the offer is created and owned by the WondrPay writer.

| Field | Type | Notes |
|---|---|---|
| `offerId` | bytes32 | Matches the on-chain offer |
| `dealId` | bytes32 | Hash of the offer, known before funding |
| `payee` | address | Indexed, for "my deals" |
| `payer` | address | 0 if open |
| `title` | string ≤ 80 | "Pixel 7, 128GB" |
| `details` | string ≤ 1,000 | Condition, what's included |
| `image` | Swarm reference (optional) | Encrypt it if private; never store an encrypted Swarm reference in a public entity |
| `amount` | string | Display only. The contract is the source of truth. |
| `terms` | JSON | deliverWithin, inspectFor, respondWithin, offerExpiry |
| `payeeSig` | bytes | So anyone can rebuild and verify the offer |
| Expiry | offerExpiry + 60 days | |

**`whitepay.dealevt`** is the dispute conversation. Copy `refund-cases.ts` closely:
- Each event is immutable and moved to the burn owner.
- Each is signed by the acting party: `opened`, `message`, `evidence`, `partial_offer`, `contest`, `ruling_note`.
- The arbiter's ruling note links to the `rule` transaction.

**Privacy rule (answering the LinkedIn comment):**
- Deal entities store **no personal data** beyond the ENS name the user chose.
- Evidence files go to Swarm *encrypted*, and the key is shared only with the arbiter and the parties, inside an encrypted payload.
- In a later phase, use a fresh receive address per deal (see 13).

---

## 7. Server: `packages/server/src/deals.ts` (new)

| Function | What it does | Reuse |
|---|---|---|
| `createDeal({offer, payeeSig, title, details, image})` | Checks the signature off-chain (viem `verifyTypedData`), timer bounds, amount ≤ cap and expiry in the future, then writes `whitepay.deal`. Returns `{dealId, link: /d/<dealId>}`. | `clients.ts` arkiv writer |
| `getDeal(dealId)` | Merges the on-chain `deals(dealId)`, the Arkiv terms and recent `dealevt`s into one object for the UI | `cache.ts` |
| `relayFund({dealId, auth})` | Loads the offer and simulates `fund` with `eth_call` first. It refuses if the buyer's balance is below `amount + fee` or the auth window exceeds 1 h, and checks the per-payer, per-IP and daily limits. Then it submits through `sendRobust`. | `relayer.ts` (`sendRobust`, `PolicyError`, gas price cap, relayer key rotation) |
| `relayAction({act, sig})` | The same simulate-then-send pattern for `actWithSig` | `relayer.ts` |
| `pokeDue()` | The keeper: finds open deals whose `deadline < now` (from the indexer) and calls `poke` for each, at most N per run, oldest first | Same pattern as `/api/refunds/tick` |
| `reputation(address)` | Returns deals completed as payee, deals completed as payer, disputes opened against them, disputes lost (refunded or settled against them after a dispute), median time to `markDelivered`, account age (first receipt), World ID verified, ENS name | Event indexer below, `human.ts`, `ens.ts` |
| `postDealEvent(...)` | Verifies the party signature and writes an immutable `dealevt` | `refund-cases.ts` |

**Event indexer: `packages/server/src/deal-index.ts`**
- Reads the escrow events with `getLogs` in chunks of 2,000 blocks. This is the chunking pattern from `scripts/chain-bench`.
- Stores a cursor (last block) and a compact table: `dealId → state, parties, deadline`.
- Storage for the beta: a small key-value store such as Vercel KV or Upstash Redis.
- It's a cache only. Always re-read `deals(dealId)` on-chain before acting.
- Don't use Arkiv for this index. It's for public, shareable records, not a server cursor.

**Webhooks (merchants later):** add `deal.funded`, `deal.delivered`, `deal.disputed`, `deal.closed` to `webhooks.ts`, signed with HMAC the same way as `order.paid`.

**New environment variables:** add them to `.env.example`; never commit `.env`.

| Variable | Purpose |
|---|---|
| `ESCROW_ADDRESS` | Optional override of the shared constant |
| `TREASURY_ADDRESS` | For display only |
| `KEEPER_SECRET` | Cron authorisation, the same pattern as the existing tick routes |
| `TELEGRAM_BOT_TOKEN` | Section 9 |
| `TELEGRAM_WEBHOOK_SECRET` | Section 9 |
| `KV_REST_API_URL` | Indexer store |
| `KV_REST_API_TOKEN` | Indexer store |

---

## 8. Web app: `apps/web`

### 8.1 API routes (`apps/web/app/api/deals/...`)

| Route | Method | Body | Returns | Guards |
|---|---|---|---|---|
| `/api/deals` | POST | `{offer, payeeSig, title, details, image?}` | `{dealId, url, qr}` | Rate limit 10/h per IP and 20/day per payee. Title and details are length-checked and stripped of HTML. |
| `/api/deals?party=0x…` | GET | — | List of deals for that address | — |
| `/api/deals/[id]` | GET | — | Merged deal plus reputation of the counterparty | Cached 10 s |
| `/api/deals/[id]/fund` | POST | `{auth}` (EIP-3009 pieces) | `{txHash, explorer}` | Simulate first. Policy limits from 7. |
| `/api/deals/[id]/act` | POST | `{action, sig}` | `{txHash}` | Simulate first. Nonce read on-chain. |
| `/api/deals/[id]/events` | POST | `{kind, text, evidence?, sig}` | `{key}` | Only the parties or the arbiter. 2 KB text limit. |
| `/api/deals/tick` | GET | — | `{poked: n}` | `KEEPER_SECRET`. Add to `vercel.json` crons. |
| `/api/people/[address]/reputation` | GET | — | Reputation object | Cached 60 s |

**Cron note:** Vercel Hobby crons run once a day, which is fine because deadlines are days long. Anyone can also press **"Enforce deadline"** on the deal page, which calls `poke` through the relayer, so nobody ever waits on the cron.

### 8.2 Pages

**`/deal/new`: the seller creates an offer.**
- Fields:
  - title
  - price in USDT (show the local-currency equivalent with the existing `local-amount.tsx`)
  - details
  - photo (optional)
  - "Deliver within" (chips: 1 day, 3 days, 7 days)
  - "Buyer can check for" (chips: 1, 3, 7 days)
  - "Only this buyer" (optional name or address field; empty means anyone with the link)
- A preview card shows exactly what the buyer will see.
- The **Create protected link** button triggers the EIP-712 `Offer` signature in the wallet, with plain-language text above it: *"You're promising to deliver within 3 days. If you don't, the buyer gets an automatic refund."*
- The result is a share sheet: link, QR (reuse `api/qr`), "Share to Telegram" and "Share to WhatsApp" buttons.

**`/d/[dealId]`: the deal page, for both parties and the public.**
- At the top is the **verified payee card** (8.3).
- Below it are the terms, price, fee line (*"Protection fee 0.90 USDT, refunded if the deal fails"*) and total.
- The buyer action is **Pay protected**. It uses the existing wallet and PIN flow (`components.tsx` UnlockSheet), signs EIP-3009, then calls `fund`.
- A **status timeline** (reuse the `refund-timeline.tsx` style) shows Funded, then Delivered, then Released, with live countdowns to each deadline.
- **Buttons by role and state (only valid ones are shown):**
  - Seller: **Mark delivered**, **Cancel and refund**, **Agree to refund**, **Offer partial refund**, **Contest**.
  - Buyer: **Received, release payment**, **Something's wrong**, **Accept offer**, **Escalate**.
  - Anyone, after a deadline: **Enforce deadline**.
- **The dispute thread:** messages and evidence from `dealevt`, each with a "signed by" tick.
- **Receipts:** the explorer link for every transaction, plus the Arkiv entity links.

**`/deals`: my deals.** Tabs for Selling, Buying and Needs action. A badge on the home screen shows the count needing action. Reuse the `due-banner.tsx` pattern.

**`/arbiter` (internal, gated to the arbiter Safe owners):**
- A queue of `Escalated` deals, sorted by time left.
- Each item shows both sides' messages and evidence, the parties' reputations, and the amount.
- A split slider and a written reason (stored as `ruling_note`).
- **Rule** creates a Safe transaction for 2-of-3 approval.
- **The service-level target is to rule within 72 h**, well inside the 7-day hard limit.

### 8.3 The verified payee card (a reusable component, `apps/web/app/payee-card.tsx`)

It shows, in this order, with the data source in brackets:

1. Name and avatar [ENS: `ens.ts`, `avatar-rings.tsx`]
2. ✓ Verified human [World ID: `human.ts`]. If not verified, show "Not verified" in neutral grey, never red.
3. "On WondrPay since Jul 2026" [first receipt]
4. "12 protected deals, 0 disputes lost" [reputation]
5. "Usually delivers in 1 day" [median time to `markDelivered`]
6. A warning row if the account is under 7 days old or has a recent lost dispute: *"New account, so consider a shorter delivery window."*

Show the same card everywhere: the send screen, the pay screen and the deal page. This is the "see the name before you pay" UPI feature.

### 8.4 Pre-sign safety check (`apps/web/lib/security.ts`, already exists, so extend it)

Before **any** signature request, decode what's being signed and show one plain sentence:
- Offer: "You promise to deliver *Pixel 7* within 3 days for 180 USDT."
- EIP-3009 to the escrow: "180.90 USDT goes into protection. It's released to ravi.wondrpay.eth only when you confirm, or if you don't report a problem in time."
- Action: "Release 180 USDT to ravi.wondrpay.eth now. This can't be undone."

Hard-block these, with an explanation:
- `approve` of unlimited amounts
- Permit2 batch approvals
- typed data whose `verifyingContract` isn't one of our contracts or USDT

### 8.5 Copy rules (keep it simple)

- Never say "escrow contract" in the UI. Say "protection". Say "money is held safely until you confirm".
- Always show *who* gets money, *how much*, and *when it happens automatically*.
- Every countdown has a sentence: "If you do nothing, the payment goes to Ravi in 2 days 4 hours."

---

## 9. Telegram bot (distribution engine): `apps/web/app/api/telegram/route.ts`

**Library:** grammY, in webhook mode on the existing Vercel app. No separate server.

**Linking an account:**
1. `/start` replies with a button to `/you?tg=<one-time code>`.
2. The web app asks the user to sign `telegramLinkMessage({tgUserId, address, issuedAt})`.
3. The server stores `tgUserId ↔ address` in KV.

Never ask for a key or PIN in Telegram.

| Command or event | What happens |
|---|---|
| `/new 180 Pixel 7, deliver 3d` | The bot replies with a button "Create protected link", which opens `/deal/new` prefilled. Signing always happens in the web app or wallet, never in Telegram. |
| Seller shares the link in a group | The bot (if added to the group) posts a **preview card**: title, price, the seller's verified badge, deals done, and a "Pay protected" button |
| Deal funded | DM the seller: "Asha paid 180 USDT into protection. Deliver within 3 days. [Mark delivered]" |
| Deal delivered | DM the buyer: "Ravi marked it delivered. Check it within 3 days. [All good] [Something's wrong]" |
| Dispute opened | DM the seller: "Asha reported a problem. Answer within 3 days or she gets an automatic refund. [Open]" |
| 24 h before any deadline | A reminder to whoever must act |
| Deal closed | DM both sides the outcome and a receipt link |
| `/deals` | List open deals with deep links |
| `/rep @name` | Show the verified payee card for an ENS name |

- Every button deep-links to `/d/<dealId>`.
- Verify Telegram webhook calls with the `X-Telegram-Bot-Api-Secret-Token` header.
- Rate-limit per chat.

---

## 10. Security and operations checklist (before mainnet)

- [ ] **Rotate every key** used during the hackathon, especially `CUSTOMER_PK`, the relayer keys, `DEPLOYER_PK`, `ORDER_SIGNER_PK` and `ARKIV_WRITER_PK`. Fund fresh keys.
- [ ] **Escrow owner, treasury and arbiter are each a Safe multisig, 2-of-3,** with keys on hardware wallets held by different people. First check that Safe is deployed on Whitechain mainnet. If it isn't, deploy the Safe singleton and factory with Safe's official deployment tooling, or use a minimal audited multisig.
- [ ] **Relayer wallet:**
  - It holds at most a few days of WBT gas.
  - It's topped up automatically from a cold wallet.
  - An alert fires when it falls below a threshold.
  - The existing `maxGasPrice` cap and the per-IP and per-payer limits apply to the new routes.
- [ ] **External audit** of `ProtectedEscrow.sol`. Freeze the code first, and give the auditor:
  - the spec (sections 3–4 of this document)
  - test results and coverage
  - the slither and aderyn notes

  Ask the Whitechain Builders Program about audit funding. Don't deploy to mainnet with real users until the critical and high findings are fixed and re-reviewed.
- [ ] **Bug bounty** on Immunefi after launch, sized to the beta caps.
- [ ] **Monitoring:**
  - Sentry on the web and API.
  - An uptime check on `/api/deals/tick` and the relayer.
  - An on-chain watcher that alerts on any `PaymentDeferred` or `ArbiterProposed` event, and on any deal past its deadline for more than 24 h (meaning the keeper failed).
- [ ] **Incident runbook** in `docs/protected-pay/RUNBOOK.md`:
  - who is on call
  - how to pause new deals (Safe transaction)
  - how to communicate on Telegram and X
  - Remind everyone that **existing deals keep working while paused**.
- [ ] **Legal opinion** on the escrow and relayer as non-custodial, and **published rules** at `/rules`, a plain-language rulebook: timers, fee, silence rules and the arbiter's service level.
- [ ] **Terms of service and privacy policy** pages.
- [ ] **Sanctions screening:** check both parties against a sanctions list (Chainalysis free API) at funding, and refuse to relay if either matches.

---

## 11. Deployment steps

1. `forge build` and `forge test`, then the fork test, then coverage, slither and aderyn.
2. **Testnet:** add a `DeployEscrow` contract to `contracts/script/Deploy.s.sol` with arguments `(usdt, owner Safe, treasury Safe, arbiter Safe, feeBps=50, maxDeal=200e6)`. Run it on Whitechain Sepolia.
3. Verify on Blockscout. The command is in `contracts/foundry.toml`.
4. Write the address and transaction into `deployments/1874.json` under `contracts.ProtectedEscrow`, and update `ESCROW_ADDRESS` in shared.
5. Run the full lifecycle script `scripts/protected-demo.ts`, modelled on `scripts/lifecycle-demo.ts`. It should cover:
   - fund, deliver, release
   - fund, dispute, partial, accept
   - fund, seller silent, then `poke`

   Record the transaction links in the README.
6. Run the internal dogfood: the team does 20 real deals on testnet.
7. **Mainnet (after the audit):**
   - Deploy with the official mainnet USDT. Re-check EIP-3009 support and the 16.7M gas cap.
   - Write `deployments/1875.json`.
   - Run the private beta with `maxDealAmount = 200 USDT`.

---

## 12. Six-week schedule

### Week 1: contract core (and start the interviews)
- **Day 1:**
  - Write `ProtectedEscrow.sol`: types, storage, constructor, admin with timelock, `hashOffer`, `fund`.
  - Interview script ready, and the first 5 interviews booked.
- **Day 2:** `_settle`, `_pay` with the pull fallback, `withdraw`, `release`, `agreeRefund`, `cancelBySeller`.
- **Day 3:** `markDelivered`, `openDispute`, `offerPartial`, `acceptPartial`, `contest`, `escalate`, `rule`, `poke`.
- **Day 4:** `actWithSig` with per-signer nonces, `fundWithPermit`, `fundDirect`, events, errors, natspec.
- **Day 5:** happy-path tests 1–16.

### Week 2: break it
- **Days 6–7:** all the attack tests in 4.2.
- **Day 8:** fuzz and invariant tests, then hit coverage 100%.
- **Day 9:** fork test on Whitechain Sepolia, slither and aderyn, `AUDIT_NOTES.md`, gas snapshot.
- **Day 10:** deploy to testnet and verify; `abi-sync`; shared `escrow.ts` with the typed-data hash parity test.
- **By now:** 15–20 interviews done. Set `DEAL_DEFAULTS` and the fee from them.

### Week 3: server and API
- **Day 11:** `deals.ts` (`createDeal`, `getDeal`) and the Arkiv `whitepay.deal` schema.
- **Day 12:** `relayFund` and `relayAction` with simulation and policy limits.
- **Day 13:** `deal-index.ts` (getLogs plus KV cursor) and `reputation()`.
- **Day 14:** `/api/deals/*` routes, the `tick` cron and `whitepay.dealevt` dispute events.
- **Day 15:** `scripts/protected-demo.ts`, an end-to-end run on testnet with transaction links.

### Week 4: web app
- **Day 16:** `payee-card.tsx`, and wire it into send, pay and deal screens.
- **Day 17:** `/deal/new` with the signing copy and share sheet.
- **Day 18:** `/d/[id]` (pay, timeline, role-based buttons, countdowns).
- **Day 19:** the dispute thread, partial-offer UI and `/deals` list with the needs-action badge.
- **Day 20:** extend the pre-sign safety check, map the error messages, and run the whole flow on a phone (MetaMask and WalletConnect).

### Week 5: Telegram, arbiter desk and dogfood
- **Day 21:** bot webhook, account linking, deal notifications.
- **Day 22:** group preview cards and deadline reminders.
- **Day 23:** the `/arbiter` desk with Safe transaction creation.
- **Days 24–25:**
  - Team dogfood: 20 deals including every dispute path.
  - Fix everything.
  - Write `/rules`, and draft the terms of service and privacy policy.

### Week 6: audit prep and beta prep
- **Day 26:** freeze the contract, send it to the auditor (or start the grant-funded audit), and submit the Whitechain Builders application with a demo video.
- **Days 27–28:** monitoring, alerts, runbook, key rotation, Safes created.
- **Day 29:** recruit the first 20 beta users from the interviewees and Telegram groups.
- **Day 30:** testnet beta live with real people while the audit runs. Mainnet follows the audit.

**Definition of done for Protected Pay v1:**
1. Every path in the state machine works on testnet through the UI, the API and direct contract calls.
2. 80+ tests pass, with 100% line coverage of the contract and the invariants holding.
3. A stranger can create, share, pay, deliver and dispute **without help**. Test with 3 non-team users.
4. Deadlines are enforced by the cron *and* by the "Enforce deadline" button.
5. The audit is done and its findings fixed before any mainnet money.

---

## 13. Deliberately NOT in v1 (write these down so nobody sneaks them in)

- **Multi-chain** (Base and CCTP): v2, after the beta shows demand.
- **Kleros or UMA escalation:** v2. The arbiter is our Safe in v1, and that's disclosed in `/rules`.
- **Bonded sellers and a protection fund that pays beyond the escrow:** v2, once there's fee revenue.
- **Fresh address per deal (privacy):** v2. Requires a smart-account or stealth-address design.
- **A token, staking or yield:** not planned.
- **Merchant cart checkout through escrow:** v1.5. The same contract, with offers created by the merchant's backend signer.

---

## 14. Files touched (checklist)

**New**
- `contracts/src/ProtectedEscrow.sol`
- `contracts/test/ProtectedEscrow.t.sol` (with `mocks/BlocklistUSDT.sol`, `mocks/Smart1271Wallet.sol`)
- `contracts/test/ProtectedEscrow.invariant.t.sol`
- `contracts/AUDIT_NOTES.md`
- `packages/shared/src/escrow.ts`
- `packages/shared/src/abi/ProtectedEscrow.ts`
- `scripts/abi-sync.ts`
- `packages/server/src/deals.ts`
- `packages/server/src/deal-index.ts`
- `apps/web/app/api/deals/**`
- `apps/web/app/api/people/[address]/reputation/route.ts`
- `apps/web/app/api/telegram/route.ts`
- `apps/web/app/deal/new/page.tsx`
- `apps/web/app/d/[id]/page.tsx`
- `apps/web/app/deals/page.tsx`
- `apps/web/app/arbiter/page.tsx`
- `apps/web/app/payee-card.tsx`
- `apps/web/app/rules/page.tsx`
- `scripts/protected-demo.ts`
- `docs/protected-pay/RUNBOOK.md`

**Changed**
- `contracts/script/Deploy.s.sol`
- `deployments/1874.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/arkiv.ts` (`whitepay.deal`, `whitepay.dealevt`)
- `packages/server/src/index.ts`
- `packages/server/src/webhooks.ts`
- `apps/web/lib/security.ts`
- `apps/web/lib/errors.ts`
- `apps/web/vercel.json` (cron)
- `.env.example`
- `README.md` (architecture, contract addresses, trust model, limitations)
