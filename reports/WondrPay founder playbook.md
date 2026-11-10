# WondrPay founder playbook

**From hackathon project to a funded, launched company: what to build, who it's for, how to reach them, and how to raise money.**

Written 9 Nov 2026. It draws on everything we researched together:
- [Stablecoin payment chains compared](Stablecoin%20payment%20chains%20compared.md): the deep research, with all sources
- [Chain benchmark results](Chain%20benchmark%20results.md): live fees and speeds measured on 15 chains
- [Settlement without a central pool](Settlement%20without%20a%20central%20pool.md): how to move money without ever holding it
- [ETHGlobal Mumbai winners vs WondrPay](ETHGlobal%20Mumbai%20winners%20vs%20WondrPay.md): what judges rewarded and why we didn't place

Facts with numbers come from those reports, and their sources are listed there. Strategy and advice here are my judgment, not sourced fact. **Nothing here is legal or financial advice**; parts 7 and 8 tell you when to get a lawyer.

**How to study this:**
- **Day 1:** read parts 1–3 to understand the field and the idea.
- **Day 2:** read parts 4–6 to know what to build and for whom.
- **Day 3:** read parts 7–10, the launch and money mechanics.
- **Keep part 11 (the 90-day plan) open as your to-do list.**

---

## Part 1: the field in plain words

### 1.1 What a stablecoin payment actually is

- **A stablecoin** is a token that tracks a currency, almost always the US dollar. The two that matter are **USDT** (Tether, the largest, dominant in emerging markets and on Tron) and **USDC** (Circle, the most regulated, dominant in the US and on Base and Solana).
- **A chain** is the ledger the token lives on: Ethereum, Tron, Base, Solana, Whitechain and so on. The same "USDT" on two chains is two different entries in two different ledgers. That is the root of most user confusion.
- **A wallet** holds the private key that can move your tokens. Whoever holds the key controls the money. In a **self-custodial** wallet that's you. In an **exchange account** (WhiteBIT, Binance) it's the exchange.
- **Gas** is the fee paid to the chain to process a transaction, usually in the chain's own token (ETH, TRX, WBT). The fact that you have to buy a *second* token just to send dollars is the single biggest UX failure in crypto payments.

### 1.2 Why this is a big market right now

- **UPI shows what "boring, instant, free" payments do.** It processed **25.47 billion transactions in October 2026**, about 822 million a day.
- **Tron alone moves about $24 billion of USDT a day.** People in emerging markets already use dollar stablecoins as savings and for cross-border payments.
- **The big companies are buying in:**
  - Stripe built its own chain (Tempo, raised $500M at a $5B valuation).
  - Circle launched Arc.
  - Mastercard bought BVNK for up to $1.8B.
  - Visa settles stablecoins across nine chains.
- **Regulation is arriving,** which makes the space investable:
  - The US GENIUS Act takes effect 18 Jan 2027.
  - Europe's MiCA grandfathering ended 1 Jul 2026.

Speed and fees are solved. Our benchmark found a stablecoin transfer costs under half a cent on every modern chain except Ethereum mainnet ($0.21). Tron is the costly one people actually use ($2–4.50). **The opportunity is no longer "faster, cheaper transfers". It's everything around the transfer.**

### 1.3 How UPI works, and the part crypto is missing

UPI is five layers:

| UPI layer | What it does | Crypto today |
|---|---|---|
| **Names** (UPI ID / phone number) | Pay a name, not an account number | ENS names exist, but no wallet *must* resolve them, and nothing shows the payee's verified name |
| **QR / request format** | Every app scans every QR | EIP-681 (EVM) and Solana Pay each work only on their own chain |
| **Switch and settlement** | NPCI routes messages, and banks settle at RBI | Each chain settles itself, and issuers move tokens across chains (Circle CCTP, USDT0) |
| **PIN and device binding** | Safe authentication | Passkeys and smart accounts, but different in every wallet |
| **Rules** (refund timelines, AutoPay mandates, limits) | If it fails, you get your money back by T+1, by law | **Nothing.** A payment is final, there's no refund rule, and a mandate is an unlimited approval (the main way people get drained) |

