# WondrPay Rules v0.1

**The rulebook for safe stablecoin payments**

*Status: draft open spec. Version 0.1, 10 Nov 2026. Licence: CC BY 4.0 (anyone may adopt it).*

---

## What this document is

UPI works because one rulebook (NPCI's) binds every app and bank:
- you see who you're paying
- a failed payment comes back by T+1
- an AutoPay mandate has caps and can be cancelled in one tap

Stablecoins have the money rails but no rulebook. **WondrPay Rules is that rulebook.** It's written so that:

1. **WondrPay follows it.** Every rule here is enforced in our contracts, our server or our app. Each rule says which.
2. **Any other wallet or shop can follow it too,** with no permission and no fee. A wallet that follows it can show the **"Protected"** badge.
3. **Money rules are enforced by code, not trust.** WondrPay never holds or redirects user funds, so a rule that protects money has to live in a contract anyone can check.

**Every rule has a known way someone could cheat it (a "loophole") and the fix.** Rules that can't be fully fixed yet are marked honestly as open.

### How to read the rule tables

**Each rule has:**
- an **ID**: N = names, H = humans, E = escrow, and so on
- the **rule**
- the **loophole**: how someone could abuse it
- the **fix**
- **where** it's enforced and its **status**

**Where a rule is enforced:**
- **⛓ Contract:** enforced by code on Whitechain. Nobody can bypass it, including WondrPay.
- **🖥 Server:** enforced by the WondrPay API. Another wallet must implement it itself to be compliant.
- **📱 App:** enforced in the user interface, as warnings and confirm screens.
- **📜 Policy:** a commitment written here, checked by audit and public records.

**Status:**
- **✅** live on testnet today
- **🔧** fixed today (10 Nov 2026)
- **🗓** planned, with the version it ships in
- **⚠️** known open gap

**Wording:** MUST, SHOULD and MAY are used as in RFC 2119: MUST is required, SHOULD is strongly recommended, MAY is optional.

---

## 0. Core principles (these never change)

| ID | Principle |
|---|---|
| P0.1 | **Never custodial.** No WondrPay key can move, freeze or redirect a user's funds. Money moves only by the user's own signature, or by a public contract rule anyone can read. |
| P0.2 | **The user signs every leg.** Nothing leaves your wallet without your signature on that exact amount, recipient and purpose. |
| P0.3 | **Rules can't change under a live deal.** Every money contract snapshots its terms at the start. A rule change applies only to new deals. |
| P0.4 | **When the system fails, the payer is protected.** If a deadline passes and the party who had to act didn't, the default favours the party who paid. The one exception is a buyer who stays silent after delivery; see E6. |
| P0.5 | **Everything is checkable.** Every payment, refund and ruling leaves a public, signed record. |
| P0.6 | **Show the human, not the hex.** Before paying, the payer sees a verified name and its trust signals, not a 42-character address. |
| P0.7 | **No rule depends on WondrPay staying alive.** If our servers disappear, every deadline can still be enforced on-chain by anyone. |

---

## 1. Names (pay a name, not an address)

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| N1 | Every user and shop MAY claim one name, such as `ravi.wondrpay.eth`. The name resolves to the wallet that receives money. | **Look-alike names:** `rahul` vs `rahuI` (capital i) or `rаhul` (Cyrillic а), used to trick payers | Names MUST be lowercase `a–z 0–9 -` only (`LABEL_RE`), and ENSIP-15 normalised. 🗓 v0.2: refuse names within edit distance 1 of a verified shop's name. | 🖥 server | ✅ charset · 🗓 look-alike check |
| N2 | Claiming a name needs a verified human (H1). One person gets one personal name. | **Name farming:** one person claims hundreds of names to squat or impersonate | The person's personhood ID (nullifier) is stored with the claim. A second personal claim from the same human is refused, even from a new wallet. | 🖥 server | ✅ |
| N3 | Before every payment the app MUST show the **payee card**: name, verified-human badge, account age, deals done, disputes lost. | **Address swap:** the payer approves "ravi", but the name's address changed a minute ago to an attacker's | The address is resolved **once**, shown, and **bound into the signed payment**: the payer signs the address, not the name. 🗓 v0.2: warn if the name's address changed in the last 7 days. | 📱 app + ⛓ (signature binds the address) | ✅ binding · 🗓 change warning |
| N4 | A name that expires or is released MUST NOT be reassigned for 90 days. | **Expired-name capture:** an attacker grabs a lapsed popular name and receives payments meant for the old owner | 90-day quarantine. Payee cards show "Name owner changed on …" for 180 days after any change of owner. | 🖥 server | 🗓 v0.2 |
| N5 | A shop name shows a **Verified shop** badge only after merchant checks (M1). | Fake "verified" badge copied into a profile picture or display name | The badge is drawn by the app from on-chain registry data (`MerchantRegistry.isVerified`), never from user text. Display names can't contain "✓" or "verified". | ⛓ + 📱 | ✅ registry · 🗓 text filter |

---

## 2. Humans (personhood: one person, one identity)

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| H1 | Some actions need a **verified human**: claiming a name, opening a refund request, payments above the step-up limit (L2), the Protected badge for sellers, and rewards. | **Sybil attack:** one person makes many wallets | Each verification produces a **nullifier**: one fixed ID per person per action, the same across all of that person's wallets. Limits count per nullifier, not per wallet. | 🖥 server | ✅ (World ID) |
| H2 | WondrPay MUST accept more than one personhood provider, so no single company is a gatekeeper. | Single point of failure: one provider goes down or is banned in a country | Accepted providers, all producing a nullifier: World ID ✅; WB Soul (WhiteBIT KYC), Self/zkPassport (passport NFC chip) and Anon Aadhaar 🗓 v0.2. One person verified by two providers is linked, so they don't count twice. | 🖥 server | ✅ World ID · 🗓 others |
| H3 | **Rented or bought verification:** a person sells their verified status to someone else | A real human verifies, then hands the account to a scammer | Step-up re-verification for high-risk actions: a large payment, a first dispute, or a payout-address change. 🗓 v0.2: the badge decays and needs re-verification every 12 months. | 🖥 server | ✅ step-up · 🗓 decay |
| H4 | A verified-human badge is evidence, not a guarantee. Disputes (D-rules) still apply. | Over-trust: "verified" read as "safe" | The payee card shows it as **"Verified human"**, never "Trusted" or "Safe". Reputation (deals and disputes) sits beside it. | 📱 app | ✅ |

---

## 3. Payment requests and QR codes

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| Q1 | A shop's dynamic QR expires in **5 minutes**. An invoice link lasts at most 30 minutes. | **Replay of an old QR:** a screenshot of yesterday's QR is used to charge again | Each request is an Arkiv entity with a short TTL. Its ID is bound into the payment signature, so a paid or expired request can't be paid again. | 🖥 + ⛓ | ✅ |
| Q2 | A QR or link MUST carry a request ID, never a raw address plus amount the scanner trusts blindly. | **QR overlay fraud:** a sticker with the scammer's QR placed over the shop's | The app shows the payee card (N3) from the request's **signed** merchant data. A QR whose signature doesn't match the named shop is refused. | 📱 + 🖥 | ✅ |
| Q3 | **Collect requests** ("Ravi requests 20 USDT from you") MAY be sent only by verified shops, never person to person. | **Collect-request scam,** the reason NPCI banned P2P collect in Oct 2025: "accept to receive money" tricks | Today there is **no collect feature at all**: nobody can pull money or push a "pay me" prompt into your app. 🗓 When shop collect ships: verified shops only, expiry (default 30 min, max 45 days), 10 a day and 25 a week per payee, and the screen says **"You are PAYING"** in red. | 🖥 + 📱 | ✅ none exists · 🗓 shop collect |
| Q4 | A payment request MUST state amount, currency, payee and purpose, and the payer signs all four. | Amount changed between scan and sign (man in the middle) | The signature covers the exact amount and payee. A changed byte means the payment fails on-chain (proven in `test_tamperedOffer_badPayeeSignature`). | ⛓ | ✅ |

---

## 4. Ordinary payments (P2P and shop orders, PaymentRouter)

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| P1 | A shop order is signed by the shop's order signer, and the payer's authorisation is bound to that order's hash. | Relayer or attacker redirects a signed payment to another shop or amount | The payer's EIP-3009 nonce **is** the order hash, so the signature can pay only that order. The contract checks the shop's signature. | ⛓ PaymentRouter | ✅ |
| P2 | An order can be paid once. | Double charge from a re-submitted signature | `OrderAlreadyPaid`, plus EIP-3009 nonces are single-use | ⛓ | ✅ |
| P3 | A P2P send binds recipient and memo into the signature. | Relayer changes the recipient | `directNonce(to, memo)` is in the signature | ⛓ | ✅ |
| P4 | Ordinary payments are **final**. They are not protected. For protection, use Protected Pay (section 5). | Users assume every payment is refundable | The app labels every send **"Not protected"** or **"Protected"** before signing. Paying a stranger without protection shows a warning. | 📱 | 🗓 v0.2 (label) |
| P5 | Only allow-listed relayers may submit router payments. | Griefing or draining the relayer by spamming invalid payments | `relayerGated` plus the relayer's own checks (G1–G4) | ⛓ + 🖥 | ✅ |

---

## 5. Protected Pay (escrow): the heart of the rulebook

*Contract: `ProtectedEscrow`, Whitechain Sepolia `0x9Ef5850b2E526CB9D40784f21B042BDd9aa7E24d` (verified). Spec: [BUILD_PLAN.md](../protected-pay/BUILD_PLAN.md).*

### 5.1 How a deal moves

```
 seller signs offer ─► buyer pays into escrow (Funded)
   Funded ──seller marks delivered──► Delivered ──buyer confirms / silent N days──► Released (seller paid)
   Funded ──seller late / cancels────► Refunded (buyer gets everything back, fee included)
   Delivered ──buyer reports problem─► Disputed
   Disputed ──seller agrees / silent─► Refunded
   Disputed ──seller makes ONE offer─► buyer accepts ─► Settled (split)
                                      buyer rejects / silent ─► Escalated
   Disputed ──seller contests────────► Escalated ──arbiter rules─► Settled ; arbiter silent 7 days ─► Refunded
   At any point: buyer may concede (release) · seller may concede (full refund)
```

### 5.2 The rules

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| E1 | The seller's offer (price, timers, who may pay) is signed, and its hash is the deal ID. | Buyer pays less, or someone changes the timers | Any change gives a different hash, so the seller's signature fails | ⛓ | ✅ |
| E2 | The buyer's payment authorisation is bound to that one deal ID. | A signature for deal A is used to fund deal B | The EIP-3009 nonce equals the deal ID (`test_payerAuthForOtherDeal_cannotFundThisOne`) | ⛓ | ✅ |
| E3 | Each offer funds at most one deal. | Double funding a link | `AlreadyFunded` (also proven live on testnet) | ⛓ | ✅ |
| E4 | Seller and buyer must be different wallets. | **Self-dealing to fake reputation** with two wallets | Contract: `SelfDeal`. Reputation counts a deal only if buyer and seller are **different verified humans** (different nullifiers). Unverified or same-human deals give 0 reputation. | ⛓ + 🖥 | ✅ contract · 🗓 reputation rule |
| E5 | **Delivery deadline:** if the seller doesn't mark delivered in time, the buyer is refunded in full, fee included. | Seller takes the money and vanishes | Anyone can call `poke` after the deadline. No WondrPay action needed. | ⛓ | ✅ |
| E6 | **Inspection window:** after "delivered", the buyer has at least **1 day** (default 3) to report a problem. Silence releases the payment. | **Fake "delivered":** the seller marks delivered without shipping and hopes the buyer misses a short window | 🔧 **Minimum raised from 1 hour to 1 day.** The app sends reminders at the start and 24 h before the end (Telegram, push). The default is 3 days. | ⛓ + 📱 | 🔧 fixed today |
| E7 | Seller must answer a dispute within the response window (1–7 days), or the buyer is refunded. | Seller ignores complaints | Silence means a refund, enforced by `poke` | ⛓ | ✅ |
| E8 | The seller may make **one** partial-refund offer per dispute. | **Endless stalling:** the old version let a seller re-offer forever, restarting the clock each time | 🔧 **Second offer reverts (`OfferAlreadyMade`).** The seller can delay the outcome by at most one extra response window. | ⛓ | 🔧 fixed today |
| E9 | **Buyer silence on a partial offer sends the deal to the arbiter. It never counts as acceptance.** | **Lowball trap:** the seller offers a 1-cent refund, the buyer misses the message, and the seller keeps everything | 🔧 **Silence now escalates to the arbiter instead of accepting.** The arbiter sees the offer and decides (`test_dispute_partialOffered_buyerSilent_escalatesNotAccepted`). | ⛓ | 🔧 fixed today |
| E10 | Either party may **concede** at any time: the buyer can release to the seller, and the seller can refund the buyer. Neither can take money from the other. | Old version: a buyer who changed their mind mid-dispute had to wait for the arbiter | 🔧 Release and full refund are allowed in Disputed and Escalated. The only party who loses money by conceding is the one who concedes (`test_escalated_partiesCannotTakeFromEachOther`). | ⛓ | 🔧 fixed today |
| E11 | **Arbiter deadline:** the arbiter must rule within 7 days, or the buyer is refunded. | Arbiter sits on cases forever | `poke` refunds after `ARBITER_WINDOW`. Our service target is 72 h. | ⛓ + 📜 | ✅ |
| E12 | The arbiter can only split the escrowed money between buyer and seller (0–100%). | Arbiter sends money to itself or a third party | `rule(payerShare)` pays only the payer and payee, with `payerShare ≤ amount` | ⛓ | ✅ |
| E13 | Fee: 0.5%, never above 2%, fixed at the moment the deal is funded, and charged **only on what the seller receives**. | WondrPay raises the fee on live deals, or charges for failed deals | `MAX_FEE_BPS` is immutable. The fee is snapshotted per deal, and a refunded buyer gets the fee back (fuzz-tested). | ⛓ | ✅ |
| E14 | Pausing stops only **new** deals. Release, refund, ruling, `poke` and withdraw can never be paused. | Operator freezes everyone's money ("pause the contract") | None of those functions has a pause check (`test_pause_blocksNewDealsOnly`) | ⛓ | ✅ |
| E15 | If the token refuses a payout (a blocklisted address), the deal still closes and the money waits in `owed` for withdrawal to any address. | One blocked party freezes the other party's money | Push the payment, and fall back to a claim the recipient can make (`test_blocklistedPayee_payoutDeferred_thenWithdrawn`) | ⛓ | ✅ |
| E16 | Gasless actions: each signature is single-use and expires. | Replay of an old "release" signature | Per-signer nonce plus `validBefore` | ⛓ | ✅ |
| E17 | The relayer can't block anyone: every action can also be sent directly from the user's wallet. | Relayer censorship or downtime | Direct functions exist for every action, plus `poke` by anyone | ⛓ | ✅ |
| E18 | Beta cap: 200 USDT per deal, hard ceiling 10,000 USDT. | A bug drains large amounts before it's caught | `maxDealAmount ≤ hardCap` (immutable) | ⛓ | ✅ |
| E19 | **Front-running an open link:** anyone with the link can fund it. | A stranger funds a deal meant for someone else, locking the seller in | The seller MAY restrict the offer to one buyer (`payer` field). An unwanted funding can be cancelled by the seller for a full refund. | ⛓ | ✅ |

---

## 6. Refund requests on ordinary payments (no escrow)

*For payments made without Protected Pay. The money is already with the shop, so these rules rely on the shop's signature plus public pressure.*

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| R1 | A payer may open a refund request with a reason (not received, damaged, not as described, wrong item, duplicate, other) and evidence. | **Refund spam** from many wallets | Opening needs a verified human. At most **3 open requests per human** across all wallets. The shop sees how many requests that **person** filed in the last 30 days. | 🖥 | ✅ |
| R2 | The shop has **7 days** to respond. If unanswered, the request re-opens for another 7 days, up to 8 rounds (8 weeks). | Shop ignores requests | Re-opening keeps the request visible, and ignored requests count against the shop's public reputation. **Limit:** money can't be forced back here because the shop already holds it, so this is pressure, not enforcement. Hence P4: use Protected Pay with strangers. | 🖥 | ✅ · ⚠️ not enforceable |
| R3 | After the shop responds, 12 hours without activity resolves the case. | — | — | 🖥 | ✅ |
| R4 | An approved refund is paid on-chain only to the original payer, capped at what was paid, and can be partial. | Refund to a different address (laundering) or over-refund | `PaymentRouter.refund`: to `payer` only, `refunded + amount ≤ paid` | ⛓ | ✅ |
| R5 | Every case event is immutable: signed by the acting party, written to Arkiv, then ownership is burned so nobody (including WondrPay) can edit or delete it. | WondrPay or a shop rewrites the history | Burn owner `0x…dEaD` plus a party signature on every event | 🖥 + Arkiv | ✅ |

---

## 7. Disputes and the arbiter (escrow deals)

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| D1 | The arbiter is a **2-of-3 multisig** whose signers are different people. The arbiter address is public. | One rogue employee rules in a friend's favour | 2-of-3 Safe on mainnet. On testnet it's the deployer (disclosed). | ⛓ + 📜 | ✅ testnet · 🗓 mainnet Safe |
| D2 | Changing the arbiter takes **2 days** of public notice. | Swap in a corrupt arbiter just before ruling on a big case | `proposeArbiter`, then a 2-day timelock, then `acceptArbiter`, with events | ⛓ | ✅ |
| D3 | Every ruling MUST publish a written reason (as a `ruling_note` on Arkiv) linked to the on-chain transaction. | Secret, inconsistent rulings | Public rulings build a precedent log. Anyone can see whether the arbiter is fair. | 🖥 + 📜 | 🗓 v0.2 |
| D4 | An arbiter signer MUST recuse themselves from a case involving a person they know. | Conflict of interest | Recusal declared in the ruling note. Arbiter signers can't trade on WondrPay with real money during their term. | 📜 | 🗓 v0.2 |
| D5 | **Friendly fraud:** a buyer falsely claims non-delivery | Buyer receives the goods, then disputes to get money back | Evidence requirements (shipping proof wins). A per-human limit on open disputes (R1). Disputes lost count publicly against the buyer's reputation. 🗓 v0.3: a small **dispute deposit**, returned if the buyer wins. | 🖥 | ✅ limits · 🗓 deposit |
| D6 | **Appeal:** for deals above a set amount, either side MAY appeal to an outside court (Kleros or UMA). | WondrPay as sole judge is a single point of trust | v1: WondrPay desk only, disclosed. 🗓 v0.3: external appeal above 500 USDT. | ⛓ | 🗓 |
| D7 | **Evidence forgery:** fake screenshots or fake tracking numbers | — | Evidence is signed by the submitter and stored immutably (R5 pattern). Forgery found means the case is lost and the account is flagged. Tracking numbers are checked against carrier APIs (🗓). | 🖥 | ✅ signing · 🗓 carrier check |

---

## 8. Receipts and privacy

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| C1 | **The chain is the source of truth.** A receipt is valid only if it matches an on-chain event. | **Fake receipt screenshots** ("I paid, look!") | Every receipt shows the transaction link. The app verifies a receipt by reading the chain, never from an image. | 📱 | ✅ |
| C2 | Receipts on Arkiv are written by the WondrPay writer and are read-only to everyone else. | Someone writes fake receipts into Arkiv | Readers trust only entities whose `$creator` is the WondrPay writer, **and** whose data matches the on-chain event. | 🖥 | ✅ |
| C3 | Receipts and deal records MUST NOT contain personal data beyond the name the user chose. | Doxxing, and personal data on a permanent public ledger (privacy law) | No phone numbers, emails or legal names on-chain or on Arkiv. Evidence files are encrypted. | 🖥 | ✅ |
| C4 | **Wallet profiling:** a shop sees your address and can look up your whole balance and history | A public chain exposes everything after one payment | ⚠️ Open today. 🗓 v0.3: a fresh receiving address per deal or payment (smart-account or stealth-address design), so one payment doesn't reveal the rest. | ⛓ | ⚠️ open |

---

## 9. Autopay (subscriptions and mandates)

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| A1 | A mandate's terms (amount, period, start, grace, cycle count) are fixed and committed in the mandate's own address. One signature means consent to exactly those terms. | Merchant changes the price after you subscribe | A new price needs a new mandate and a new signature | ⛓ Autopay | ✅ |
| A2 | Each cycle can be charged only inside its window (30 s early to the grace period) and never more than once. Missed cycles are **skipped, never charged late**. | Merchant charges three months at once after a pause | Window check plus a `nextCycle` counter | ⛓ | ✅ |
| A3 | Total pull is capped at amount × cycles (at most 12 cycles). | Unlimited approval drained later | The permit allowance is exactly amount × cycles | ⛓ | ✅ |
| A4 | The subscriber can cancel any time, gaslessly, in one tap. The merchant can cancel too. | Hard-to-cancel subscriptions | Signed cancel, relayed for the user | ⛓ | ✅ |
| A5 | 🗓 Like UPI Circle: a new mandate above a per-transaction cap needs step-up verification. A 24-hour cooling-off applies to new mandates above the cap. | Scammer convinces a victim to approve a big recurring mandate | 🗓 v0.2 | 🖥 | 🗓 |

---

## 10. Limits and velocity

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| L1 | A payer may send at most **500 USDT a day** through the WondrPay relayer while in beta. | Stolen phone drained quickly. ⚠️ Today the counter lives in one server instance's memory, so parallel instances could each allow 500. | Daily cap per payer. 🗓 v0.2: move the counter to a shared store (KV) so the cap is global. The escrow beta cap is 200 USDT per deal (E18). | 🖥 | ✅ per instance · 🗓 global |
| L2 | Any single payment above **100 USDT** needs a fresh personhood check (step-up). | Stolen device used for one big payment | Step-up re-verification (H3) | 🖥 | ✅ |
| L3 | **Splitting to dodge limits:** many 99 USDT payments to stay under L2 | — | The daily cap (L1) bounds the total. 🗓 v0.2: step-up also triggers on cumulative 24 h volume to new payees. | 🖥 | ✅ cap · 🗓 cumulative |
| L4 | **New wallets, new limits:** a scammer uses a fresh wallet to reset limits | — | 🗓 v0.2: limits keyed to the personhood nullifier, not just the wallet. | 🖥 | 🗓 |

---

## 11. The gasless relayer

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| G1 | The relayer pays gas but **can't change any payment**: it only submits what users signed. | Relayer redirects or alters funds | Every contract binds the user's signature to recipient, amount and purpose (P1, P3, E1, E2) | ⛓ | ✅ |
| G2 | The relayer simulates every transaction before paying for it, and refuses invalid ones. | **Gas draining:** spam of invalid signatures burns our gas | Simulation, a 5-per-minute per-client rate limit, a gas price cap of 50 gwei, and multiple relayer keys | 🖥 | ✅ |
| G3 | The relayer's wallet holds only a few days of gas and is topped up from a cold wallet. | A relayer key leak drains the treasury | Small hot balance plus an alert | 📜 | 🗓 mainnet |
| G4 | If the relayer is down or refuses, users can always act directly (paying their own gas). | Relayer censorship | E17, and `poke` by anyone | ⛓ | ✅ |

---

## 12. Security of your account (PIN, device, signing)

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| S1 | The PIN never leaves the device in readable form. The device sends only a slow hash (PBKDF2, 310,000 rounds, salted with the address), which the server hashes again with a secret pepper. | **PIN guessing** offline after a server leak | The pepper is stored separately, so a database leak alone can't be brute-forced | 🖥 | ✅ |
| S2 | At most **5 wrong PIN attempts per 15 minutes,** and 20 PIN API calls per 15 minutes per IP. | Online brute force (a 4–6 digit PIN space is small) | Rate limits | 🖥 | ✅ |
| S3 | Saving a PIN for all devices needs a fresh wallet signature (at most 15 minutes old, and newer than the last PIN). | Someone who knows your PIN resets it from their device | The wallet signature proves key ownership | 🖥 | ✅ |
| S4 | Before every signature the app shows **one plain sentence** of what it does, and blocks unlimited token approvals and unknown contracts. | **Drainer signatures** ("sign to claim airdrop") | Pre-sign check (BUILD_PLAN §8.4) | 📱 | 🗓 v0.2 |
| S5 | The app never asks for a seed phrase or private key, and never asks for a PIN inside Telegram or chat. | Phishing that copies WondrPay screens | A policy plus a warning text on every PIN screen | 📱 + 📜 | ✅ |

---

## 13. Shops, webhooks and API keys

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| M1 | Shops register on-chain (payout, order signer, ENS name). The "verified" flag is set only after checks. | Fake shop impersonating a brand | Registry is controlled by the WondrPay operator (an acquirer role). 🗓 v0.2: verification requires a business document and a personhood check of the owner. | ⛓ + 🖥 | ✅ registry · 🗓 KYB |
| M2 | Webhooks are HMAC-signed and sent only after the payment is seen on-chain. Each event grants the order once. | **Fake "paid" webhook** sent by an attacker; duplicate deliveries | Signature check, plus idempotent handling (a duplicate grants nothing) | 🖥 | ✅ |
| M3 | API keys are per site, can be rotated or revoked, and only a shop team member with the right role can manage them. | A leaked key is used to create fake orders | Keys sign orders for one shop only. Rotation is signed by the shop wallet. | 🖥 | ✅ |
| M4 | **Changing the payout address** needs a signature from the shop wallet and a 24 h delay with a notice. | Account takeover then a redirect of all revenue | 🗓 v0.2: delay plus notification | ⛓ | 🗓 |

---

## 14. Rewards

| ID | Rule | Loophole | Fix | Where | Status |
|---|---|---|---|---|---|
| W1 | A reward needs a real payment of at least 0.1 USDT to a different verified shop, and expires after 30 days. | **Reward farming** with self-payments or many wallets | Minimum amount, a World ID session per human, and one reward per payment | 🖥 | ✅ |
| W2 | 🗓 Self-payment to your own shop or a linked wallet earns nothing. | Circular payments | 🗓 v0.2: same-human check (nullifier) on payer and shop owner | 🖥 | 🗓 |

---

## 15. Fees and money

| ID | Rule | Where | Status |
|---|---|---|---|
| F1 | P2P sends are free. WondrPay pays the gas. | 🖥 | ✅ |
| F2 | The Protected Pay fee is 0.5% (cap 2%). It's charged only on what the seller receives and refunded if the deal fails (E13). | ⛓ | ✅ |
| F3 | No hidden fees: every fee is shown before signing, and the signed amount includes it. | 📱 + ⛓ | ✅ |
| F4 | WondrPay never earns interest on user money, and never lends or invests it. There's nothing to lend, because we never hold it (P0.1). | 📜 | ✅ |

---

## 16. How these rules change (governance)

| ID | Rule | Loophole | Fix |
|---|---|---|---|
| V1 | The rulebook is versioned (v0.1, v0.2…) and published in a public Git repository with history. | Silent rule changes | Every change is a public commit with a reason |
| V2 | A change takes effect **14 days** after publication, except security fixes, which apply immediately but only make things safer. | Rule change rushed through to benefit WondrPay | Notice period. Live deals keep their old rules (P0.3). |
| V3 | Contract rules can't change at all. New rules mean a **new contract**, and users choose to use it. | Upgradeable contracts let the operator rewrite the rules | No upgrade keys on any WondrPay contract |
| V4 | 🗓 Later: a council of wallets, shops and user representatives approves rulebook changes. Not token voting. | One company controls the "neutral" rulebook | Foundation-style council once other wallets adopt the rules |

---

## 17. Known open gaps (being honest)

1. **Ordinary (non-escrow) payments can't be forced back** (R2). Recommend Protected Pay for strangers.
2. **Privacy:** a shop can see a payer's address history (C4). A fresh address per deal is planned.
3. **The arbiter is WondrPay** until external appeal exists (D6). It's a disclosed, 2-of-3, public-reasoned arbiter.
4. **Personhood is only as strong as the provider.** Mitigated by several providers plus step-up, but a determined criminal with real documents can still pass.
5. **Testnet roles:** owner, treasury and arbiter are one deployer wallet, for testing only. Mainnet needs three separate Safes.
6. **Not legally reviewed yet.** A legal opinion on non-custody and escrow is required before mainnet.

---

## Appendix A: where these rules come from

We didn't invent payment safety. These are the real-world rules each WondrPay rule borrows from, and how we turn each into code:

| Real-world rule | Who made it | What it says | WondrPay equivalent |
|---|---|---|---|
| UPI Turn-Around-Time and auto-reversal | RBI (2019 TAT circular) | A failed transaction is auto-reversed by T+1, and the bank pays compensation (₹100/day) for delay | E5, E7, E11: deadlines that auto-refund, enforced by contract |
| UPI payee name display | NPCI | The payer sees the bank-verified name before paying | N3 payee card, H1 verified human |
| End of P2P collect requests | NPCI (from 1 Oct 2025) | Person-to-person "collect" banned because of fraud; shop collect allowed | Q3 |
| UPI AutoPay | NPCI | Mandates with caps, pre-debit notification, cancel any time | A1–A4 |
| UPI Circle | NPCI / RBI (2024) | Delegated payments capped at ₹5,000 per transaction and ₹15,000 a month | A5, L1–L2 |
| UPI per-app market cap (30%) | NPCI | No single app may dominate | V4 (open rulebook, many wallets) |
| UPI PIN and device binding | NPCI | PIN entered in an NPCI library and bound to the device | S1–S3 |
| Chargebacks and reason codes | Visa / Mastercard network rules | Cardholder disputes with codes, evidence and an issuer decision | R1 reasons, D-rules, evidence (D7) |
| Regulation E error resolution | US CFPB | 10 business days to investigate errors, provisional credit | E7 response window, R2 |
| Strong customer authentication | EU PSD2 | Two factors for risky payments | L2 step-up, S1 |
| Escrow (authorize / capture / refund) | Coinbase/Shopify Commerce Payments Protocol | Funds held until capture, voidable | Section 5 |
| Mojaloop scheme rules | Gates Foundation / open-source fiat switch | A written rulebook that participants sign | This document and V-rules |
| BIS Project Nexus | Bank for International Settlements | Linking instant-payment systems through one shared rulebook, without pooling money | The whole WondrPay Rules idea |
| FinCEN 2019 guidance | US Treasury | Accepting and retransmitting value means money transmission; unhosted wallets don't | P0.1 non-custody |
| Travel Rule | FATF | Identity data travels with transfers between providers | ⚠️ Handled by licensed partners, out of scope for v0.1 |

## Appendix B: how a wallet adopts WondrPay Rules

**To claim the "Protected" badge, a wallet MUST:**
1. Use the `ProtectedEscrow` contract, or one that passes the same test suite, for any payment it labels "Protected".
2. Show the payee card (N3) before every payment.
3. Enforce rules H1, Q2–Q4, S4 and L1–L2 in its own app.
4. Never hold user funds (P0.1).

**It SHOULD** read and write receipts and dispute events in the shared Arkiv schemas (`whitepay.deal`, `whitepay.dealevt`), so that reputation carries across wallets.

---

## Change log

### v0.1 (10 Nov 2026)
First publication.

**Four escrow loopholes fixed** and redeployed (old contract `0xBbE4…B649` → new `0x9Ef5…E24d`):
- **E6:** the minimum inspection window is now 1 day (it was 1 hour).
- **E8:** one partial offer per dispute (re-offering could stall forever).
- **E9:** buyer silence on an offer goes to the arbiter instead of accepting it (lowball trap).
- **E10:** either side may concede at any time.

**Tests:** 72 unit and attack tests pass, 4 invariants hold over 128,000 random actions, and the fork test against the real Whitechain USDT passes.
