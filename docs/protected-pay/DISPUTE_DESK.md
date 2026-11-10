# The dispute desk: how a disputed deal is decided

Version 0.1, 11 Nov 2026. This is the working process for the testnet and the closed beta. A lawyer must review it before real money (see [PLAN_OF_ACTION_v2.md](PLAN_OF_ACTION_v2.md), phase 2). The rules it implements are D1–D7 in [WondrPay Rules](../rules/WONDRPAY_RULES.md).

## 1. What the desk is

The "dispute desk" is the name users see. In the contract it is the **arbiter**: one address that can do exactly one thing.

| The desk can | The desk cannot |
|---|---|
| Split the held price of an **escalated** deal between the buyer and the seller, within 7 days of escalation | Touch a deal that isn't escalated |
| | Send money to anyone except that deal's buyer and seller |
| | Take more than the protection fee the buyer already agreed to |
| | Stop a deadline, reverse a finished deal or decide after the 7 days |

If the desk does nothing for 7 days, the contract refunds the buyer in full. The desk is never needed for a deal to end.

**Who holds the key:**
- Testnet: the deployer wallet (one person). This is disclosed in the rulebook.
- Beta and mainnet: a 2-of-3 Safe. The three signers are different people. Changing the arbiter address takes a 2-day public timelock.

## 2. When a deal reaches the desk

Most disputes end without the desk. A deal is escalated only in these three cases:

1. The buyer reported a problem and the seller answered **"I disagree"** (contest).
2. The seller offered a partial refund and the buyer **rejected** it (escalate).
3. The seller offered a partial refund and the buyer **didn't answer** before the deadline.

Before that point, either side can end the dispute alone: the buyer by releasing the payment, the seller by refunding in full. Both can still do this while the desk is deciding.

## 3. Evidence

The desk reads **only** what the two sides post in "Messages and proof" on the deal page. Each entry is signed by the poster's wallet, stored on Arkiv and can't be edited or deleted.

**Deadline for evidence:** 72 hours after escalation. The desk doesn't decide before then unless both sides have said they are finished.

**What counts, strongest first:**

| Kind of deal | Seller should post | Buyer should post |
|---|---|---|
| Physical goods | Carrier tracking number that shows delivery to the agreed address | Photos or video of what arrived, taken at unboxing |
| Digital goods, accounts, files | The delivery itself (a link or a transfer record) with a timestamp | Screenshot or recording that shows it doesn't work or doesn't match |
| Services and freelance work | The delivered work and the agreed brief | The brief and the specific points the work misses |
| P2P trade (stablecoin for bank money) | Not supported in the beta | Not supported in the beta |

**Rules for evidence:**
- The deal's title and details, as signed by the seller, are the agreement. Claims that contradict them need proof that both sides agreed to a change.
- Proof must be a link the desk can open (`https://`). A private chat counts only if both sides appear in it.
- Messages are public. Nobody should post an address, phone number, ID document or bank detail. Blur them first.
- Forged evidence loses the case, and the wallet is flagged.

## 4. How the desk decides

| Finding | Decision |
|---|---|
| Seller can't show delivery | 100% back to the buyer |
| Seller shows delivery and the buyer shows no defect | 100% to the seller |
| Delivered but clearly not as described | 100% back to the buyer (after return, where a return is possible and the seller pays for it) |
| Delivered with a partial defect, or the work is partly done | Split in proportion to what was delivered. The seller's own partial offer is the starting point. |
| Neither side posts evidence in 72 hours | 100% back to the buyer (the same result as the desk staying silent) |
| Evidence is balanced and nothing decides it | Half each |

The standard is "more likely than not". The desk doesn't investigate outside the thread, phone anyone or accept evidence by private message.

## 5. Steps and time limits

| Step | Who | Limit |
|---|---|---|
| Deal appears in the desk queue (`/deals`, "Desk" tab) | Automatic | At escalation |
| Both sides post evidence | Buyer and seller | 72 hours |
| First signer reads the thread and writes the ruling note | Desk signer 1 | Day 4 |
| Second signer checks the note and co-signs the ruling | Desk signer 2 | Day 5 |
| Ruling note is posted on the deal page, then the ruling is sent | Desk | Day 5, at the latest day 6 |
| Hard stop: the contract refunds the buyer if there's no ruling | Contract | Day 7 |

**Target:** a decision within 5 days of escalation. **Capacity:** one signer can handle about 5 cases a week. If more than 5% of deals reach the desk, growth stops until the defaults and evidence rules are fixed (gate 2 in the plan).

**Every ruling note says:** what each side claimed, which evidence decided it, the split, and whether any signer recused themselves.

## 6. Conflicts of interest

- A signer who knows either side, or has traded with them, takes no part in the case and says so in the note.
- Signers don't buy or sell through Protected Pay with real money during their term.
- The desk takes no payment from either side. Its only income is the protection fee the contract already charges, and that fee is smaller, not larger, when the buyer wins.

## 7. After the decision

- The decision is final in the contract. There's no appeal in v0.1. An outside appeal (Kleros or UMA) for larger deals is planned in the rulebook as D6.
- The ruling note stays public on the deal page.
- A wallet that loses 3 disputes in 90 days is reviewed, and may be refused new deals by the WondrPay app (the contract itself stays open to everyone).

## 8. Open questions for the lawyer

1. Does the desk's power to split held funds make WondrPay a custodian, an escrow agent or a payment service in the launch countries?
2. Is "the decision is final" enforceable, and should the terms name an arbitration law and seat?
3. Must the desk keep records of cases, and for how long?
4. Does a public ruling note create a defamation or privacy risk? Should parties be named only by wallet address?
5. Would using an outside arbitration service, or a panel of independent signers, change the answer to question 1?
