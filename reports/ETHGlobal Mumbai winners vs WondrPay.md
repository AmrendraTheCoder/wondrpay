# ETHGlobal Mumbai 2026: every prize winner, and how WondrPay compares

Collected on **9 Nov 2026** from ETHGlobal's own pages.

**Sources**
- **Prize list and rules:** https://ethglobal.com/events/mumbai/prizes
- **All 622 submitted projects:** https://ethglobal.com/showcase?events=mumbai (19 pages)
- **Winners:** each winning project's showcase card carries a sponsor prize badge. I opened each of those 71 project pages, and the page's own `prizes` data gives the exact track and place. Every project link below is its ETHGlobal page: `https://ethglobal.com/showcase/<slug>`.
- **"Live?" column:** I opened each project's own *Live Demo* link from this Mac today and recorded the HTTP status.

**What I could not get**
- **The 10 overall finalists.** The prize page says finalists are "the top 10 teams", but ETHGlobal hasn't marked them on the showcase yet. The organisers' prize deck (Google Slides) is private.
- **A few places.** Where a place isn't in the page data (for example World Agent Pass 2nd, ENSv2 1st), I say so rather than guess.

**Event facts**
- 5–7 Nov 2026, Jio World Convention Centre, Mumbai.
- $175,000 in prizes across 12 partners.
- 800+ attendees and 622 submitted projects.
- 71 projects won at least one partner prize, about 11% of projects.

---

## 1. Winners by partner and track

**Key to the tables**
- **Live?**
  - ✅: the demo site answered today.
  - ⚠️: the demo link is only a GitHub repo or a video.
  - ❌: the site is down (temporary Cloudflare tunnels, or an error page).
- **Before?** "Existing" means the prize is a *Continuity* track prize, for teams that brought a product they already had. Every other winner was built at the event.

### Whitechain ($15,000): our track

| Track | Place | Project | What it does | Live? | Before? |
|---|---|---|---|---|---|
| Operate · Stablecoin Payments for Business | 🥇 1st | **PoP** (`pop-qdjot`) | Protected checkout for India's cash-on-delivery social commerce (Instagram → WhatsApp). The buyer pays USDT into escrow, a six-word delivery code at the door releases it, there's a short window to report a problem, and sellers build a reputation from verified purchases. | ✅ | New |
| Operate | 🥈 2nd | **Tap2ETH** (`tap2eth-ck8gt`) | Your ordinary contactless bank card becomes one signer of a smart wallet, and your phone's fingerprint is the other. You tap on a POS terminal to pay in stablecoins. Also won Uniswap 4th. | ✅ | New |
| Operate | 🥉 3rd | **Zeeto** (`zeeto-whitechain-z7yeo`) | Gas-free USDT for street stalls: map, order ahead, pickup code, 7 ways to pay (stall QR, bill QR, WhatsApp link…), and a merchant dashboard with an AI assistant. | ✅ | New |
| Scale · Payments Nobody Notices | 🥇 1st | **EnsWhite** (`enswhite-69gm6`) | A founder "hires" AI departments, each with an ENSv2 name, a budget and approved vendors. They pay vendors in gasless USDT, and the founder sees rupee receipts. | ✅ | New |
| Scale | 🥈 2nd | **Countersignn** (`countersignn-zqs56`) | Spending mandates for AI agents. The contract enforces the budget, the merchant allow-list and an approval threshold. Big payments need a World ID-gated owner approval. | ✅ | New |
| Scale | 🥉 3rd | **FaceVisa** (`facevisa-m5ee9`) | Creators license their face to AI ads. Each ad is approved by its file hash and paid in USDT. Licences live on Arkiv, with a public verifier. | ✅ | New |
| Continuity · Bring Your Product | 🥇 1st | **Dopamyn** (`dopamyn-6f8sy`) | An existing Web3 growth and outreach company (IIT Kanpur founders). Moved creator payouts and a paid contact finder to Whitechain. | ✅ | Existing |
| Continuity | 🥈 2nd | **Vyomanaut** (`vyomanaut-rbfvi`) | Distributed storage on idle phone and PC disks, now paid on Whitechain. | ⚠️ video | Existing |
| Tokenize · Real World Finance | Winner | **Insurevex** (`insurevex-k3sto`) | Crash insurance for stocks, funded by savers. | ✅ | New |