**The key insight from all our research: crypto already has the money movement. It lacks the rules.** NPCI never holds anyone's money; it writes and enforces the rulebook. Nobody does that for stablecoins.

### 1.4 Why the gap exists (so you can answer an investor who asks "why hasn't Coinbase done this?")

1. **Refunds cost money, and stablecoins have no interchange to fund them.** Card chargebacks are paid for by the 1.5–3% merchant fee. Mastercard counts 261M chargebacks a year, worth $33.8B. Low-fee stablecoin rails have no margin for that, and **Stripe's stablecoin product literally says "Dispute support: No"**.
2. **"Works on any chain" turns you into a bridge and a money transmitter.** Taking money on chain A and paying out on chain B is "accepting and retransmitting" value, which US FinCEN treats as money transmission (licences cost $1M+). Bridges have lost about $2.9B to hacks.
3. **Names need someone accountable.** UPI's directory works because a regulated body admits members and carries liability. No crypto entity wants that liability.
4. **Safe mandates aren't standardised.** `approve` and permit signatures are both the only universal "pull" mechanism *and* the main theft vector ($494M stolen in 2024). The safe standard, ERC-7715, is still a draft.

**What this means for you:** the gap is mostly legal and economic, not technical. That's good news for a startup. Big players avoid it because it creates liability, while a focused team can turn it into a product: **paid protection plus an open rulebook**.

### 1.5 The players you'll be compared with

| Type | Examples | What they do | Their weak spot (your opening) |
|---|---|---|---|
| Payment chains | Tempo (Stripe), Arc (Circle), Plasma, Stable, Celo, Monad, Whitechain | Fast, cheap settlement; some hide gas | They're ledgers. None gives the user refunds, names or rules across chains |
| Merchant gateways | Stripe stablecoins, PayPal, BitPay, W Group's own **Whitepay** (custodial, 0.4–1.5%) | Accept crypto, pay the merchant fiat | Custodial, no disputes, mostly US-only |
| Consumer apps | World App, MiniPay (Celo), Binance Pay, Telegram Wallet, Revolut | Send money inside their own app | Walled gardens: a Binance Pay ID doesn't work in MiniPay |
| Hackathon peers | RupeeRail (stablecoins → UPI via a rupee pool), PoP (escrow for cash-on-delivery), Tazor, Zeeto | Single flows | Prototypes, mostly testnet |

---

## Part 2: what ETHGlobal Mumbai taught us

We studied all 71 winners out of 622 projects. Three lessons matter for the company, not just for hackathons:

1. **One sharp problem beats many features.**
   - PoP won Whitechain 1st with one story: *"Do you offer cash on delivery?"*, the trust problem between strangers selling on Instagram.
   - We showed a whole payments app and described it as a "checkout SDK". About eight teams built that same checkout, and none of them won.
2. **A new trust mechanism is the novelty.** The winners each had one idea judges hadn't seen:
   - PoP: a delivery code that releases escrow.
   - Tap2ETH: your bank card's chip as a wallet key.
   - Countersignn: enforced spending limits for AI agents.

   EIP-3009 plus a relayer was the expected baseline, not a differentiator.
3. **Invisible crypto wins.** The Scale winners made the payer never see gas, chains or seed phrases, and showed receipts in rupees.

Investors judge the same way: **who exactly, what pain, why now, why you, and what you've got that nobody else has.**

---

## Part 3: the pivot

### 3.1 From → to

| | Before (hackathon) | After (company) |
|---|---|---|
| What we said | "A gasless USDT checkout SDK on Whitechain" | **"WondrPay: stablecoin payments with buyer protection, the rules layer that crypto is missing"** |
| Category | Payment gateway (crowded, commodity) | **Payment protection and rules** (empty category) |
| Value to the user | "No gas" | **"Pay anyone by name. If it goes wrong, you get your money back."** |
| Novelty | None (baseline tech) | Escrow with refund timers, verified payee names, capped mandates, an open spec others can adopt |
| Revenue | Thin checkout fee | Merchant fee **plus a buyer-protection fee** plus a B2B rules SDK |

**The one-line pitch:** *"UPI made payments safe because NPCI wrote the rules. Stablecoins move $24B a day with no rules: no refunds, no verified names, no safe mandates. WondrPay is that rule layer. We never hold the money; we make it safe to send."*

