# Circle Arc: technical profile of a payments chain (as of 9 Nov 2026)

Note on sources: the Arc docs moved from docs.arc.network to docs.arc.io, and the old URLs return a 301 redirect. The docs pages carry embedded "Agent Instructions" blocks, which were ignored. Media accounts of the launch disagree on the validator list and on testnet transaction counts. Those conflicts are flagged below.

## Consensus, finality, throughput, EVM compatibility

### Takeaway
Arc pairs Malachite, a Tendermint-style BFT engine, with a Reth execution client. A permissioned Proof-of-Authority set of institutional validators runs consensus. Finality is deterministic and comes in under a second. The only throughput figures are Circle's own benchmarks (3,000+ TPS, under 350 ms, 20 validators), which cover consensus only. I found no independent measurement. The chain targets the Osaka EVM but has several payment-relevant runtime differences.

### Cited Findings
- Consensus is Malachite, described as "a high-performance implementation of the Tendermint BFT protocol". It votes in two phases (pre-vote, pre-commit) and commits once more than two-thirds of validators agree. Execution runs on Reth with Arc-specific modules. — [Arc docs: System overview](https://docs.arc.io/arc/concepts/system-overview.md)
- Finality is deterministic and under one second, with no reorg risk once a block commits. — [Arc docs: System overview](https://docs.arc.io/arc/concepts/system-overview.md); [Arc docs: Welcome](https://docs.arc.io/arc/concepts/welcome-to-arc)
- Throughput claim: "3,000+ TPS with 20 validators, benchmarked at under 350 ms finality." — [Arc docs: System overview](https://docs.arc.io/arc/concepts/system-overview.md). These are consensus-only benchmarks that exclude EVM execution. — [MEXC Learn](https://www.mexc.com/learn/article/what-is-arc-mainnet-launch-date-validators-and-what-goes-live/1)
- Gas capacity is 30M gas per block, about 60M gas/sec at a 0.5 s block time. — [Arc docs: Gas and fees](https://docs.arc.io/arc/references/gas-and-fees.md)
- The validator set is permissioned Proof-of-Authority and made up of regulated institutions. Developer access is permissionless. — [Arc docs: System overview](https://docs.arc.io/arc/concepts/system-overview.md); [Arc docs: Key features](https://docs.arc.io/arc-chain.md). Circle plans to explore moving to Proof of Stake in 2027. — [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/); [Circle Q3 2026 results](https://www.circle.com/pressroom/circle-reports-third-quarter-2026-results)
- EVM: Arc targets the Osaka baseline, and most contracts deploy unchanged. Arc ships a Foundry fork (arc-forge, arc-cast, arc-anvil). — [Arc docs: Welcome](https://docs.arc.io/arc/concepts/welcome-to-arc)
- EVM differences that matter for a payments app. Source for this list: [Arc docs: EVM differences](https://docs.arc.io/arc/references/evm-differences.md)
  - The native token is USDC, not ETH. The native interface uses 18 decimals and the ERC-20 interface uses 6, and both read one shared balance. Docs warn against crediting balances from the 6-decimal view (it truncates), and note that `balanceOf` = 0 does not imply a zero native balance.
  - Value transfers to or from blocklisted addresses revert, and the reverted transaction still consumes gas. A blocklist revert produces no receipt. — also [Arc docs: Welcome](https://docs.arc.io/arc/concepts/welcome-to-arc)
  - Value-bearing transfers to address(0) revert. Native transfers can revert even when the sender has enough balance.
  - `PREVRANDAO` returns 0, so there is no on-chain randomness. Blob (type-3) transactions are rejected.
  - Timestamps have 1-second granularity and can repeat across blocks, so ordering should use the block number.
  - EIP-7702 set-code transactions work as on Ethereum.
  - Native movements emit EIP-7708 `Transfer` logs from system addresses. All USDC Transfer events come from system emitter `0xffff...fFfE`. — [Arc docs: Welcome](https://docs.arc.io/arc/concepts/welcome-to-arc)
  - A CallFrom precompile preserves `msg.sender` across delegated calls. The Memo contract and Multicall3From use it. — [Arc docs: System overview](https://docs.arc.io/arc/concepts/system-overview.md)

### Inferences
- Sub-second deterministic finality means a POS or P2P "payment received" screen can show final on one block, with no confirmation counting.
- Wallets and indexers must treat the native balance and the USDC ERC-20 balance as one, and handle the 18/6-decimal split carefully. A naive multichain wallet that sums both views would double-count.
- PoA with a Circle-selected validator set means censorship resistance is weaker than on public L1s. That is a trade-off to disclose to users.

### Gaps
- I found no independent, measured mainnet TPS or latency (for example from an explorer or a third-party benchmark).
- The docs page does not state block time explicitly. 0.5 s is implied by the gas-and-fees page.
- No source confirmed that each named validator is actually producing blocks. — [Stablecoin Insider](https://stablecoininsider.org/circle-arc-mainnet-launch/) notes this explicitly.

## Gas model and fee predictability

### Takeaway
Gas is paid natively in USDC, so fees are dollar-denominated. The base fee follows EIP-1559 with EWMA smoothing, a floor of 20 Gwei and a ceiling of 20,000 Gwei. The design target is about $0.001 per ERC-20 transfer. The base fee goes to the block producer and is not burned.

### Cited Findings
- USDC is the native gas token. "Arc's native token is USDC, not ETH." — [Arc docs: Key features](https://docs.arc.io/arc-chain.md); [Arc docs: EVM differences](https://docs.arc.io/arc/references/evm-differences.md)
- Pricing is EIP-1559 with exponentially weighted moving average smoothing: each base fee blends the previous base fee with the latest block's utilization, so short spikes raise fees only slightly. — [Arc docs: Gas and fees](https://docs.arc.io/arc/references/gas-and-fees.md)
- The base fee target is about $0.001 per ERC-20 transfer under normal load. This is a design-time target, not a guarantee. — [Arc docs: Gas and fees](https://docs.arc.io/arc/references/gas-and-fees.md)
- Bounds: the minimum base fee is 20 Gwei, and transactions below it are silently dropped. The maximum base fee is 20,000 Gwei. A priority fee of 0 is accepted, and about 1 Gwei is suggested under load. The next block's base fee is published in the parent header `extra_data` as an 8-byte big-endian value. — [Arc docs: Gas and fees](https://docs.arc.io/arc/references/gas-and-fees.md); [Arc docs: EVM differences](https://docs.arc.io/arc/references/evm-differences.md)
- The base fee goes to the block beneficiary rather than being burned. — [Arc docs: EVM differences](https://docs.arc.io/arc/references/evm-differences.md)
- Circle's architecture page calls the "Gas and Fee Manager" live. — [Arc docs: System overview](https://docs.arc.io/arc/concepts/system-overview.md)
- An analyst at Celent described the fees as predictable for institutions that don't want to hold a volatile token. — [American Banker](https://www.americanbanker.com/news/circle-publicly-releases-arc-blockchain-to-institutions)

### Inferences
- Because 1 Gwei of USDC at 18 decimals is $1e-9, the fee range implies a worst case of roughly 1,000x the floor. A simple transfer stays well under a cent even at the ceiling (estimate, not from a source).
- A fee published one block ahead in the header lets an app quote an exact dollar fee before the user signs, which fits "UPI-style" fee disclosure.

### Gaps
- No measured mainnet average fee data was found.
- Gas in other stablecoins (EURC and others) is roadmap only. See the next section.

## Native stablecoin features: USDC, multi-stablecoin, FX, privacy, compliance

### Takeaway
Live: native USDC gas and balance, natively supported EURC and USYC, protocol-level USDC blocklist enforcement, and StableFX, an institution-only RFQ FX engine (live on testnet since November 2025 and described as supported at mainnet). Roadmap: the Arc Privacy Sector (opt-in confidential execution), "Stablecoin Services" (multi-stablecoin gas, paymaster-sponsored transactions, cross-currency settlement), AgentVM, and the Partner Stablecoins (non-USD) rollout.

### Cited Findings
- EURC and USYC are natively supported alongside USDC. — [Arc docs: Key features](https://docs.arc.io/arc-chain.md)
- Stablecoin FX: apps can swap between "USDC, EURC, and other supported stablecoins natively on Arc" through App Kit with on-chain rates and slippage settings, and can charge a custom spread fee per swap without writing contracts. — [Arc docs: Stablecoin FX](https://docs.arc.io/build/stablecoin-fx.md)
- StableFX design. Source for this list: [Circle blog](https://www.circle.com/blog/introducing-circle-stablefx-and-circle-partner-stablecoins)
  - RFQ execution across multiple liquidity providers.
  - Atomic settlement: both legs settle or neither does.
  - Programmable settlement windows and netting.
  - All-to-all counterparties.
  - Access limited to KYB/AML-approved institutions.
  - Circle runs the settlement contract but does not custody assets.
- StableFX went live on Arc public testnet on 13 Nov 2025. Arc testnet itself launched 28 Oct 2025. — [The Block](https://www.theblock.co/news/business/2025-11-13-circle-arc-onchain-fx-engine-multi-currency-stablecoin-program-378723); [Cointelegraph](https://cointelegraph.com/news/circle-largest-financial-market-onchain-fx-engine). At mainnet, Circle said StableFX offers round-the-clock FX settlement. — [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/). Unverified: whether StableFX is processing live institutional mainnet trades. No source confirmed it.
- Partner Stablecoins program (non-USD regional coins on Arc, feeding StableFX and CPN). The anticipated participants are listed below; "anticipated / collaborations underway" means not confirmed live. — [Circle blog](https://www.circle.com/blog/introducing-circle-stablefx-and-circle-partner-stablecoins)
  - BRLA (Avenia)
  - KRW1 (BDACS)
  - PHPC (Coins.ph)
  - AUDF (Forte)
  - MXNB (Juno)
  - JPYC
  - QCAD (Stablecorp)
  - ZARU
- Privacy: the Arc Privacy Sector (APS) is planned. It is a confidential execution environment for Solidity contracts that composes synchronously with the public EVM. — [Arc docs: System overview](https://docs.arc.io/arc/concepts/system-overview.md). At mainnet, opt-in transaction and balance privacy was "in development" and not yet network-wide. — [American Banker](https://www.americanbanker.com/news/circle-publicly-releases-arc-blockchain-to-institutions); [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/)
- Roadmap item "Stablecoin Services": cross-currency settlement, paymaster-sponsored transactions, and multi-stablecoin gas payments, explicitly "planned, not yet available". — [Arc docs: System overview](https://docs.arc.io/arc/concepts/system-overview.md)
- Compliance: a protocol-level blocklist makes value transfers to or from blocklisted addresses revert, with gas still charged. — [Arc docs: EVM differences](https://docs.arc.io/arc/references/evm-differences.md)
- AgentVM (confidential compute for AI agents with verifiable results) is in development. Agent wallet funding and spending limits were announced at launch. — [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/)
- Tokenized assets: BlackRock is expected to deploy BUIDL on Arc, and DTCC will enable tokenization of DTC-custodied assets. — [Circle Q2 2026 results](https://www.circle.com/pressroom/circle-reports-second-quarter-2026-results). Stablecoin Insider calls these Circle-reported integrations, not confirmed TVL. — [Stablecoin Insider](https://stablecoininsider.org/circle-arc-mainnet-launch/)

### Inferences
- A consumer "UPI for stablecoins" app can use the App Kit Swap path, which is open to developers, for USDC/EURC conversion today. StableFX itself is KYB-gated and suits a licensed backend or an LP relationship, not end users directly.
- Until multi-stablecoin gas ships, a user holding only EURC on Arc still needs USDC for gas, or a sponsor.

### Gaps
- No public StableFX volume, spreads or mainnet pair list.
- No date for APS or Stablecoin Services, and no detail on viewing keys or regulator access for privacy.
- I could not confirm which Partner Stablecoins are live on Arc mainnet.

## Account abstraction, passkeys, paymasters, Circle Wallets

### Takeaway
Arc supports EIP-7702 through the Osaka baseline. Circle Developer-Controlled Wallets and Gateway appear in Arc's sample apps. Native paymaster-sponsored transactions are roadmap. I found no Arc-specific documentation on ERC-4337 or passkeys.

### Cited Findings
- EIP-7702 set-code transactions work as on Ethereum. — [Arc docs: EVM differences](https://docs.arc.io/arc/references/evm-differences.md)
- Arc's payments sample apps use Circle Developer-Controlled Wallets, and Circle Gateway for unified USDC balances. — [Arc docs: Payments](https://docs.arc.io/build/payments.md)
- Paymaster-sponsored transactions are listed as planned, not yet available, under Stablecoin Services. — [Arc docs: System overview](https://docs.arc.io/arc/concepts/system-overview.md)
- At launch, users can fund AI agent wallets, set spending limits and delegate on-chain tasks. — [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/)

### Inferences
- Gas is already USDC, so a paymaster's main job on Arc is sponsorship (gasless UX) rather than token conversion. An app can sponsor gas itself, for example with a relayer plus EIP-3009/permit or EIP-7702 delegation, before Circle's native sponsorship ships.

### Gaps
- No Arc-specific source on ERC-4337 EntryPoint deployment, Circle Modular Wallets or passkey (WebAuthn/P-256) support on Arc. These need checking in developers.circle.com.

## Cross-chain: CCTP, Gateway, App Kits

### Takeaway
Arc's interop runs on Circle's own rails: CCTP and Gateway, wrapped by App Kits. The kits and their launch dates are below; the year is inferred as 2026 from context.
- Bridge and Swap: 10 March.
- Unified Balance: 30 April.
- Earn and Borrow: 16 September.

### Cited Findings
- App Kits wrap CCTP and include six kits: Bridge, Swap, Unified Balance, Onramp, Earn and Borrow. The Unified Balance Kit combines a user's USDC across chains into one spendable balance, and the Borrow Kit lends USDC against cirBTC. — [Arc docs: Welcome](https://docs.arc.io/arc/concepts/welcome-to-arc)
- Interoperability at mainnet is through CCTP and Gateway. — [Stablecoin Insider](https://stablecoininsider.org/circle-arc-mainnet-launch/)
- Custody on Arc is offered by Anchorage Digital and BitGo. — [American Banker](https://www.americanbanker.com/news/circle-publicly-releases-arc-blockchain-to-institutions)

### Inferences
- The Unified Balance Kit maps directly onto the "one balance, any chain" UX a UPI-style app needs, with Arc as the settlement hub.

### Gaps
- No non-Circle bridge or interop partners (for example LayerZero or Wormhole) were confirmed in the sources reviewed. CCTP v2 fast-transfer timings to and from Arc were not found.

## Payment products and integrations (CPN, "Arc Pay", merchant tooling)

### Takeaway
I found no product called "Arc Pay" in any source. The main payment product is Circle Payments Network (CPN), a bank and PSP network. CPN is growing fast, but Circle describes it as moving to Arc "in the future", and no source confirms CPN settles on Arc today. Merchant and developer tooling consists of App Kits, an eCommerce checkout guide, Arc Studio, the Arc MCP server and Arc Foundry.

### Cited Findings
- CPN at end of Q2 2026: $14.7B annualized volume (trailing 30 days, up 76% QoQ) and 175 enrolled financial institutions. Nium is connecting USDC settlement to payouts in 190+ countries. — [Circle Q2 2026 results](https://www.circle.com/pressroom/circle-reports-second-quarter-2026-results)
- CPN in Q3 2026: $41.3B annualized TPV. — [Circle Q3 2026 results](https://www.circle.com/pressroom/circle-reports-third-quarter-2026-results). Secondary reports add 205 enrolled FIs and more than $58B annualized as of 30 Oct. — [search summary of Q3 coverage, e.g. FXC Intelligence](https://www.fxcintel.com/research/analysis/ct-circle-q3-2026-earnings). These are unverified against the primary release, which I could not see in full.
- CPN Managed Payments launched in April 2026 with PSPs including Veem. — [Business Wire](https://www.businesswire.com/news/home/20260408279998/en/). Circle plans for CPN and StableFX to operate on Arc. — [Stablecoin Insider: Circle 2026 roadmap](https://stablecoininsider.org/circle-2026-roadmap/). At mainnet, "Circle Payments Network supports cross-border payments" was cited among Arc features. — [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/)
- Circle agreed to acquire Tazapay, a Singapore B2B cross-border payments firm, with closing expected in 2027. Tazapay has $25B+ annualized volume, 100+ payout markets and about 60% of volume involving stablecoins. — [Circle Q3 2026 results](https://www.circle.com/pressroom/circle-reports-third-quarter-2026-results)
- Arc docs list these use cases: P2P payments, eCommerce checkout, stablecoin FX, the agentic economy, prediction markets, and borrow/lend. — [Arc docs: Welcome](https://docs.arc.io/arc/concepts/welcome-to-arc)
- Launch tools: Arc Studio (AI-assisted app building) and Arc App Kits. — [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/)
- Launch ecosystem: Aero, fomo and Uniswap for trading, and Aave and Morpho for lending. — [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/)
- Banks named as live on or exploring Arc: BNY, HSBC, Lead Bank and State Street. — [American Banker](https://www.americanbanker.com/news/circle-publicly-releases-arc-blockchain-to-institutions)

### Inferences
- There is no consumer-facing Circle payment app on Arc. The consumer and merchant "UPI layer" is open territory, and Circle supplies rails (CPN, App Kits, Wallets) rather than an end-user product.

### Gaps
- No "Arc Pay" product found. If the name refers to a third-party app, it was not surfaced.
- I found no confirmation of the share of CPN volume that settles on Arc versus other chains.

## Status as of November 2026

### Takeaway
Arc public mainnet has been live since 16 Sep 2026. Before that, the public testnet launched 28 Oct 2025, followed by a private mainnet phase. The validator set is a permissioned PoA cohort of about 11 to 12 institutions. A 10B ARC token genesis mint has happened, but Circle says it is not a commitment to a public token launch, and gas stays in USDC. No live on-chain usage metrics for mainnet were found.

### Cited Findings
- Mainnet went live 16 Sep 2026 with 100+ institutional and ecosystem builders on day one. — [Circle Q3 2026 results](https://www.circle.com/pressroom/circle-reports-third-quarter-2026-results); [Finextra](https://www.finextra.com/newsarticle/48419/circle-launches-arc-mainnet)
- Founding validators announced 5 Aug 2026, per Circle's list: Circle, BlackRock, DTCC, Galaxy, Global Payments, ICE, Mastercard, MoneyGram, SBI Group, Standard Chartered, Sumitomo Corporation and Visa. — [Circle Q2 2026 results](https://www.circle.com/pressroom/circle-reports-second-quarter-2026-results). Media lists vary: Fintech Singapore names 7, and some outlets say "eleven". — [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/); [FXStreet](https://www.fxstreet.com/cryptocurrencies/news/circle-launches-arc-mainnet-with-wall-street-validators-as-clarity-act-stalls-202609161039). Validators roll out in phases. — [Fintech Singapore](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/)
- Testnet usage: 502M cumulative transactions and 2.8M transacting wallets as of 30 Jun 2026. — [MEXC Learn, citing Circle](https://www.mexc.com/learn/article/what-is-arc-mainnet-launch-date-validators-and-what-goes-live/1). Launch coverage cites "more than 700M" (an unverified, conflicting figure). — [Blockchain Reporter](https://blockchainreporter.net/circle-launches-arc-mainnet)
- Developer activity: 75,000+ Arc House members, 10,000 Architect ambassadors, and 1,200+ projects built during private mainnet. — [Circle Q3 2026 results](https://www.circle.com/pressroom/circle-reports-third-quarter-2026-results)
- ARC token. Source for this list: [Circle Q3 2026 results](https://www.circle.com/pressroom/circle-reports-third-quarter-2026-results)
  - 10B genesis mint.
  - $182M of ARC presale revenue recognized in Q3, with possible repayment obligations if launch milestones are missed.
  - PoS transition planned for 2027.
- The presale was disclosed 11 May 2026 as $222M at a $3B network valuation. — [search summary of KuCoin/MEXC coverage](https://www.kucoin.com/news/flash/circle-unveils-2026-roadmap-for-internet-native-finance). This is a secondary source.
- The network operator entity is Arc Network Services LLC. — [Stablecoin Insider](https://stablecoininsider.org/circle-arc-mainnet-launch/)
- Context: USDC average circulation was $73.3B in Q3 2026, with $13.9T in on-chain volume. — [Circle Q3 2026 results](https://www.circle.com/pressroom/circle-reports-third-quarter-2026-results)

### Gaps
- No mainnet TPS, daily transactions, TVL or fee revenue (September to November 2026) from an explorer or from Circle.
- No confirmed list of which validators are active today.

## What Arc has that other payment chains do not

### Takeaway
Arc's distinctive combination comes from the issuer itself. Native USDC is the gas and base asset (issuer-operated, with protocol-level blocklist). Fees are smoothed, dollar-denominated and published a block ahead. Finality is deterministic and sub-second. An institutional validator cohort (BlackRock, DTCC, Visa, Mastercard and others) secures the chain. An issuer-run RFQ FX engine (StableFX) sits alongside a non-USD partner-stablecoin program. The chain is wired directly into CPN, CCTP, Gateway and Wallets. The main competitors named are Stripe/Paradigm's Tempo, Coinbase's Base and Google Cloud's Universal Ledger.

### Cited Findings
- Competitors named: Tempo (Stripe/Paradigm), Base (Coinbase) and Google Cloud Universal Ledger. — [American Banker](https://www.americanbanker.com/news/circle-publicly-releases-arc-blockchain-to-institutions); [search summary of launch coverage](https://fintechnews.sg/137378/blockchain/circle-arc-mainnet-launch/)
- Circle's service infrastructure gives institutions "a clear party to contact" if something fails (Celent view). — [American Banker](https://www.americanbanker.com/news/circle-publicly-releases-arc-blockchain-to-institutions)
- Celent's analyst also said agentic commerce is currently very small in value and a long-term use case. — [American Banker](https://www.americanbanker.com/news/circle-publicly-releases-arc-blockchain-to-institutions)

### Inferences
- Arc's advantages for a UPI-style app:
  - The issuer's own chain removes bridge risk for USDC.
  - Fees are predictable and quotable in dollars.
  - One-block finality.
  - FX between USDC, EURC and partner coins is planned on the same chain.
- Arc's disadvantages for a UPI-style app:
  - The validator set is permissioned and Circle-selected.
  - Privacy, multi-stablecoin gas and native gas sponsorship are not live yet.
  - StableFX is institution-gated.
  - Mainnet is less than two months old, with no public usage data.
- Single-issuer dependence (USDC blocklist enforced at the protocol level) is both a compliance feature and a neutrality risk for a "universal" app that wants to be stablecoin-agnostic.

### Gaps
- No side-by-side, sourced benchmark of Arc against Tempo, Plasma or Stable on fees, finality or throughput. That comparison needs data from the sibling research files.