**Payment and checkout projects in this track that did *not* win:**
- WondrPay, submitted as **WhitePay** (`whitepay-svxd4`)
- **Tazor**: the most complete checkout, with 320+ tests, x402, a B2B layer and a real merchant (Healthsoft)
- **SettleKit**
- **Numa**
- **Tender**
- **SenFund**
- **Credra**
- **Hundiiii**

### Arc / Circle ($15,000)

| Track | Project | What it does | Live? |
|---|---|---|---|
| Best DeFi app in Arc Studio | **Earlyout** | Sell a pending fund redemption today for USDC, at a price that explains its own risks | ✅ |
| Best mobile consumer agent (Discovery API) | **RupeeRail** | **Pay any UPI merchant in India by scanning their normal QR with stablecoins.** The operator pays the merchant in rupees over UPI. Funds sit in an escrow vault on Arc or Whitechain with a dispute window. A Razorpay on-ramp is included. | ✅ |
| Advanced stablecoin logic | **Dynaura** | Solar energy distribution, paid on-chain | ✅ |
| Bridge Kit for non-USDC assets | **Inphinity** | Index funds of tokenised stocks. Also won ENSv2 3rd and Chainlink CCIP. | ✅ |

### Arkiv ($15,000)

| Track | Place | Project | Live? |
|---|---|---|---|
| Mirror something Ethereum depends on | 1st | **AXIS**: Arkiv data explorer | ✅ |
| Mirror | 2nd | **chainroll**: Ethereum chain list on Arkiv, with RPC checks | ✅ |
| Build on Arkiv (from scratch) | 1st | **Charter**: git hosting where on-chain rules decide merges | ⚠️ GitHub |
| Build on Arkiv (from scratch) | 1st | **GraphPay**: AI agents with ENS names query Arkiv, then pay USDT on Whitechain | ✅ |
| Build on Arkiv (from scratch) | 2nd | **Any%**: verifiable speedrun anti-cheat (also World IDKit) | ✅ |
| Build on Arkiv (from scratch) | 2nd | **GPU Pool**: pooled home computers for AI inference (also Hedera 2nd) | ✅ |
| Build on Arkiv (from scratch) | 2nd | **Bid3**: live auctions with on-chain receipts | ✅ |
| Build on Arkiv (from scratch) | 2nd | **HunterVerse**: AR creature hunt for shop discounts | ❌ |
| Build on Arkiv (existing projects) | 1st | **Stryde**: fitness app (existing) | ✅ |
| Node tooling | Winner | **Lookout-Arkiv**: health and disk forecast for node operators | ❌ |
| Arkiv + Swarm bonus (from scratch) | Winner | **Haven**: private file sharing to ENS names | ✅ |
| Arkiv + Swarm bonus (existing projects) | Winner | **Stryde** | ✅ |

### World ($12,500)

