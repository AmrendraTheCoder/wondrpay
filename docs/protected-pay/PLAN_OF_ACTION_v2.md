# WondrPay plan of action, v2 (10 Nov 2026)

This replaces the strategy parts of the founder playbook. The engineering detail stays in [BUILD_PLAN.md](BUILD_PLAN.md). It folds in three corrections from this week: the market size was overstated, authority cannot come from law (Tejas), and Indian users are out of scope for real money (Ajay Kumar, FEMA).

Nothing here is legal advice. The legal section is a list of questions for a lawyer.

## 1. How to see the product

**WondrPay is a neutral protection layer for stablecoin payments between people who don't trust each other yet.** The money sits in a contract, not with us. Rules and deadlines decide who gets it. A dispute desk decides only when both sides disagree.

- The **app** is the reference implementation and the demo.
- The **escrow contract plus the rules** are the product.
- The **SDK** is how it becomes a business.

What it is not:

| Not this | Why |
|---|---|
| UPI for stablecoins | The easy-pay experience is copyable and many teams built it |
| NPCI for stablecoins | Nobody can give us authority over other wallets |
| A remittance or on/off-ramp service | That needs licences in every country |
| A product for Indian residents (real money) | FEMA: cross-border must go through an AD bank in fiat |

## 2. Downsides

| # | Downside | How bad | What reduces it |
|---|---|---|---|
| 1 | **Legal status of the arbiter.** We can direct where escrowed money goes, so a regulator may treat us as having control of client funds. | Could block mainnet | Legal opinion first; arbiter panel or third party; low caps |
| 2 | **Founder is an Indian resident** running a crypto product for foreign users: entity, tax and FEMA questions | Could block revenue reaching you | Lawyer and CA before any real-money fee |
| 3 | **Small market at first.** Escrow fits only stranger-to-stranger payments. 0.5% of a $50 deal is $0.25. | Slow revenue | Bigger tickets (milestones), merchants, SDK |
| 4 | **Wrong chain for volume.** We are on Whitechain; most USDT is on Tron and others. | Limits growth | Multi-chain after beta; Whitechain is for grant and distribution |
| 5 | **Existing substitutes:** exchange P2P escrow, Telegram middlemen | Users may not switch | Neutral, non-custodial, works in any wallet, lower fee |
| 6 | **Disputes need humans.** Evidence is off-chain (chats, files). The arbiter cannot scale. | Breaks above about 5% dispute rate | Good defaults so silence resolves most cases; panel later |
| 7 | **Code can be copied.** The contract is open. | No moat from code | Reputation data and integrations |
| 8 | **Two-person team, shared infrastructure.** The live site is on Tejas's Vercel account. No written agreement yet. | Ownership dispute later | Founder agreement and IP assignment now |
| 9 | **Smart contract bug** with real money | Total loss of trust | Audit, caps (200 USDT per deal), non-upgradeable, pause on new deals |
| 10 | **Stablecoin issuer blocklists** an address in a deal | A payout gets stuck | Already handled: pull fallback (`owed`/`withdraw`) |

## 3. The forks

You go in one direction now. These are the turns you will be offered later.

| Fork | What it is | Signal to take it | Cost |
|---|---|---|---|
| **A. Consumer escrow app** (current) | Freelancers and P2P sellers create protected deal links | This is the starting wedge | Slow, small tickets, we run disputes |
| **B. Protection SDK** | Wallets and merchants add "Protected Pay" with our contract and rules | One outside team asks to integrate | Sales cycle, support, docs |
| **C. Agent payments** | AI agents pay for work only when delivered | Agent frameworks ask for conditional payment; x402 traffic grows | Early market, may be 2 years out |
| **D. Marketplace checkout** | Escrow as the payment step for a marketplace or freelance platform | A platform with existing volume wants it | Custom work per client |
| **E. Open standard, grant-funded** | Rules and contract as a public good, funded by ecosystem grants | Fees don't work but usage does | Not a venture-scale company |

**Recommended path: A now, B as the destination.** A exists to produce proof (real deals, dispute rate, testimonials). B is the business. C is the option to watch. D is acceptable if a client pays for it. E is the fallback, not a failure.

**Gates:**

1. After the beta: fewer than 20 completed deals in 6 weeks means the consumer wedge is weak. Go straight to B or D with what we have.
2. Dispute rate above 5%: fix defaults and evidence rules before any growth.
3. No outside integration interest after 15 conversations: stay in A, or choose E.

## 4. Sequence

Your order is right: functionality and legal first, then marketing and sales. Two things from marketing can start now because they carry no legal risk: talking to users and building an audience on testnet.

### Phase 1: finish the product (weeks 1–4, to 8 Dec)