### 3.2 Two products, one company

Investors will ask "are you a protocol or an app?" Answer: **both, in this order.**

1. **WondrPay app (the proof):** a consumer and merchant app where every payment can be *Protected*. This is where users and revenue come from first.
2. **WondrPay Rules (the moat):** an open spec plus SDK covering:
   - signed payment requests
   - receipts
   - refund cases with deadlines
   - mandate registry
   - verified names

   Other wallets and merchants adopt it, and you earn on protected volume that runs through it.

A protocol with no app has no users, and an app with no protocol has no moat. The app proves the rules work, and the rules let you scale beyond your own app. Visa is the model: a rulebook plus a brand that shoppers trust.

### 3.3 The core novelty: "Protected" payments

This is the feature to build the whole company around. Every protected payment has:
1. **A verified payee:** before paying, you see "✓ Rahul Sharma, verified human, merchant since 2026, 0 disputes" (World ID plus WondrPay merchant verification plus ENS name). This is UPI's "name shows before you pay" for crypto.
2. **Escrow with a timer:** the money sits in a smart contract until delivery is confirmed or the timer ends, then it releases automatically. Neither side can run off with it, and WondrPay can't touch it either.
3. **A refund rulebook with deadlines:** if the buyer raises a problem, the merchant must answer within N days or the refund happens automatically. It's the crypto version of RBI's T+1 auto-reversal, enforced by code.
4. **A neutral dispute ladder:** first merchant and buyer, then the WondrPay desk, then an outside arbiter (Kleros or UMA) for large amounts.
5. **A public receipt:** every step is recorded on Arkiv, so anyone can verify it (we already built this).
6. **A protection fund:** a small fee per protected payment pays for disputes. That's how you fund refunds without card interchange, the economic gap from part 1.4.

Plain sends stay free and instant. **Protection is opt-in and paid.** That is the business model.

---

## Part 4: who it's for (the wedge)

You can't launch "for everyone". You need a **beachhead**: one group with a burning pain, reachable cheaply, where you can win completely. Then expand.

### 4.1 The candidates

| Beachhead | Pain | Do they already use stablecoins? | Can we reach them? | Legal risk | Verdict |
|---|---|---|---|---|---|
| **A. P2P USDT traders and freelancers paying strangers** (Telegram/WhatsApp deals, OTC, freelancers paid in USDT) | Scams are constant. Today they use exchange P2P escrow or just trust. | ✅ daily | ✅ Telegram groups, WhiteBIT, freelancer communities | Medium. Escrow must stay non-custodial. | **Strong** |
| **B. Small online sellers in WhiteBIT's markets** (Ukraine, Eastern Europe, Turkey, Central Asia) | Card acquiring is expensive or blocked, and cross-border payments are slow | Partly | ✅ via Whitechain/WhiteBIT partnership | Medium | **Strong if WhiteBIT partners** |
| C. Indian domestic shoppers and merchants | — | ❌ (UPI already works) | — | **High.** RBI is leaning toward prohibition; 30% tax plus 1% TDS. | **Avoid** |
| D. Indian freelancers paid from abroad (inbound) | Wire fees, 1–3% FX spread, days of delay | ✅ growing | ✅ | Medium. Off-ramp only through licensed partners; FIU-IND registration needed | **Good second step** |
| E. AI agents paying for APIs (x402) | Real but tiny. Only 0.6–7.5% of x402 volume is truly agentic. | — | — | Low | **A feature, not a beachhead** |

### 4.2 Recommended beachhead

**"Pay a stranger safely in USDT," for P2P deals and freelancers, launched through the Whitechain/WhiteBIT ecosystem.**

**Why this one:**
- **The pain already exists and people already pay to solve it.** They use exchange P2P escrow, Telegram escrow bots and middlemen who take 1–5%. You don't have to teach anyone to want stablecoins.
- **It uses exactly what we built:** names, QR, refunds, receipts, World ID.
- **Distribution is concentrated.** Telegram groups and WhiteBIT's 10M+ users are reachable without paid ads.
- **It's non-custodial,** so you stay out of money-transmission licensing, after a lawyer confirms it.
- **It's novel.** No product does "verified payee plus timed escrow plus auto-refund rules" across wallets.