| Track | Place | Project | Live? |
|---|---|---|---|
| World ID Agent Pass | 1st | **Paradigm**: AI agents pay verified humans in USDC to film training clips | ✅ |
| World ID Agent Pass | 3rd | **Lore**: agents sell research to each other, with human approval | ✅ |
| World ID Agent Pass | (2nd not in page data) | **Air Agents** has a World badge: AirPods head-tracking agents | ✅ |
| Best Use of IDKit ($1,250 each) | Winner | **Any%**, **If I Go Silent** (dead-man's-switch envelope), **Blind Report** (anonymous tips for journalists), **Settld** (milestone escrow with human dispute jurors) | ✅ |
| [Continuity] Best Use of IDKit | Winner | **Stryde**, **zk-seal** | ✅ |

### ENS ($10,000)

| Track | Place | Project | Live? |
|---|---|---|---|
| Best Use of ENSv2 | 2nd | **Navik**: Vercel-style deploys of immutable sites, controlled by ENSv2 | ✅ |
| Best Use of ENSv2 | 3rd | **Baton**: fault-tolerant agent jobs | ✅ |
| Best Use of ENSv2 | 3rd | **Inphinity** | ✅ |
| Best Use of ENSv2 | 1st | (not in page data) | — |
| ENSv2 in an existing project | 1st | **Bramble**: WireGuard access for agents, authorised by ENS (existing) | ✅ |
| ENSv2 in an existing project | 2nd | **zk-seal**: hide faces in photos with a ZK proof (existing) | ✅ |

### Ethereum Foundation ($15,000)

| Track | 1st | 2nd | 3rd |
|---|---|---|---|
| Best Use of Anon-RPC | **Veil**: one Tor circuit per account | **Atmos RPC**: private RPC over Nym | **Navik** |
| Frame-transaction alt mempool (EIP-8141) | **Relayless**: private pay from a wallet with zero ETH | **Framecraft**: post-quantum wallets and a frame DSL | **Unrelayed**: relayer-free Tornado withdrawals (⚠️ GitHub only) |
| Best CROPS App | **BombayLocal**: zero-knowledge offline Mumbai local train pass | **Recall**: verifiable web snapshots | **Clave**: Aztec multisig |
| CROPS upgrade to an existing project | **RailBao**: Railgun wallet on a hardware device (existing) | — | — |

### Hedera ($14,250)

| Track | 1st | 2nd | 3rd |
|---|---|---|---|
| AI Agents That Pay: x402 | **CashETH**: credit for AI agents against unpaid invoices | **GPU Pool** | **Inklink**: an agent pays for private printing at local shops |
| Tokenize with Hedera Studios | **Deski**: desk robot that stakes on your focus | **NIVASA**: real-world asset lifecycle | **Faultline**: earthquake catastrophe bond |
| No-Solidity, or Continuity | **Bramble** (Continuity). **SurgePass** (fair queue for Tatkal and concert drops, World ID plus Hedera draw) and **Air Agents** carry Hedera badges, but their exact track isn't in the page data. | | |

### Uniswap Foundation ($15,000)

| Place | Projects |
|---|---|
| 1st | **seiz3**: hedged liquidations for tokenised stocks (❌ site 530 today); **Poincaré**: a v4 hook that makes trend-chasers pay LPs |
| 2nd | **ETHCraft**: Minecraft city with AI agents (⚠️ GitHub) |
| 3rd | **Aven**: v4 hook priced from the Hyperliquid oracle; **Lifeline**: credit lines for AI agents |
| 4th | **Tap2ETH**; **Opaque**: post-quantum key layer |

Two projects carry each of 1st, 3rd and 4th because Uniswap ran a main track and a Continuity track with the same name, and the page data doesn't say which is which.

### 0G ($15,000)

| Track | Place | Project |
|---|---|---|
| Build with 0G Private Computer | 1st | **Juicebox** |
| Build with 0G Private Computer | 2nd | **SAKA** |
| Build with 0G Private Computer | 3rd | **Hissa** |
| Physical AI: Agents with a Body | 1st | **Vitaquack** |
| Physical AI | 2nd | **Odyssey** |
| Agents That Pay for Themselves | Winner | **Iva**: Telegram grocery agent (⚠️ video) |
| Agents That Pay for Themselves | Winner | **Vesta** |
| Keep Building on 0G | Winner | **Stryde** |

### 1inch ($7,000), Chainlink ($5,000), Definitive ($5,000)

- **1inch, Build an Aqua App:**
  - 1st **Mandate**
  - 2nd **Moonglade**
  - 3rd **Stance**
- **1inch, Continuity track:**
  - 1st **Noirwire** (existing)
  - 2nd **Aquantis** (existing)
- **Chainlink:**
  - CRE: **Outvest** (brands lock USDC, Chainlink checks YouTube views, creators are paid on Arc)
  - CCIP 2.0: **session**, **Inphinity**
- **Definitive:** **Frontrun**, social trading on Arc mainnet

---

## 2. "Does it exist in the market?" An honest answer

- **Nearly all are hackathon prototypes on testnets.** 66 of the 71 demo links answered today. That means a demo page is up, not that real customers use it. I did not find user or revenue numbers for any winner.
- **Products that existed before the event** (the Continuity winners):
  - Dopamyn (dopamyn.ai, a company with founders and an existing product on Base and Arbitrum)
  - Stryde (stryde.social)
  - Noirwire (noirwire.com)
  - Bramble
  - RailBao
  - zk-seal
  - Aquantis
  - Vyomanaut

  These are the closest to "in the market".
- **On Arc mainnet:** Frontrun says it runs on Arc mainnet. Every Whitechain winner ran on Whitechain *Sepolia* (testnet), because the prize rules required it.
- **Real-world overlap with WondrPay:**
  - **RupeeRail** is the only winner going after the same "UPI and stablecoins" idea. It does it the opposite way from us: it *converts to rupees and pays out over UPI* through an operator liquidity pool. That is exactly the "central pool" model we discussed earlier.
  - **PoP**, **Zeeto** and **Tap2ETH** are the closest merchant-checkout competitors.

---

## 3. WondrPay vs the winners: where we're stronger and where we're weaker

**Note on what judges saw.** Our ETHGlobal page (`whitepay-svxd4`) describes WhitePay mainly as a **checkout SDK with a tamper-proof fee**: fee, order, amount and expiry all sit inside the signed message, and a router splits the money atomically. The full WondrPay app (P2P, ENS names, refunds, Autopay, Arkiv receipts, World ID) is broader than that description.

### Where WondrPay is stronger

| Strength | Compared with |
|---|---|
| **Breadth:** both consumer *and* merchant sides. P2P by QR, ENS names, checkout SDK, subscriptions (Autopay), partial refunds with a refund desk, Arkiv receipts, World ID rewards. | Most winners do one thing: PoP is escrow checkout, Zeeto is stalls, Countersignn is agent mandates. |
| **Payer protection in the signature:** the relayer can't change the fee, recipient or amount. | PoP, Zeeto and EnsWhite also use EIP-3009 but don't stress fee tampering. Tazor does the same (and also didn't win). |
| **A full "UPI-like" consumer experience:** a name instead of an address, scan to pay, a PIN, a history page. | Only RupeeRail aims at UPI, and it bridges *to* UPI rather than replacing it. |
| **Non-custodial:** money goes wallet to wallet, with no pool. | RupeeRail's model needs a rupee liquidity pool and a licensed operator, which brings regulatory and capital risk. |
| **Polish:** a real deployed app, demo video, SDK docs, demo shop. | Many winners have only a GitHub link or a video. |

### Where WondrPay is weaker, and probably why it didn't place

| Weakness | What the winners did instead |
|---|---|
| **No single sharp story.** "Checkout SDK for any business" is the generic idea the track itself listed, and about 8 teams built it (Tazor, SettleKit, Numa, Tender, SenFund…). The judges had to pick between near-identical checkouts. | **PoP** picked one painful Indian problem (cash-on-delivery trust between strangers on Instagram and WhatsApp) and designed every feature around it. **Zeeto** picked street stalls, **Tap2ETH** picked "your bank card is your hardware wallet". |
| **No new trust mechanism the judges hadn't seen.** EIP-3009 plus a relayer was the expected baseline ("Ideas to start from" in the prize text). | PoP: delivery code plus a dispute window plus reputation. Tap2ETH: an EMV card's RSA chip as a wallet signer. Countersignn: enforced mandates plus World ID approval. Each had something new. |
| **Breadth spread across too many tracks.** Judges score against one track's rubric, so features outside it don't count. | Winners went deep on one track's "What we want to see" list. |
| **No real customer named.** | Tazor named Healthsoft (and still didn't win, so it isn't enough alone). Dopamyn had a running business. |
| **The submission text undersold the product.** The page describes the router and fee, not the consumer app, refunds and P2P you built. | Winners' first line is the user's problem: "Do you offer cash on delivery?" or "Street stalls run on cash and UPI." |
| **Scale track:** our payer still uses MetaMask or a PIN. | The Scale winners made crypto invisible: rupee receipts (EnsWhite), agents that never hold gas (Countersignn), a brand that never sees gas (FaceVisa). The rule was "zero crypto steps visible". |

### Verdict

- **As a product,** WondrPay is broader and more complete than most Whitechain winners, and its non-custodial "names + QR + refunds" design is a better long-term base than RupeeRail's pool model.
- **As a hackathon entry,** it was weaker. It looked like the generic checkout the track had already described, with no single Indian pain point and no new mechanism. The winners won on one sharp story plus one new trust idea, not on feature count.
- **Next time, and for the pitch:**
  - Lead with one user and one pain, for example *"paying a stranger you found on Instagram, with your money back if it never arrives"*.
  - Make the **rule layer** (refund timer, dispute window, merchant verification) the new mechanism.
  - Show it working end to end in 2–3 minutes.
