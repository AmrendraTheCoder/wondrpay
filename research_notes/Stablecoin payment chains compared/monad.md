# Monad: Technical and Payments Profile (as of November 2026)

Scope: Monad L1 as a rail for a universal "UPI for stablecoins" app. Research date: 2026-11-09. Many usage metrics come from Monad Foundation's own blog (self-reported); flagged where relevant.

## Architecture: consensus, execution, block time, finality, throughput

### Takeaway
Monad is a fully EVM-compatible L1 with 300 ms blocks (measured mean ~302 ms, Sept 2026), 300 ms speculative finality and 600 ms (2-slot) full finality as protocol guarantees. The "10,000+ TPS" figure is design capacity, not measured demand. Monad's own docs say so, and I found no independent measurement of sustained mainnet TPS.

### Cited Findings
- Mainnet chain ID 143, currency MON, client v0.16.1 (revision MONAD_TEN), RPC https://rpc.monad.xyz. Testnet chain ID 10143. Consensus: MonadBFT. — [Monad docs: current facts](https://docs.monad.xyz/ai/current-facts)
- Block time 300 ms observed; mean ~302 ms in September 2026. Speculative finality 300 ms (1 slot) and finality 600 ms (2 slots), both stated as protocol guarantees. — [Monad docs: current facts](https://docs.monad.xyz/ai/current-facts)
- Throughput "10,000+ TPS" is described as design capacity for typical transactions, "not a reading of current demand". Block gas limit 150M gas (observed), giving about 500M gas/s (150M / 0.3 s). Per-transaction gas limit 30M. — [Monad docs: current facts](https://docs.monad.xyz/ai/current-facts)
- The 10,000 TPS claim dates to a 2024 devnet/testing result (with 1 s blocks at the time), not live mainnet. — [The Block, Mar 2024](https://www.theblock.co/news/ecosystems/2024-03-14-monad-10000-tps-devnet-launch-278182)
- Measured demand: ~3.5M transactions/day at end of July 2026, which works out to roughly 40 TPS average. 500M+ total transactions since launch. 15,000+ daily active addresses. About 200 validator nodes. — [Monad blog: "The Monad Economy: Eight Months In" (Jul 27, 2026)](https://www.monad.xyz/blog/monad-economy-eight-months-in) (self-reported; the ~40 TPS figure is my own arithmetic)
- Asynchronous execution: consensus orders transactions before they execute. As a DoS-prevention measure, gas is therefore charged on the gas limit rather than gas used. A "Reserve Balance" mechanism ensures that included transactions can pay for gas. An included transaction can still revert at execution if it overspends MON, and it still pays gas when it does. — [Monad docs: differences from Ethereum](https://docs.monad.xyz/developer-essentials/differences)
- There is no global mempool: transactions are forwarded to the next few leaders. Blob (type-3) transactions are not supported. Max contract size is 128 KB. — [Monad docs: differences](https://docs.monad.xyz/developer-essentials/differences)
- Reliability incident: a Hetzner outage took about 10–13% of validators offline temporarily. Most recovered within an hour, and the incident started a debate about infrastructure concentration. — [The Monad Pulse #019](https://themonadpulse.substack.com/p/the-monad-pulse-019) (community newsletter, secondhand)
- Background (not verified this session): Monad's design also includes optimistic parallel execution, where transactions run in parallel and are re-executed on conflict so results match serial order, and MonadDB, a custom state database optimized for SSD/async I/O. The Monad docs present these as core components. — [Monad docs](https://docs.monad.xyz) (flag: architecture pages not re-fetched)

### Inferences
- For point-of-sale UX, 600 ms hard finality is effectively instant. A wallet can show "paid" at speculative finality (300 ms) and settle at 600 ms. That is competitive with Solana and Sei, and far faster than Ethereum L1 or most L2s, whose L1 finality takes minutes.
- Real load (~40 TPS average) is about 0.4% of design capacity, so congestion-driven fee spikes are unlikely in the near term. This is not proof the chain holds up at UPI-scale load (UPI handles thousands of TPS at peak).
- Charging fees on the gas limit means a payments app must set tight gas limits. An overestimate becomes a real overpayment, unlike on Ethereum.

### Gaps
- No independent (DefiLlama, Artemis, Chainspect) measurement of sustained or peak TPS was found.
- No formal post-mortem on the Hetzner incident, and no full downtime/halt history for mainnet, was found.
- MonadBFT specifics (tail-fork resistance, leader rotation) and MonadDB internals were not re-verified against primary docs in this pass.

## Gas model, fees, sponsorship, account abstraction, passkeys

### Takeaway
Fees are EIP-1559-like with a 100 MON-gwei floor. An ERC-20 transfer costs about 0.0065 MON (~$0.00016 at the floor, per Monad docs). There is no protocol-level gasless or stablecoin-gas mode, so sponsorship is handled by apps through ERC-4337 paymasters (Pimlico, ZeroDev), EIP-7702, or EIP-3009 relays. Passkeys are well supported via the P-256 precompile.

### Cited Findings
- The base fee is set by the system per block, using an EIP-1559-like controller that rises more slowly and falls more quickly. The minimum base fee is 100 MON-gwei. Price per gas = min(base + priority, max). Fees are charged on the gas limit. Controller target is 80% of block capacity. — [Monad docs: gas pricing](https://docs.monad.xyz/developer-essentials/gas-pricing)
- Typical costs at the minimum base fee: ERC-20 transfer ~65,000 gas ≈ 0.0065 MON ≈ $0.00016; native MON transfer 21,000 gas ≈ 0.0021 MON; DEX swap ~200,000 gas ≈ 0.02 MON. — [Monad docs: gas pricing](https://docs.monad.xyz/developer-essentials/gas-pricing) (the USD figure depends on the MON price assumed by the docs)
- EIP-7702 is supported, with a twist: a delegated EOA's balance cannot be lowered below 10 MON while delegated, and CREATE/CREATE2 are banned when a delegated EOA is called as a contract. — [Monad docs: differences](https://docs.monad.xyz/developer-essentials/differences)
- The secp256r1/P-256 verification precompile (EIP-7951) is at address 0x0100, which makes on-chain WebAuthn/passkey verification cheap. — [Monad docs: differences](https://docs.monad.xyz/developer-essentials/differences)
- ERC-4337 infrastructure: Monad docs list Pimlico (bundler + paymaster) and ZeroDev. ZeroDev shows as supported on the current page and "in progress" on older versions. — [Monad docs: AA providers](https://docs.monad.xyz/tooling-and-infra/wallet-infra/account-abstraction)
- MetaMask has sent more than 1 million gasless transactions on Monad. — [Monad blog: August 2026 highlights](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026)
- Monad's Machine Payments Protocol package (`@monad-crypto/mpp`) supports a "pull" mode in which the payer signs an ERC-3009 `transferWithAuthorization` and the server pays gas. This is a gasless stablecoin payment path for tokens that implement ERC-3009, such as USDC. — [Monad docs: MPP overview](https://docs.monad.xyz/reference/mpp/overview.md)

### Inferences
- A sponsored-gas stablecoin app is straightforward on Monad. Users can sign USDC EIP-3009 authorizations, which a relayer submits, or use 4337 smart accounts with passkey signers via P-256, with a Pimlico or ZeroDev paymaster. Sponsorship cost per transfer is a fraction of a cent.
- The 10 MON floor on EIP-7702-delegated EOAs is a real UX tax for a "gasless, stablecoin-only" user. Users would need to hold MON to use 7702 delegation, which pushes designs toward 4337 smart accounts or EIP-3009 relays instead of 7702.
- Unlike Tempo, Plasma, Arc or Stable, there is no native "pay gas in USDC" or protocol-level zero-fee USDT transfer. Gas abstraction is entirely the app's job.

### Gaps
- The MON price used in the $0.00016 figure, and real average fees paid on mainnet, were not independently confirmed.
- No confirmation of Alchemy, Biconomy, Gelato or Coinbase CDP paymaster support on Monad mainnet in this pass.
- The docs do not say whether EntryPoint v0.8 (with native 7702 support) is deployed on Monad.

## Stablecoins, liquidity, bridges

### Takeaway
Native USDC with CCTP v2 and USDT0 (via LayerZero) both went live within days of mainnet launch (Nov 24, 2025). Stablecoin supply grew from about $500M mid-2026 to over $767M by Aug 31, 2026 (self-reported). The roster also includes AUSD, EURW and SoFiUSD (via BitGo). USDT0 liquidity was thin early on.

### Cited Findings
- Mainnet launched Nov 24, 2025. It reached about $410M TVL faster than recent L1s. — [Everstake institutional guide](https://everstake.one/resources/blog/monad-staking-institutional-guide). Note: a CoinMarketCap AI page conflicts, saying "mainnet late October 2026" — [CMC](https://coinmarketcap.com/cmc-ai/monad/latest-updates/). That appears to be an error; most sources agree on Nov 2025.
- Circle launched native USDC, CCTP (v2), Circle Wallets and Circle Contracts on Monad at launch. USDC address 0x754704Bc059F8C67012fEd69BC8A327a5aafb603. CCTP connects to 17 other chains (some coverage says 18). — [Circle blog](https://www.circle.com/es-la/blog/now-available-usdc-cctp-wallets-and-contracts-on-monad); [crypto.news](https://crypto.news/circle-to-enable-usdc-on-monad-mainnet-on-day-1/)
- USDT0 went live on Monad Nov 26, 2025. — [Stablecoin Insider](https://stablecoininsider.org/tethers-usdt0-live-on-monad.md) (single secondary source). According to Aave governance, USDT0 on Monad uses a native-bridge 3-DVN setup, and liquidity sat mostly in a Curve 3pool, with the top 5 pools under $5M TVL at the time of posting. — [Aave governance forum](https://governance.aave.com/t/arfc-deploy-aave-protocol-v3-7-on-monad/24943/3)
- Stablecoin market cap: $550M+ at end of July 2026 — [Monad blog, Jul 27 2026](https://www.monad.xyz/blog/monad-economy-eight-months-in). Above $767M as of Aug 31, 2026 — [Monad blog, Aug 2026 highlights](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026). Both are self-reported.
- Other stablecoins named: EURW, AUSD and USDT, plus "others" — [Monad blog, Jul 2026](https://www.monad.xyz/blog/monad-economy-eight-months-in). SoFiUSD, described as the first stablecoin issued by a U.S. national bank, is available on Monad via BitGo — [Monad blog, Aug 2026](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026).
- DeFi context: $770M+ DeFi TVL and $1.4B+ TVL including borrows (end of July 2026). Monthly DEX volume is consistently above $1B. Tokenized RWA is $430M+. — [Monad blog, Jul 2026](https://www.monad.xyz/blog/monad-economy-eight-months-in). An October 8 snapshot reported about 918M transactions, $993M DeFi TVL, 9M+ wallets and 143+ apps — [YesPress](https://yespress.io/monad.md) (aggregator, company-reported figures).
- On/off-ramps: more than 30 fiat onramps, including Coinbase, MoonPay, Transak and zerohash, plus regional PIX (Brazil) and UPI (India) rails. — [Monad blog, Jul 2026](https://www.monad.xyz/blog/monad-economy-eight-months-in)
- Wormhole was among the day-one apps. — [livebitcoinnews (Circle launch coverage)](https://www.livebitcoinnews.com/crypto-news-circle-launches-usdc-and-cctp-on-monad-with-day-one-defi-apps)

### Inferences
- With native USDC and CCTP v2, a cross-chain app can move USDC in and out of Monad by burn-and-mint, with no wrapped-asset risk. That is the cleanest bridging path. USDT0 via LayerZero OFT covers the USDT side.
- About $0.5–0.8B of stablecoins is small next to Tron (~$80B), Ethereum or Solana. Stablecoin supply on Monad is DeFi-heavy rather than payment-float-heavy.

### Gaps
- No independent DefiLlama or Artemis stablecoin breakdown (USDC vs USDT0 vs AUSD shares) was retrieved.
- No current figure for USDT0 depth or USDC/USDT0 swap slippage on Monad.
- No stablecoin supply figure for Sept–Nov 2026 was found.

## Payment projects, products and official initiatives ("Monad Pay")

### Takeaway
There is no official consumer product called "Monad Pay" from the Monad Foundation. "MonadPay" exists as a Foundation-hosted Notion page describing a `monadpay://` deeplink/payment-link scheme (contents could not be read). "Monad Pay" was also a 2025 Mobil3 hackathon bounty winner (a virtual Visa debit card app). The Foundation's official payments effort runs through its July 2025 acquisition of Portal Labs, its Head of Payments Raj Parekh, card and fintech partners, and agentic-payments standards (x402, MPP, Agentic Payments Alliance).

### Cited Findings
**Official Foundation initiatives**
- July 2025: Monad Foundation acquired Portal Labs, a stablecoin infrastructure company that powers "millions of dollars in daily stablecoin settlement" for fintechs. Terms were undisclosed. Portal CEO Raj Parekh became Head of Payments and Stablecoins. The goal is a full-stack payments solution: liquidity integrations, compliance modules and developer tooling. — [Business Wire](https://www.businesswire.com/news/home/20250709812093/en/Monad-Foundation-Acquires-Portal-to-Accelerate-Stablecoin-and-Payments-Strategy); [Monad blog](https://monad.xyz/blog/monad-foundation-acquires-portal). Sources conflict on structure: [The Block](https://www.theblock.co/post/361803/monad-foundation-to-bring-payment-solution-to-monad-by-acquiring-stablecoin-infrastructure-developer-portal-labs) says Portal operates as a subsidiary, while [Blockworks](https://blockworks.co/news/monad-foundation-acquisition-portal) says it stays independent.
- The Foundation joined the x402 Foundation as one of 20 governing board members. — [Monad blog, Apr–Jun 2026 highlights](https://monad.xyz/blog/monad-ecosystem-highlights-april-june-2026)
- The Foundation joined the Agentic Payments Alliance, led by Rain, with 26 companies. — [Monad blog, Aug 2026](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026)
- Machine Payments Protocol SDK `@monad-crypto/mpp`: HTTP 402 challenge/credential flow with push mode (client sends an ERC-20 transfer) and pull mode (ERC-3009 authorization, server pays gas). Defaults to mainnet chain 143. — [Monad docs: MPP](https://docs.monad.xyz/reference/mpp/overview.md)
- "MonadPay" Notion page on monad-foundation.notion.site. Search snippets describe link-based payments (`monadpay://`) that work with MetaMask, Rabby and Rainbow, but the page body would not render when fetched. — [Notion](https://monad-foundation.notion.site/MonadPay-2726367594f281238bf0ef9a2f0883b0) (unverified; it may be a hackathon idea or spec rather than a product)

**Card networks and card issuers**
- Visa and Mastercard both support stablecoin payments on Monad. Rain issues cards that spend stablecoins wherever Visa is accepted. — [Monad blog, Jul 2026](https://www.monad.xyz/blog/monad-economy-eight-months-in)
- Rain's integration includes agent-initiated card payments on Monad. Mastercard added Monad to its Crypto Partner Program (reported April 2026 via a LinkedIn repost, lower confidence). Monad was added to the Visa Onchain Analytics Dashboard. — [Monad blog, Apr–Jun 2026](https://monad.xyz/blog/monad-ecosystem-highlights-april-june-2026); [Monad blog, Aug 2026](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026)
- A June 2026 article on Monad and Rain stablecoin card tests cautions that this is not proof Monad has "won" stablecoin payments. — [Startup Fortune](https://startupfortune.com/?p=10809)

**Wallets, fintechs and PSPs live on Monad**
- MetaMask Money Account: self-custodial, yield-bearing dollar account, spendable via MetaMask Card. MetaMask Agent Wallet supports Monad with spending limits. — [Monad blog, Aug 2026](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026)
- Abound, a financial super-app for the Indian diaspora, chose Monad. It has processed over $500M in remittance volume, though this figure may include volume from before Monad. — [Monad blog, Aug 2026](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026)
- Meru (top-ups in 150+ countries) and Cero (spending, rewards, credit-building) are live on Monad. — [Monad blog, Aug 2026](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026)
- CambioReal runs a US–Brazil–LATAM remittance corridor on Monad. — [Monad blog, Apr–Jun 2026](https://monad.xyz/blog/monad-ecosystem-highlights-april-june-2026)
- zerohash added USDC payments on Monad for its platform partners (Feb 12, 2026). — [GlobeNewswire](https://www.globenewswire.com/news-release/2026/02/12/3237095/0/en/zerohash-brings-high-performance-stablecoin-payments-to-monad-network.html)
- Coinflow is live on Monad for fiat and crypto checkout. — [Coinflow blog](https://coinflow.cash/blog/coinflow-monad/)
- WalletConnect Pay on Monad: any WalletConnect-enabled wallet can pay at WalletConnect-enabled merchants. Haha Wallet is cited. — [WalletConnect blog](https://walletconnect.com/blog/monad-and-walletconnect) (promotional)

**Hackathon projects**
- Mobil3 (LatAm, ~Aug 2025) bounty winner "Monad Pay": a virtual debit card and mobile app that spends ERC-20s from a Monad wallet at Visa merchants, plus savings vaults and rewards points. Other notable payment entries: Orbe (USDC remittance, flat 2.5% fee), Agnostic Pay (phone as NFC crypto-to-fiat terminal), Malintzin (QR payments), AztlanFi, and Kiosko (swap+send in one transaction). — [0x blog, Sep 11 2025](https://0x.org/post/monad-mobil3-hackathon-bounty-showcase); [Portal on Mobil3](https://www.portalhq.io/post/mobil3-hackathon)
- OwnPay: self-reported top-3 at a Monad NYC hackathon (Apr 2024), a contactless payment layer built on Privy. — [GitHub](https://github.com/Nahs900/ownpay)
- A third-party "monad-pay" GitHub repo implements payment URLs (recipient, amount and token encoded in the link). — [GitHub mirror](https://github-users.yhajoa.workers.dev/Danish0703/monad-pay)
- Monad Metropolis hacker houses (e.g. London, Oct 2026) offer $30K overall plus per-track prizes, with Privy and MetaMask bounties. No results were found. — [Luma](https://luma.com/metropolis-lon-oct-2026)

### Inferences
- Monad's payments strategy is to be a settlement layer for partners: card issuers (Rain), wallets (MetaMask), PSPs and onramps (zerohash, Coinflow), remittance fintechs (Abound, CambioReal, Meru) and agentic payments (x402, MPP). It is not a first-party consumer wallet. A "UPI for stablecoins" app would be a consumer-facing layer the Foundation does not itself provide.
- Abound (Indian diaspora) and the UPI onramp mention make Monad directly relevant to an India-corridor app. The UPI onramp claim needs partner-level verification.

### Gaps
- No volume metrics for payments specifically (card spend, merchant volume, remittance volume on-chain) were found. Only aggregate stablecoin supply and transactions are reported.
- The MonadPay Notion page could not be read. It is unclear whether it is a spec, an RFP or a shipped standard.
- No current status for Portal's products (live or announced) was found.

## Status as of November 2026: launch, ecosystem size, usage

### Takeaway
Mainnet has been live since Nov 24, 2025, nearly a year. Self-reported figures as of late summer to early October 2026: 700M–918M cumulative transactions, 4.2M–9M+ wallets, ~3.5M transactions/day, $767M+ stablecoins, ~$1B DeFi TVL and 143+ apps. The first flagship conference (Open, Singapore) was held Oct 6, 2026.

### Cited Findings
- 701.7M+ transactions, 4.2M+ wallets and $767M+ stablecoin market cap as of Aug 31, 2026. — [Monad blog, Aug 2026](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026)
- ~3.5M transactions/day, 15K+ DAU, 200 validators and $1.4B TVL including borrows (end of July 2026). — [Monad blog, Jul 2026](https://www.monad.xyz/blog/monad-economy-eight-months-in)
- About 918M transactions, $993M DeFi TVL, 9M+ wallets and 143+ apps (Oct 8, 2026 snapshot). — [YesPress](https://yespress.io/monad.md) (aggregator)
- Open conference, Singapore, Oct 6, 2026, with DeltaV Demo Day. — [Monad blog, Aug 2026](https://monad.xyz/blog/monad-ecosystem-highlights-august-2026)

### Inferences
- 15K daily active addresses against 4–9M "wallets" suggests most wallets are dormant, airdrop-era or bot addresses. Organic daily payment users are modest.

### Gaps
- No independent Artemis or DefiLlama numbers were pulled for Sept–Nov 2026.
- No official October or November 2026 ecosystem update was found.

## Differentiators vs weaknesses for payments

### Takeaway
Monad's edge is full EVM bytecode compatibility combined with sub-second hard finality (600 ms), sub-cent fees, native USDC/CCTP, P-256 passkeys and strong distribution partners (Visa, Mastercard, Rain, MetaMask). Its weaknesses are that it is not stablecoin-native (gas in MON only, no protocol-level gasless USDT), its stablecoin float is small, its demand is unproven at scale, validators are concentrated on infrastructure like Hetzner, and execution has quirks (gas-limit billing, the 10 MON 7702 floor).

### Cited Findings
- Strengths: 300/600 ms finality and 500M gas/s capacity — [docs](https://docs.monad.xyz/ai/current-facts); P-256 precompile and EIP-7702 — [docs](https://docs.monad.xyz/developer-essentials/differences); native USDC and CCTP — [Circle](https://www.circle.com/es-la/blog/now-available-usdc-cctp-wallets-and-contracts-on-monad); Visa, Mastercard and Rain support — [Monad blog](https://www.monad.xyz/blog/monad-economy-eight-months-in); ERC-20 transfer ≈ $0.00016 — [docs](https://docs.monad.xyz/developer-essentials/gas-pricing).
- Weaknesses: fees are charged on the gas limit, and transactions can revert after inclusion and still pay gas — [docs](https://docs.monad.xyz/developer-essentials/differences). Delegated (7702) EOAs need a 10 MON floor — [docs](https://docs.monad.xyz/developer-essentials/differences). The Hetzner outage took 10–13% of validators offline — [Monad Pulse](https://themonadpulse.substack.com/p/the-monad-pulse-019). USDT0 liquidity was thin early (<$5M in the top 5 pools) — [Aave governance](https://governance.aave.com/t/arfc-deploy-aave-protocol-v3-7-on-monad/24943/3). Commentary frames Monad's story as distribution versus raw TPS — [BlockEden, Apr 2026](https://blockeden.xyz/blog/2026/04/12/monad-mainnet-parallel-evm-tps-vs-distribution-thesis/) (secondary, promotional tone).
- Comparative context: newer "stablecoin L1s" market protocol-level stablecoin gas and zero-fee transfers, which Monad lacks. — [Eco: best stablecoin L1s 2026](https://eco.com/support/en/articles/15010646-best-stablecoin-l1-chains-in-2026-the-new-wave-of-dollar-native-blockchains)

### Inferences
- For a multi-chain "UPI for stablecoins" app, Monad is an attractive fast-settlement EVM leg. The same Solidity, viem and wagmi stack works there; CCTP v2 handles USDC routing; and passkey smart accounts are cheap. The app must provide paymaster or relayer gas sponsorship, because Monad has no native fee abstraction.
- Compliance and privacy features (memos, confidential transfers, issuer-level controls) that payment-specific chains advertise are absent at the protocol level. Monad is a general-purpose chain.
- A key risk is that Monad's activity is still DeFi/trading-led. Payments traction is mostly partnership announcements with no published on-chain payment volumes.

### Gaps
- No head-to-head measured comparison (fees, finality, uptime) between Monad and Tempo, Plasma, Arc, Stable, Base or Solana from a neutral source was found.
- No data on MEV or ordering risk for payments on Monad's leader-forwarding model (no public mempool).