**Expansion path:**
1. P2P deals and freelancers.
2. Small online sellers (merchant checkout with protection).
3. Inbound freelancer payouts to India via licensed partners.
4. Other wallets adopt WondrPay Rules (the protocol).

**Validate before you commit.** Part 11 begins with 30 user interviews. If they don't say "yes, I've been scammed, and I'd pay 0.5% not to be", switch to beachhead B or D. The playbook stays the same; only the user changes.

---

## Part 5: the product (what to keep, build and cut)

### 5.1 Keep (already built, and it fits the pivot)

- Gasless USDT sends (EIP-3009 plus relayer). The user never needs WBT.
- Names (ENS) and pay by QR.
- Saved PIN that works on every device, and MetaMask/WalletConnect onboarding.
- Refund requests and partial refunds from the merchant dashboard.
- Arkiv receipts and refund cases.
- World ID verification.
- Merchant SDK and demo store.
- Autopay (subscriptions).

### 5.2 Build next, in order (MVP for launch)

1. **Protected Pay (the escrow contract):**
   - Pay into escrow, then release on buyer confirmation or when the timer ends.
   - Refund on merchant approval, or automatically if the merchant misses the deadline.
   - Pattern to follow: Coinbase/Shopify's audited Commerce Payments Protocol (authorize / capture / void / refund).
2. **Verified payee card:** the screen before every payment shows the name, World ID status, account age, completed deals and disputes. Reputation comes from Arkiv receipts.
3. **Deal links:** "I'm selling X for 50 USDT, deliver within 3 days." You share one link or QR in Telegram or WhatsApp, the buyer pays into protection, and both sides see status.
4. **Dispute flow:** raise a problem, upload evidence, merchant answers, WondrPay desk decides. Add Kleros escalation later.
5. **Telegram bot:** create deals, get notified, and confirm delivery inside Telegram, where the users already are. **This is your distribution engine.**
6. **Pre-sign safety check:** before any signature, explain in plain words what it does and block unlimited approvals and drainer patterns.

### 5.3 Build later (after real usage)

- Multi-chain receive: Base and Arbitrum via Circle CCTP (USDC), USDT0 for USDT, Tron via the Whitechain Portal. **Never your own bridge or pool.**
- Mandate registry (Autopay v2): per-payment and monthly caps, one-tap revoke.
- AI features:
  - a refund-case copilot that drafts evidence and resolutions
  - plain-language pay ("send Priya 20 USDT")
  - an agent sub-wallet with hard caps
- Off-ramp to local currency through a licensed partner.
- The public **WondrPay Rules v1 spec** and SDK for other wallets.

### 5.4 Cut or avoid

- ❌ Your own bridge, liquidity pool or solver (hack risk plus money-transmitter risk).
- ❌ P2P "collect" requests and unlimited approvals (NPCI banned P2P collect for fraud).
- ❌ Custodial balances or a custodial card.
- ❌ Indian domestic retail payments.
- ❌ The name "WhitePay" anywhere user-facing (W Group runs a live product with that name).
- ❌ A token at launch. It brings regulatory risk and distracts from the product. Revisit only if the protocol needs one.

---

## Part 6: distribution (the half most founders forget)

Novelty gets attention, and distribution gets users. Plan both from day 1.

### 6.1 Built-in growth loops

- **Every protected payment touches two people.** The buyer pays, the seller has to open WondrPay to get paid, and the seller is now a user. That's the same two-sided loop that grew PayPal on eBay and UPI on merchant QRs.
- **Deal links spread themselves.** Each link shared in a Telegram group is an ad seen by everyone in it.
- **Public reputation compounds.** A seller with "47 protected deals, 0 disputes" wants to keep using WondrPay, because their reputation lives there, and other sellers want that badge too.

### 6.2 Channels, ranked for our beachhead

