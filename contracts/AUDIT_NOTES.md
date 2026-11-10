# ProtectedEscrow: audit notes

These notes cover `src/ProtectedEscrow.sol`, the WondrPay Protected Pay escrow. The full specification is [docs/protected-pay/BUILD_PLAN.md](../docs/protected-pay/BUILD_PLAN.md), sections 3–4.

## Test evidence (10 Nov 2026)

| Check | Result |
|---|---|
| Unit and attack tests (`test/ProtectedEscrow.t.sol`) | 69 passed |
| Fuzz test on money conservation (`testFuzz_settleConservesMoney`) | Passed, 256 runs |
| Invariant tests (`test/ProtectedEscrow.invariant.t.sol`) | 4 invariants hold over 256 runs × 500 calls (128,000 random actions, 0 reverts) |
| Fork test on Whitechain Sepolia against the real USDT `0xcedf…55a7` (`test/ProtectedEscrow.fork.t.sol`) | Passed: fund via EIP-3009, deliver, dispute, partial offer, accept |
| Coverage (`forge coverage --ir-minimum`) | 99.55% lines, 99.63% statements, 98.39% branches, 100% functions |
| Gas snapshot | `.gas-snapshot-escrow` |

**Invariants that are checked:**
1. The escrow's token balance equals exactly the `amount + fee` of all open deals.
2. Money in equals money still held plus money paid out (conservation).
3. A closed deal never changes state again.
4. The treasury never receives more than 2% of closed-deal value.

**Uncovered:** one branch, `_pay` when the token returns `false` instead of reverting. USDT reverts, so this is for safety only, and the outcome is the same deferred payout as a revert.

## Static analysis (Slither 0.11, excluding informational findings)

| Finding | Assessment |
|---|---|
| `reentrancy-no-eth` / `reentrancy-benign`: `owed[to]` is written after `token.call` in `_pay` | **Accepted.** The final state and `offeredRefund = 0` are written before any external call. Every external entry point is `nonReentrant`. The token is immutable (USDT). Re-entering `withdraw` is blocked by the guard. |
| `timestamp`: deadlines compared with `block.timestamp` | **By design.** Deadlines are hours to days long. A validator's few seconds of drift doesn't matter. |
| Findings in test mocks | Not in scope |

**Notes from the Foundry linter:**
- **`arbitrary-send-erc20` in `fundWithPermit`:** `transferFrom(p.payer, …)` runs only after the payer's EIP-712 `FundConsent` signature over this exact `dealId` is verified. A leftover allowance can't be hijacked; this is tested in `test_fundWithPermit_leftoverAllowanceCannotBeHijacked`.
- **`unsafe-typecast`:** the `uint128` casts are bounded by `hardCap ≤ type(uint128).max / 2`. The `uint64` timestamp casts are safe until the year 2554.

Aderyn hasn't been run yet; that's a to-do before the external audit.

## Trust model (what the owner can and cannot do)

**The owner can:**
- set the fee, capped at `MAX_FEE_BPS` = 2% and snapshotted per deal
- set the treasury
- set `maxDealAmount`, capped by the immutable `hardCap`
- pause **new** deals
- change the arbiter, with a 2-day timelock

**The owner cannot:**
- move funds
- alter a funded deal
- pause release, refund, `poke`, `rule` or `withdraw`
- upgrade the contract (it isn't upgradeable)

**The arbiter** can only `rule` on `Escalated` deals, within `ARBITER_WINDOW` (7 days), with `payerShare ≤ amount`. If it stays silent, the buyer is refunded.

**The relayer** has no special role. Anyone may submit `fund` or `actWithSig`, and anyone may `poke` after a deadline.

## Design decisions for the reviewer

1. **Deal ID = EIP-712 hash of the seller's `Offer`.** That ID is also the payer's EIP-3009 nonce, so one payer signature can fund only that offer, and an offer can be funded only once.
2. **The fee is charged only on the payee's final share:** `feeKept = fee * payeeShare / amount`, rounded down in the payer's favour. `payerGot + payeeGot + feeKept == amount + fee` always (fuzzed).
3. **Silence rules:**
   - seller late to deliver → refund
   - buyer silent after delivery → release
   - seller silent on a dispute → refund
   - buyer silent on a partial offer → settled at the offer
   - arbiter silent → refund
4. **Push with a fallback to pull:** a recipient the token blocklists doesn't freeze the deal. Their payout is moved to `owed` and claimed with `withdraw(to)`.
5. **`actWithSig` uses one sequential nonce per signer**, shared across all of that signer's deals. Wallets have to sign actions in order; the server reads `nonces(signer)` first.

## Open items before the external audit

- [ ] Run Aderyn.
- [ ] Reduce `fund` gas: currently about 206k, against a 150k target. It's dominated by 4 cold storage slots plus EIP-3009 plus two signature checks.
- [ ] Confirm the **mainnet** USDT address on Whitechain and that it supports EIP-3009, then rerun the fork test on mainnet.
- [ ] Decide the treasury, arbiter and owner Safes (2-of-3), and check that Safe is deployed on Whitechain.