| Item | Status |
|---|---|
| Escrow contract, tests, testnet deploy | Done |
| Server and API: `deals.ts`, deal index on Arkiv, `/api/deals`, daily cron that calls `poke` | Done (11 Nov) |
| Deal UI: create link (`/deal/new`), deal page (`/d/[id]`: fund, deliver, dispute, partial offer, timeline, messages), my deals (`/deals`), dispute desk queue and ruling | Done (11 Nov) |
| Dispute desk process: what evidence, who decides, how fast, written down | Done as v0.1: [DISPUTE_DESK.md](DISPUTE_DESK.md). Needs legal review. |
| Gas: `fund` from about 206k towards 150k | Done to 186k. 150k needs a storage redesign; left for after the audit. |
| Aderyn run; rerun the live demo on the new address | Done: 0 high, 5 low; demo passed on `0x6260…b330` |
| Daily limit made global (it is per instance today) | Done: counted from Arkiv receipts and deals |
| Rotate `CUSTOMER_PK` (it was exposed earlier) | Open, do this week |
| Geo-restriction and terms acceptance in the app | Built: `DEALS_BLOCKED_COUNTRIES` and draft terms at `/protected-terms`. The country list and final terms depend on legal. |

### Phase 2: legal due diligence (weeks 1–6, in parallel)

Take these questions to a crypto lawyer and a CA with FEMA experience. Ajay Kumar's firm does this work and has already engaged with you.

**Founders and company**
- [ ] Founder agreement with Tejas: equity split, vesting, roles, who owns the code, domains and deployment accounts
- [ ] IP assignment from both founders to the future company
- [ ] Where to incorporate, and when. Ask about a foreign entity owned by Indian residents (overseas investment rules, tax residency of the company, how fees and salary come back to India)
- [ ] Indian tax on your own crypto income (the 30% VDA tax and 1% TDS apply to residents)

**The product**
- [ ] Is a non-custodial escrow with an arbiter a regulated activity in the launch countries? Ask specifically about the arbiter's power to split funds.
- [ ] Does the relayer (we submit users' transactions) change that answer?
- [ ] Which countries are safe to launch in first, and which to block
- [ ] India: does offering the service to non-residents from India trigger registration as a VDA service provider with FIU-IND?
- [ ] Sanctions screening: is checking addresses against sanctions lists required of us?

**Documents**
- [ ] Terms of service: non-custodial, caps, dispute process, arbiter decision is final, no investment advice
- [ ] Privacy policy. Receipts are stored publicly on Arkiv, so decide what personal data may never go there.
- [ ] Dispute rules as a public document (the rulebook is the base)
- [ ] Trademark search for "WondrPay"
- [ ] Open-source licence for the contract and rules
- [ ] Grant terms from Whitechain: what they require in return

**Before mainnet**
- [ ] External audit
- [ ] 2-of-3 Safes for owner, treasury and arbiter
- [ ] Mainnet USDT address and EIP-3009 support confirmed with Whitechain

### Phase 3: closed beta on mainnet (weeks 6–12)

Only after the legal opinion and the audit. 20–50 invited users, none resident in India, 200 USDT per deal cap. Measure: deals completed, dispute rate, time to resolve, whether anyone pays the fee, repeat use.

### Phase 4: marketing and sales

**Can start now (testnet, no real money):**

| Action | Target |
|---|---|
| 20 user interviews: freelancers paid in USDT, P2P sellers, Telegram middlemen, outside India | Learn deal sizes, current workaround, what they'd pay |
| Build in public on X and LinkedIn: one post a week with a real artefact (test results, a rule and its loophole, the demo) | Audience before launch |
| Waitlist page with one question: "what deal would you protect?" | 200 signups |
| Whitechain Builders grant application | Funding and distribution |
| Fix the public message: say "users outside India", never "cross-border for India" | Avoid the FEMA problem in writing |

**After the beta has numbers:**

| Action | Target |
|---|---|
| SDK design partners: 15 conversations with wallets and merchants on Whitechain and other EVM chains | 1–2 free pilot integrations |
| Case studies from beta deals | Sales material |
| Protected badge and embeddable deal link | Each deal markets the product |
| Pre-seed conversations | Only with beta data in hand |

**The sales pitch in one line:** "Add buyer protection to your stablecoin checkout in a day. We hold nothing; the contract does."

## 5. This week

1. Rotate `CUSTOMER_PK`.
2. Start the server and API work (week 3 of the build plan).
3. Book a call with a crypto lawyer or with Ajay Kumar; bring section 4, phase 2 as the agenda.
4. Write the founder agreement with Tejas.
5. Start the 20 interviews: five this week.