| Channel | How | Cost |
|---|---|---|
| **Whitechain / WhiteBIT** | Builders Program (grants up to $300k), co-marketing, a listing in their ecosystem, ideally a WhiteBIT-app integration. You're the only self-custodial payment layer on their new chain, so pitch that. | Free; takes relationship work |
| **Telegram P2P and freelancer communities** | Join 20–30 groups, help people, offer free protection for the first 100 deals, and work with group admins (give them a referral share) | Time |
| **Crypto Twitter and LinkedIn, building in public** | Weekly posts: what shipped, the numbers, the scams prevented | Time |
| **Ecosystem grants and hackathons** | Each one gives money plus an audience (Arc, Celo MiniPay, Base) | Free |
| **Partnerships with wallets** | Once the spec exists: "add WondrPay protection to your wallet in 20 lines" | Business development |
| **Content: scam stories** | "How I lost $800 in a USDT deal, and how to avoid it." Fear is a strong motivator. | Free |

### 6.3 Your first 100 users (the playbook)

1. Personally onboard the first 10 users: sit with them on a call, watch them use it, fix what confuses them.
2. Run 50 deals by hand if needed, as a concierge (you are the dispute desk).
3. Give the first 100 protected deals free protection.
4. Ask every happy user for one intro: "Who else do you trade with?"
5. Track it weekly in one sheet: users, deals, volume, disputes, repeat rate.

---

## Part 7: from testnet to mainnet (engineering checklist)

### 7.1 Chain readiness

- Whitechain mainnet (chain 1875) became an OP Stack L2 on 26 Oct 2026. **Official mainnet USDT is "pending audit".** The token we used on testnet is the Portal-bridged one. Confirm the official mainnet USDT address and EIP-3009 support with the Whitechain team before anything else.
- **Mainnet traps found in the research:**
  - `eth_chainId` returns the same value on the legacy L1 and the new L2.
  - Mainnet has a 16,777,216 gas-per-transaction cap that Sepolia doesn't.
  - There's a single sequencer, so wait for L1 finality before treating big payments as final.
- **Plan a second chain early (Base or Arbitrum, with USDC)** so one chain's problems can't take you down.

### 7.2 Security (non-negotiable before real money)

1. **Freeze the contracts:** escrow, router and Autopay. Keep them small, with no upgrade keys if you can avoid them, or a timelocked multisig if you can't.
2. **Write tests that attack the contracts:** redirected signature, double spend, over-refund, replay, expired authorisation. Tazor had 320+ tests; aim for similar.
3. **Get an external audit.** Small audits cost roughly $10k–50k. Ask the Whitechain Builders Program to fund or subsidise one, since grants often do. A public bug bounty (Immunefi) comes after launch.
4. **Run the relayer safely:**
   - a hot wallet with a small WBT balance and auto top-up from a cold wallet
   - per-user and per-IP rate limits and a daily gas budget (partly built)
   - alerts when the balance runs low
5. **Manage keys properly.** Deployer and admin keys go in a hardware wallet or a Safe multisig, never in `.env` on a laptop. **Rotate the test keys that were exposed during the hackathon (CUSTOMER_PK).**
6. **Set up monitoring:** error tracking (Sentry), uptime checks, an on-chain event watcher and a status page.
7. **Have an incident plan:** who gets paged, how to pause new deals (not withdrawals), and how to communicate.

### 7.3 Launch sequence

1. **Private beta on mainnet:** 20–50 invited users, a per-deal cap (e.g. $200), a team-funded protection fund.
2. **Public beta:** raise the caps, open sign-ups, publish the rules (refund deadlines, dispute process).
3. **General availability:** after 1–2 months with no critical incidents.

---

## Part 8: company, legal and compliance (do this in parallel)

**You're not ready to handle real money until these are done. Get a lawyer who knows crypto payments; this section is only a map of what to ask.**

1. **Incorporate.** You need a legal entity to sign grant agreements, partner contracts and investment documents.
   - Founders in India often run an Indian private limited company plus a holding company abroad (Delaware C-Corp, Singapore or UAE) when serving global users and raising from global investors.
   - Decide with a lawyer and a chartered accountant, because tax and FEMA rules matter.
2. **Get a co-founder agreement in writing:** equity split, vesting (standard is 4 years with a 1-year cliff), and roles. Unclear equity kills more startups than competitors do.
3. **Get a legal opinion on non-custody.** The key questions:
   - Does the relayer, which pays gas but never holds funds, make us a money transmitter?
   - Does the escrow contract, which holds funds by code, make us a custodian?

   FinCEN's 2019 guidance suggests unhosted-wallet software generally isn't a money services business, but there's no exemption for brief custody, and no court has ruled on relayers. Get it in writing.
