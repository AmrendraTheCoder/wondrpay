# ProtectedEscrow: audit notes

These notes cover `src/ProtectedEscrow.sol`, the WondrPay Protected Pay escrow. The full specification is [docs/protected-pay/BUILD_PLAN.md](../docs/protected-pay/BUILD_PLAN.md), sections 3–4.

## Deployment

Whitechain Sepolia (chain 1874): `0x6260d61536cbc49AC69DF3edEfc0614D79EDb330`, verified, deployed 11 Nov 2026. It replaces `0x9Ef5…E24d`; the only change is the removal of the unused `fundedAt` storage field (gas). The live demo (`scripts/protected-demo.ts`) passed on the new address: one deal released, one settled with a 40% partial refund, a replayed funding rejected, and buyer and seller paid no gas.

## Test evidence (11 Nov 2026)

| Check | Result |
|---|---|
| Unit and attack tests (`test/ProtectedEscrow.t.sol`) | 72 passed (after the 10 Nov loophole fixes: rules E6, E8, E9, E10 in docs/rules/WONDRPAY_RULES.md) |
| Fuzz test on money conservation (`testFuzz_settleConservesMoney`) | Passed, 256 runs |
| Invariant tests (`test/ProtectedEscrow.invariant.t.sol`) | 4 invariants hold over 256 runs × 500 calls (128,000 random actions, 0 reverts) |
| Fork test on Whitechain Sepolia against the real USDT `0xcedf…55a7` (`test/ProtectedEscrow.fork.t.sol`) | Passed: fund via EIP-3009, deliver, dispute, partial offer, accept |
| Coverage (`forge coverage --ir-minimum`) | 99.55% lines, 99.63% statements, 98.39% branches, 100% functions |
| Gas snapshot | `.gas-snapshot-escrow`. `fund` costs about 186k in tests and 199k live with the real USDT (it was 206k in tests). |

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

## Static analysis (Aderyn 0.6.8, 11 Nov 2026)

88 detectors, **0 high** findings, 5 low:

| Finding | Assessment |
|---|---|
| L-1 Centralization risk (`onlyOwner` setters) | **By design.** See the trust model below: the owner can't move funds or touch funded deals. Owner becomes a 2-of-3 Safe on mainnet. |
| L-2 Large numeric literal (`10_000`) | Style only. Basis points are clearer as `10_000`. |
| L-3 PUSH0 opcode | Whitechain supports it (the contract is deployed and runs). Recheck on any new chain. |
| L-4 Unsafe ERC20 operation in `_pay` | **Intended.** The low-level call checks both the revert and a `false` return, so a blocked recipient falls back to `owed`/`withdraw` instead of freezing the deal. SafeERC20 would revert. |
| L-5 Unspecific pragma (`^0.8.24`) | **To do before the audit:** pin the exact compiler version. |

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

- [x] Run Aderyn (0 high, 5 low, see above).
- [ ] Pin the Solidity pragma to the exact version.
- [x] Reduce `fund` gas: 206k → 186k by dropping `fundedAt`. The 150k target isn't reachable without storing only a hash of the deal (the remaining cost is 3 cold storage slots, the EIP-3009 transfer and two signature checks). Not worth a redesign before the audit; at Whitechain gas prices the difference is a fraction of a cent.
- [ ] Confirm the **mainnet** USDT address on Whitechain and that it supports EIP-3009, then rerun the fork test on mainnet.
- [ ] Decide the treasury, arbiter and owner Safes (2-of-3), and check that Safe is deployed on Whitechain.