4. **Check India specifically.** Serving Indian users as a virtual asset service provider requires **FIU-IND registration**; FIU-IND blocked 25 offshore platforms in Oct 2025. Ask the lawyer whether a non-custodial app needs it.
5. **Use licensed partners** for anything involving fiat: off-ramps, cards, KYC. Never touch fiat yourself in year one.
6. **Screen for sanctions:** block sanctioned addresses at both ends (Chainalysis has a free sanctions screening API).
7. **Publish terms of service and a privacy policy,** including the protection rules: what's covered, deadlines and limits.

---

## Part 9: money (business model, metrics, fundraising)

### 9.1 How WondrPay makes money

| Stream | Price (starting point) | Why it works |
|---|---|---|
| Plain P2P sends | Free | Growth; the cost is just relayer gas (under a cent) |
| **Protected payment fee** | 0.5–1% of the deal, paid by the buyer, seller or split | This is the product. Telegram escrow middlemen charge 1–5%, so you're cheaper and safer. Part of the fee funds the protection pool. |
| Merchant checkout | 0.5–0.8% | Below Stripe and PayPal (1.5%) and Whitepay (0.4–1.5%), with refunds included |
| Rules SDK for wallets and merchants (later) | Per-protected-volume fee or SaaS | The protocol revenue |
| FX spread (later) | Small spread on USDC↔EURC via Arc | Optional |

These prices are judgment, not sourced fact. **Test them.** The single most important early experiment: *do people pay for protection, and does it change how much they transact?*

**Don't build the model on yield** (interest on user balances). It's banned for stablecoins under GENIUS, and it would make you custodial.

### 9.2 The numbers investors will ask for

- **Weekly active users,** and how many come back (retention).
- **Number and value of protected payments** (TPV, total payment volume).
- **Revenue** (fees actually collected).
- **Dispute rate** and **refund turnaround time.** These are unique to you, so show them proudly.
- **Cost to acquire a user** (CAC), and how much they bring in over time (LTV).
- **Growth rate week over week.** At pre-seed, 10%+ weekly growth from a small base gets attention.

### 9.3 How funding works, stage by stage

| Stage | Typical amount | What you need to show | Where it comes from |
|---|---|---|---|
| **Grants (non-dilutive)** | $10k–$300k | A working product plus a plan for that ecosystem | **Whitechain Builders Program (up to $300k)**, Arc ecosystem, Celo MiniPay incentives ($1M pool), Base gas credits, other chain grants |
| **Pre-seed** | $250k–$1.5M | Team, insight, prototype, early users and growth | Angels (founders of crypto and fintech companies), crypto accelerators (Alliance, a16z crypto CSX, Y Combinator), small crypto funds |
| **Seed** | $2M–$10M | Real usage, revenue and a clear growth curve | Crypto venture firms. For comparison, a narrow stablecoin-clearing idea raised a $10M seed from a16z crypto in 2026. |
| **Series A** | $20M–$40M | Strong volume and unit economics | Emerging-market stablecoin rails raised $35M (Latitude) and $38M (Velocity) in 2026 |

**Your realistic path:**
1. **Now to 3 months:** grants, and get on mainnet.
2. **3–9 months:** pre-seed, once you have users and protected volume.
3. **12–24 months:** seed.

### 9.4 Your ask (pre-seed)

> **Raising $750k–$1M pre-seed for 18 months.** Use of funds:
> - **~55% engineering:** 2–3 engineers, plus the audit
> - **~20% growth and partnerships:** community, WhiteBIT and wallet partnerships
> - **~15% legal and compliance:** entity, opinions, licensed partners
> - **~10% protection fund and infrastructure**
>
> **Milestones it buys:**
> - mainnet launch
> - 5,000 users
> - $1M+ protected volume
> - 3 wallets or merchants using WondrPay Rules
> - a published refund-SLA track record

Adjust the numbers to your team size and location. Salaries in India stretch a round much further than in the US, and investors know it.

### 9.5 Pitch deck (10–12 slides)

1. **Title:** "WondrPay: buyer protection for stablecoin payments."
2. **Problem:** a real story. "Rahul lost 800 USDT to a fake seller on Telegram. He had no recourse." Then the scale: stablecoins move $24B a day with no refunds, no verified names and no safe mandates.
3. **Why now:** GENIUS/MiCA make stablecoins mainstream; Stripe, Circle and Mastercard built the rails; nobody built the rules.
4. **Solution:** Protected payments covering verified payee, escrow with a timer, auto-refund deadlines and a dispute ladder. Show the screens.
5. **Demo:** a 60-second video or 3 screenshots.
6. **Why it's novel:** a comparison table against Stripe ("Dispute support: No"), exchange P2P (custodial, single exchange) and Telegram middlemen (trust a stranger).
7. **Traction:** users, deals, volume, disputes resolved and growth. Even small numbers, honestly shown.
8. **Business model:** protection fee plus merchant fee plus Rules SDK.
9. **Go-to-market:** the beachhead, the WhiteBIT partnership, the Telegram loop.
10. **Market:** stablecoin payments volume, and the share where trust is the blocker.
11. **Team:** why you: hackathon builders who shipped a full app, plus any domain experience.
12. **The ask:** amount, use of funds, 18-month milestones.

### 9.6 How to approach investors

- **Warm intros beat cold emails** by a wide margin. Ask hackathon judges, mentors, the Whitechain team and other founders for them.
- **Cold message format:** 5 lines.
  1. Who you are.
  2. The problem.
  3. Traction.
  4. The ask.
  5. A link to a 2-minute video.

  No attachments in the first message.
- **Run the process tightly:** line up 20–40 conversations in 3–4 weeks. Momentum makes investors move.
- **The first cheque is the hardest.** Once one credible angel or fund commits, others follow.
- **Use a standard SAFE** (Y Combinator's template) for pre-seed, plus token warrants only if a token is genuinely planned. Get a lawyer to review it.

---

## Part 10: risks and how you'll know you're wrong

| Risk | Early warning | Response |
|---|---|---|
| People won't pay for protection | Fewer than 20% choose Protected when it's priced | Make protection free, charge merchants only, or move to beachhead B or D |
| Whitechain mainnet USDT is delayed | No address or date from the team | Launch on Base or Arbitrum with USDC first and keep Whitechain as the partner corridor |
| Friendly fraud (buyers falsely claiming non-delivery) | Dispute rate above 5% | Evidence requirements, reputation, caps, and World ID so one human can't run many accounts |
| A regulator says escrow is custody | Lawyer's opinion | Use a licensed escrow partner, or redesign so the buyer and seller jointly control release |
| A big player copies it | Binance or Telegram ships protected P2P | Be the neutral, cross-wallet standard. They're walled gardens; you're the rule layer everyone else can adopt. |
| A smart contract bug | Audit findings, bug bounty reports | Caps during beta, pause new deals, the protection fund, insurance later |

**Kill or pivot test at month 3:** if 30 interviews plus the beta give fewer than 50 repeat users and no one pays for protection, change the beachhead before raising.

---

## Part 11: the 90-day plan

### Weeks 1–2: validate, and set up the company

- [ ] Write down the one-line pitch and the beachhead (part 4).
- [ ] Hold **30 user interviews:** P2P traders, freelancers and small sellers who take USDT. Ask:
  - "How do you protect yourself in deals?"
  - "Have you been scammed?"
  - "What do you pay for escrow today?"
  - "Would you pay 0.5–1% for guaranteed refunds?"
- [ ] Sign the co-founder agreement. Pick a lawyer and a chartered accountant, and start incorporation.
- [ ] Rotate exposed keys and move admin keys to a multisig.
- [ ] Contact the Whitechain team: mainnet USDT timeline, Builders Program application, partnership.

### Weeks 3–6: build the MVP of Protected Pay

- [ ] Escrow contract (Commerce-Payments pattern), with refund timers and tests.
- [ ] Verified payee card and deal links.
- [ ] Telegram bot (create a deal, notifications, confirm delivery).
- [ ] Dispute flow, with you as the desk.
- [ ] Get the non-custody legal opinion.
- [ ] Submit the Builders Program application, and request audit funding.

### Weeks 7–10: audit, then a private mainnet beta

- [ ] External audit and fixes.
- [ ] Monitoring, status page and incident plan.
- [ ] Private beta: 20–50 invited users, a $200 cap per deal, free protection.
- [ ] Weekly metrics sheet. Post a weekly build-in-public update.

### Weeks 11–13: prove it and prepare to raise

- [ ] Publish **WondrPay Rules v0.1** (request, receipt, refund deadlines, dispute ladder) on GitHub.
- [ ] Turn on paid protection for new users, and measure take-up.
- [ ] Finish the pitch deck with real numbers. Collect 20+ warm intros.
- [ ] Start the pre-seed process if the metrics hold up; otherwise adjust the beachhead and repeat weeks 7–10.

### After that (months 4–12)

- Public launch. Add Base or Arbitrum with USDC via CCTP.
- Mandate registry, plus the AI refund copilot.
- First outside wallet or merchant adopts WondrPay Rules.
- Off-ramp partner. Inbound freelancer payouts to India (beachhead D).
- Raise the seed round once volume and retention are clear.

---

## Part 12: glossary (learn these words)

- **TPV:** total payment volume, the dollar value moved through you.
- **Take rate:** your revenue as a % of TPV.
- **Custodial / non-custodial:** whether you hold users' money or keys. Stay non-custodial.
- **Money transmitter / MSB / CASP / VASP:** legal categories for businesses that move other people's money or crypto. They need licences.
- **EIP-3009:** a signed "transfer authorisation" that lets someone else submit your payment and pay its gas. It's our gasless trick.
- **Relayer:** the server that submits signed transactions and pays gas.
- **Paymaster:** a contract that sponsors gas for smart-account users.
- **Escrow:** money held by a neutral party (for us, a smart contract) until conditions are met.
- **CCTP:** Circle's burn-and-mint system for moving USDC across chains. No pool.
- **USDT0:** Tether's equivalent for USDT on many chains.
- **ENS:** Ethereum Name Service, `name.eth`.
- **World ID:** proof that you're a unique human, without revealing who you are.
- **Arkiv:** the on-chain database where our receipts and refund cases live.
- **Mandate:** permission for someone to pull money from you on a schedule (Autopay).
- **SAFE:** a simple investment contract used at pre-seed. The investor gets equity later.
- **Pre-seed / seed / Series A:** funding stages, from idea to scaling.
- **Beachhead:** the first narrow market you dominate before expanding.
- **CAC / LTV:** cost to acquire a customer, and the lifetime value of that customer.
- **Retention:** the share of users who come back. It's the most important early metric.

## Part 13: what to read and watch next

- **Our own reports** (linked at the top). Re-read the "gaps" and "blueprint" sections of the deep research.
- **NPCI's UPI product overview and RBI's turnaround-time circular,** to learn the rulebook you're recreating.
- **Coinbase/Shopify Commerce Payments Protocol** (Base blog), the escrow pattern to copy.
- **Circle CCTP and Gateway docs,** for multi-chain later.
- **Y Combinator Startup School** (free online): talking to users, fundraising basics, the SAFE.
- **Paul Graham's essays "Do Things That Don't Scale" and "How to Raise Money,"** short and directly relevant.
- **Whitechain docs and Builders Program page,** your first funding and distribution partner.

---

### The whole plan in five sentences

1. Crypto already moves dollars fast and cheaply. What it lacks is the **rules** that made UPI trustworthy: verified names, refunds with deadlines and safe mandates.
2. WondrPay becomes **the rule layer**, starting with *Protected payments* (verified payee plus timed escrow plus auto-refund plus disputes), and never holds anyone's money.
3. Launch for **people who pay strangers in USDT** (P2P deals and freelancers), through Telegram and the Whitechain/WhiteBIT ecosystem, where the pain is daily and people already pay middlemen.
4. Get to mainnet safely with an audit, a multisig, caps and a legal opinion, and fund it with **Whitechain grants first, then a ~$750k–1M pre-seed** once users pay for protection.
5. Then open the rules as a spec other wallets adopt, which is what turns an app into infrastructure, and that's the story that raises the seed round.
