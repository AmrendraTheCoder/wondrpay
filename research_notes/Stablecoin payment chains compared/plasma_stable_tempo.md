# Purpose-built stablecoin chains: Plasma, Stable (Stablechain), Tempo — comparative technical profile (as of 9 Nov 2026)

Method note: 19 tool calls. The primary sources were Tempo's developer docs (tempo.xyz/developers), Stable's docs (docs.stable.xyz, llms.txt index plus the technical-roadmap page) and DefiLlama's stablecoin API. Plasma's docs have moved from docs.plasma.to to docs.plasma.org. The pages I fetched there were mostly overviews, so Plasma's protocol details come largely from secondary sources and are flagged as such. "LIVE" means on mainnet now. "ANNOUNCED", "PLANNED" and "PREVIEW" mean not generally available.

## 1. Consensus, finality, throughput, EVM compatibility, execution client

### Takeaway
All three are EVM-compatible BFT layer 1s with deterministic sub-second-to-~1s finality. Tempo and Plasma both run Reth execution. Stable is the outlier, built on Cosmos: CometBFT consensus, a Go EVM, and Block-STM parallel execution. Only Tempo publishes concrete per-lane capacity numbers.

### Cited Findings
**Tempo**
- Consensus is Simplex BFT, implemented with Commonware. It gives "deterministic sub-second finality with Byzantine fault tolerance". Validators share a threshold signing key generated through DKG, and nodes verify finalizations against a single network identity. — [Tempo docs: Consensus](https://tempo.xyz/developers/docs/protocol/blockspace/consensus.md); [Consensus & DKG](https://tempo.xyz/developers/docs/guide/node/consensus-and-dkg.md)
- Tempo is EVM-compatible with documented differences: wallet behaviour, fee-token selection, and VM-layer changes. — [EVM differences](https://tempo.xyz/developers/docs/quickstart/evm-compatibility.md)
- Execution client is Reth (Paradigm), combined with Commonware Simplex consensus. — [Everstake explainer](https://everstake.one/resources/blog/what-is-tempo-stripe-and-paradigms-stablecoin-payments-blockchain-explained); [Kiln](https://www.kiln.fi/post/inside-tempo-stripes-stablecoin-payments-blockchain)
- Block and finality time is about 0.5 s according to Tempo's performance docs. Some third parties cite about 0.6 s. — [docs.tempo.xyz performance](https://docs.tempo.xyz/learn/tempo/performance) (via search snippet)
- Throughput (secondary, unverified): roughly 20,000 payment TPS and about 600 contract TPS. The payment lane is listed at 450M gas per block. A 100k+ TPS target is cited. — [Mintlify mirror of Tempo architecture](https://www.mintlify.com/tempoxyz/tempo/concepts/architecture)
- Validators: Visa, Stripe and Zodia Custody (Standard Chartered) were announced as the first external validators on 14 Apr 2026. Visa runs an in-house "anchor validator". Lead validators are rewarded in stablecoins, and the stated path is toward permissionless validation. — [The Block](https://www.theblock.co/news/business/2026-04-14-visa-stripe-zodia-custody-standard-chartered-validators-tempo-397286); [Decrypt](https://decrypt.co/364369/visa-backs-stripes-tempo-payments-network-anchor-validator?amp=1)
- Later validators, MoneyGram (20 May 2026) and zerohash (6 Oct 2026), are reported only by a secondary aggregator summary (UNVERIFIED). — [search summary incl. Yahoo/Forklog](https://finance.yahoo.com/news/stripe-deploys-tempo-blockchain-mainnet-174049394.html)
- Protocol upgrades run from T2 to T14. T14 lets the Account Keychain support multiple signers. — [Upgrades changelog](https://tempo.xyz/developers/docs/protocol/upgrades.md)

**Stable**
- Consensus is StableBFT, a custom PoS built on CometBFT. Finality is deterministic: blocks are final on inclusion with no forks, and the chain tolerates up to one-third faulty validators. Status: LIVE. — [Stable technical roadmap](https://docs.stable.xyz/en/explanation/technical-roadmap); [Stable docs index](https://docs.stable.xyz/llms.txt)
- Block time is about 0.7 s according to a secondary source. Stable's own docs say "sub-second". — [Chainstack](https://chainstack.com/what-is-stable/); [docs.stable.xyz](https://docs.stable.xyz)
- Execution is Block-STM optimistic parallel EVM execution, plus StableDB (a MemIAVL state store that replaced LevelDB). Both have been live since v1.8.0. — [Roadmap](https://docs.stable.xyz/en/explanation/technical-roadmap)
- PLANNED items:
  - StableBFT on Autobahn, a DAG-based BFT. An internal PoC reached ">200,000 TPS", consensus-only, in controlled environments.
  - StableVM++, a C++ EVM replacing the Go EVM with "up to 6x faster" execution.
  - No live mainnet TPS figure is published.
  — [Roadmap](https://docs.stable.xyz/en/explanation/technical-roadmap)
- Testnet currently runs v1.9.0-rc0. Chain ID is 988 (secondary source). — [Stable docs index](https://docs.stable.xyz/llms.txt); [eco.com](https://eco.com/support/en/articles/13052793-what-is-stable-blockchain-the-2026-guide-to-usdt-native-payments)
- STABLE is a governance and staking token, not used for gas. Stakers receive a share of USDT0 gas revenue. — [Stable docs index (Tokenomics)](https://docs.stable.xyz/llms.txt)

**Plasma**
- Official docs describe the System Overview as covering "how PlasmaBFT consensus and Reth execution fit together to power USD₮ payments". They also say contracts deploy with "no code changes from Ethereum". Native token: XPL. — [docs.plasma.org llms.txt](https://docs.plasma.org/llms.txt)
- PlasmaBFT is a pipelined variant of Fast HotStuff with leader-based round-robin. At launch it ran Proof-of-Authority with a committee that expands over time, with PoS planned later. — [Equilibrium Infra Bulletin #52, Jun 2025](https://equilibriumlabs.substack.com/p/equilibrium-infra-bulletin-52-the); [eco.com](https://eco.com/support/en/articles/11803113-plasma-xpl-stablecoin-blockchain-explained)
- Plasma docs frame consensus-node operation as "future consensus node operation on Plasma mainnet", which suggests outside validators are not yet permissionless. — [docs.plasma.org llms.txt](https://docs.plasma.org/llms.txt)
- Mainnet beta launched 25 Sep 2025. — [eco.com](https://eco.com/support/en/articles/15010646-best-stablecoin-l1-chains-in-2026-the-new-wave-of-dollar-native-blockchains)

### Inferences
- If you build on Reth/EVM tooling, Tempo and Plasma will feel closest to Ethereum. Stable's Cosmos base brings quirks such as precompile modules (bank, staking, distribution) and USDT0's dual decimals.
- Of the three, only Tempo has external Tier-1 institutional validators (Visa, Stripe, Zodia). Plasma and Stable both appear to run small or permissioned validator sets in practice.

### Gaps
- Official Plasma block time, finality time and TPS: the docs.plasma.org consensus and execution pages were not retrieved. Commonly cited claims of "sub-second finality, 1000+ TPS" are UNVERIFIED here.
- Current validator counts for all three.
- Official mainnet throughput benchmarks for Tempo, as opposed to secondary mirrors.

## 2. Gas model: zero-fee transfers, stablecoin gas, paymasters, fee rules, abuse limits

### Takeaway
Each chain removes the volatile gas token differently:
- **Tempo** has no native gas token at all. Fees are paid in any USD TIP-20 stablecoin through an enshrined Fee AMM, and native fee sponsorship is supported.
- **Stable** makes USDT0 itself the native gas token, with a base-fee-only model and governance-approved "gas waivers" for zero-fee UX.
- **Plasma** keeps XPL as gas, but a protocol paymaster makes plain USDT transfers free, subject to anti-spam limits.

### Cited Findings
**Tempo**
- Fees can be paid in any supported USD-denominated TIP-20 stablecoin, chosen per account or per transaction. — [Fee tokens](https://tempo.xyz/developers/docs/accounts/fees/fee-tokens.md)
- An enshrined Fee AMM converts the user's fee token into the validator's preferred token. LPs supply the liquidity. — [Fee AMM](https://tempo.xyz/developers/docs/protocol/fees/fee-amm.md); [Fee spec](https://tempo.xyz/developers/docs/protocol/fees/spec-fee.md)
- Native fee sponsorship: a fee payer covers fees but cannot move the account's funds. — [Fee sponsorship](https://tempo.xyz/developers/docs/accounts/fees/fee-sponsorship.md)
- No native gas token. — [Yahoo/Stripe mainnet coverage](https://finance.yahoo.com/news/stripe-deploys-tempo-blockchain-mainnet-174049394.html)
- The reported fee of about $0.001 per transfer comes from a secondary source (UNVERIFIED). — same
- No Tempo token or TGE had been announced as of mid/late 2026 (secondary). — same

**Stable**
- USDT0 is the native gas token. Pricing is base-fee-only, so tips do not affect ordering and `maxPriorityFeePerGas` must be 0. — [Stable docs index](https://docs.stable.xyz/llms.txt)
- Gas moved from gUSDT to USDT0 in the v1.2.0 upgrade on 4 Feb 2026, and gUSDT balances were auto-converted. — [Cryptopolitan](https://www.cryptopolitan.com/stable-migrate-to-usdt0-native-gas-token/); [eco.com](https://eco.com/support/en/articles/13052793-what-is-stable-blockchain-the-2026-guide-to-usdt-native-payments)
- Integration gotcha: USDT0 has 18 decimals as native gas but 6 decimals as an ERC-20. — [eco.com](https://eco.com/support/en/articles/13052793-what-is-stable-blockchain-the-2026-guide-to-usdt-native-payments)
- Gas Waiver protocol: governance-approved waivers submit wrapper transactions that execute the user's signed payload at `gasPrice = 0`, so users hold no USDT0 and pay no gas. Stable runs a hosted waiver. Partners can register their own through validator governance or self-host. — [Stable docs index](https://docs.stable.xyz/llms.txt)

**Plasma**
- A protocol-level paymaster sponsors gas for direct USDT transfers (`transfer()` / `transferFrom()`), so users need no XPL. More complex actions pay fees in XPL or in whitelisted tokens such as USDT ("custom gas tokens"). — [eco.com](https://eco.com/support/en/articles/11802920-what-is-plasma-xpl-stablecoin-l1-in-2026); [search summary citing Plasma docs](https://docs.plasma.to/docs/get-started/why-build-on-plasma/overview)
- Anti-abuse, from early design docs:
  - Per-account rate limits on the zero-fee lane.
  - A minimum balance requirement, with 10 USDT given as an example.
  - Adaptive delay-based prioritisation.
  Exact current values were not found. — [Equilibrium Infra Bulletin #52](https://equilibriumlabs.substack.com/p/equilibrium-infra-bulletin-52-the)

### Inferences
- For a "UPI for stablecoins" app, Tempo's model needs the least custom plumbing: any stablecoin pays gas and sponsorship is native.
- Stable's model is the simplest for USDT-only flows.
- Plasma's is the most "free" for consumers but USDT-specific and rate-limited, so heavy merchant or batch traffic will still pay XPL or token gas.

### Gaps
- Plasma paymaster parameters as they stand today: rate-limit values, any identity gating (zkEmail/captcha was mentioned in early docs but not verified here), and who funds it (reportedly the Plasma Foundation; unverified).
- Stable gas-waiver governance criteria and quotas.
- Official Tempo per-transfer fee targets.

## 3. Payment-specific protocol features

### Takeaway
Tempo has the richest enshrined payments primitive set:
- payment lanes
- 32-byte memos and virtual addresses
- batched calls
- parallel/expiring nonces
- passkeys and scoped access keys
- TIP-403 compliance policies
- an enshrined stablecoin DEX
- private "Zones" (preview)

Stable has enterprise lanes (guaranteed blockspace), invoice nonces, EIP-7702 batching and session keys, pull subscriptions and x402/MPP, while its confidential transfers and transfer aggregator are not yet live. Plasma's distinctive pieces are the zero-fee USDT lane and a promised confidential-payments module and BTC bridge, but it has less live protocol-level payments tooling.

### Cited Findings
**Tempo (LIVE unless noted)**
- **Payment lanes.** A transaction counts as a payment only if every call is an allow-listed TIP-20 payment, mint, burn, approval or channel-reserve call. It must also have empty access and authorization lists and a key_authorization of 1024 bytes or less. A new header field, `general_gas_limit`, caps gas for non-payment transactions so payments keep the remaining capacity. Classification is stateless (payload-only). — [Payment Lane Spec](https://tempo.xyz/developers/docs/protocol/blockspace/payment-lane-specification.md)
- **Memos and reconciliation.** TIP-20 transfers carry 32-byte memos that match invoices or orders through events. Virtual addresses forward deposits to one account without sweep transactions. — [Transfer memos](https://tempo.xyz/developers/docs/guide/payments/transfer-memos.md); [Virtual addresses](https://tempo.xyz/developers/docs/protocol/tip20/virtual-addresses.md)
- **Tempo Transactions.**
  - Atomic batched calls.
  - Independent (parallel) nonces and expiring nonces (TIP-1009, time-bounded replay protection).
  - Fee-token choice and sponsorship.
  - The docs say these achieve ERC-4337 goals without bundlers, paymasters or EntryPoint contracts.
  - The docs include a guide to batch and scheduled payouts.
  — [Transactions](https://tempo.xyz/developers/docs/protocol/transactions.md); [TIP-1009](https://tempo.xyz/developers/docs/protocol/tips/tip-1009.md); [EIP-4337 comparison](https://tempo.xyz/developers/docs/protocol/transactions/eip-4337.md); [Batch & scheduled payouts](https://tempo.xyz/developers/docs/resources/guides/batch-payments.md)
- **Accounts.** Passkeys (WebAuthn/P-256, so Face ID or Touch ID). Configurable multi-signer weighted accounts. Access keys with onchain spending limits, expiry and call scopes. — [Passkeys](https://tempo.xyz/developers/docs/accounts/authentication/passkeys.md); [Access keys](https://tempo.xyz/developers/docs/accounts/access-keys.md)
- **Compliance.** TIP-403 is a shared policy registry with whitelists and blacklists for TIP-20 issuers. Receive policies can hold blocked payments for a recovery authority instead of reverting. — [TIP-403](https://tempo.xyz/developers/docs/protocol/tip403/overview.md); [Receive policies](https://tempo.xyz/developers/docs/protocol/tip403/receive-policies.md)
- **Native FX.** An enshrined stablecoin orderbook DEX supports limit and flip orders with price-time priority. The quote token is pathUSD (live on mainnet). — [DEX spec](https://tempo.xyz/developers/docs/protocol/exchange/spec.md); [Quote tokens](https://tempo.xyz/developers/docs/protocol/exchange/quote-tokens.md)
- **Privacy (PREVIEW).** Tempo Zones are private stablecoin ledgers that settle to Tempo. Limited preview only. — [Zones](https://tempo.xyz/developers/docs/zones.md)
- **Machine Payments Protocol (MPP).** An open standard for agent payments, launched with mainnet on 18 Mar 2026. It is chain-agnostic. — [Ledger Insights](https://www.ledgerinsights.com/stripe-paradigm-launch-tempo-blockchain-alongside-machine-payments-standard/); [Finextra](https://www.finextra.com/newsarticle/47462/stripe-backed-tempo-blockchain-goes-live-with-machine-payments-protocol)

**Stable**
- **Guaranteed blockspace (LIVE since v1.8.0).** Blocks are split into lanes with separate gas budgets. Eligible transactions use type `0x3F` and enter an Enterprise lane that normal traffic cannot consume (the signer pays gas). This uses 2D-nonce independent channels. — [Docs index](https://docs.stable.xyz/llms.txt); [Roadmap](https://docs.stable.xyz/en/explanation/technical-roadmap)
- **Invoices.** Deterministic nonces link invoices to ERC-3009 settlement. — [Docs index](https://docs.stable.xyz/llms.txt)
- **Recurring billing.** Pull-based subscriptions: "authorize once, collect each cycle". — same
- **EIP-7702 (LIVE).** Batches multiple USDT0 transfers atomically and supports scoped, expiring session keys. — same
- **x402 and MPP.** x402 facilitators, pay-per-call APIs, MPP endpoints and sessions, and MCP-server payments. Agent settlement is marked "Pilot". — same; [docs.stable.xyz](https://docs.stable.xyz)
- **USDT Transfer Aggregator (PLANNED / in development).** Batched, parallel USDT0 transfers. — [Roadmap](https://docs.stable.xyz/en/explanation/technical-roadmap)
- **Confidential transfer (UNDER DEVELOPMENT).** ZK-shielded amounts with public addresses and auditor visibility. — [Docs index](https://docs.stable.xyz/llms.txt)
- **Native FX.** Uniswap v3 deployments plus a "Stable Swap" frontend. No enshrined DEX. RedStone oracles. — same

**Plasma**
- **Blockspace.** A dedicated zero-fee stablecoin-transfer lane is kept separate from general EVM execution. — [Equilibrium](https://equilibriumlabs.substack.com/p/equilibrium-infra-bulletin-52-the)
- **Confidential payments.** Announced in design materials, but no live details were found. — same
- **Docs coverage.** The docs index includes Account Abstraction, Payments "Core Concepts" and "Payment Partners" pages, whose contents were not retrieved. — [docs.plasma.org llms.txt](https://docs.plasma.org/llms.txt)

### Inferences
- A cross-chain "UPI" app would map cleanly onto Tempo's memo field and virtual addresses for merchant reconciliation.
- On Stable, the equivalents are ERC-3009 invoice nonces.
- On Plasma, you would need app-level references (e.g. calldata or event tags).

### Gaps
- Plasma's current confidential-payment status, AA/passkey support and any memo standard.
- Whether Tempo Zones have left preview.

## 4. Cross-chain connectivity

### Takeaway
USDT0 (LayerZero OFT) is the common thread:
- Stable is USDT0-native.
- Plasma is a launch venue for USDT0 and also carries native USDC via CCTP/Bridge Kit, plus a validator-run BTC bridge (pBTC).
- Tempo is adding USDT0 alongside its native TIP-20 issuers.

### Cited Findings
- **Stable.** Two bridge paths into Stable, depending on the form of USDT at the source. LayerZero DVN security is described: "a single DVN compromise does not put Stable at risk". The docs also cover intent networks and aggregators. — [Docs index](https://docs.stable.xyz/llms.txt)
- **Plasma USDC.** Native USDC moves to and from Plasma via Circle Bridge Kit (CCTP). — [docs.plasma.org llms.txt](https://docs.plasma.org/llms.txt)
- **Plasma BTC bridge (pBTC).**
  - Minted and redeemed through an MPC network of validators, all of whom run Bitcoin nodes.
  - Requires >2/3 validator signatures.
  - State diffs are anchored in Bitcoin Taproot witness data.
  - Live status is UNVERIFIED.
  — [Equilibrium](https://equilibriumlabs.substack.com/p/equilibrium-infra-bulletin-52-the)
- **Tempo.** USDT0 is expanding to Tempo, and RedStone provides FX and stablecoin price feeds. — [search summary of The Block / Decrypt coverage](https://www.theblock.co/amp/post/397286/visa-stripe-zodia-custody-standard-chartered-validators-tempo)
- **Tempo issuers.** Klarna announced a stablecoin on Tempo mainnet. — [Yahoo](https://finance.yahoo.com/news/stripe-deploys-tempo-blockchain-mainnet-174049394.html)

### Gaps
- Whether pBTC is live on mainnet.
- Whether CCTP is live on Tempo and Stable.
- Specific USDT0 supply per chain.

## 5. Consumer and merchant products, SDKs

### Takeaway
- **Plasma** owns a consumer front end (Plasma One neobank with a Visa card).
- **Tempo** rides Stripe's merchant network and enterprise partners.
- **Stable** focuses on wallets (Stable Pay), enterprise SDKs and agent payments.

### Cited Findings
- **Plasma One.**
  - Public launch in June 2026 after a private beta with about 5,000 weekly active users.
  - Features: stablecoin dollar account, fee-free transfers, a Visa card, cashback of "up to 4%" and yield of "10%+".
  - Card coverage is claimed at 150+ or 180+ countries; sources conflict.
  — [Blockworks](https://blockworks.co/news/plasma-one-stablecoin-neobank); [The Paypers](https://thepaypers.com/crypto-web3-and-cbdc/news/plasma-launches-stablecoin-native-neobank-and-card); [Decrypt](https://decrypt.co/340659/plasma-to-launch-stablecoin-native-neobank-after-this-months-mainnet-beta)
- **Plasma and Stripe cards.** Stripe reportedly named Plasma a design partner for stablecoin payment cards targeting 2027 (UNVERIFIED; CMC AI summary). — [CoinMarketCap](https://coinmarketcap.com/cmc-ai/plasma-xpl/latest-updates/)
- **Tempo design partners.** Initial partners included Anthropic, Coupang, Deutsche Bank, DoorDash, Lead Bank, Mercury, Nubank, OpenAI, Revolut, Shopify, Standard Chartered and Visa. — [Blockworks](https://blockworks.co/news/stripe-and-paradigm-incubate-tempo)
- **Tempo funding.** $500M Series A at a $5B valuation (Thrive, Greenoaks), October 2025. — [search summary of The Block coverage](https://www.theblock.co/amp/post/397286/visa-stripe-zodia-custody-standard-chartered-validators-tempo)
- **Tempo live settlement.** Reported users include Stripe payouts, MoneyGram, Flutterwave, OnePay, Coastal Bank and Deel. More than 100 services had integrated at launch (secondary). — [Yahoo](https://finance.yahoo.com/news/stripe-deploys-tempo-blockchain-mainnet-174049394.html); [crypto.news](https://crypto.news/stripe-and-paradigms-tempo-mainnet-goes-live-for-machine-payments/)
- **Stable Pay.** Social login and human-readable names instead of hex addresses. — [Finovate](https://finovate.com/stable-launches-stablepay-to-bring-stablecoin-payments-to-the-mainstream/)
- **Stable SDKs.** `@stablechain/sdk` (viem-based, with an `earn` module for Morpho) and `@stablechain/enterprise` (gas-waived and guaranteed transactions). Tether WDK is supported. Off-ramps cover Africa and the Middle East. — [Docs index](https://docs.stable.xyz/llms.txt); [docs.stable.xyz](https://docs.stable.xyz)

### Gaps
- Tempo SDK package names (tempo.ts / viem extensions are not confirmed here).
- Plasma One user counts after launch.
- Stable Pay user numbers.

## 6. Status as of November 2026

### Takeaway
All three have mainnets live:
- Plasma: beta since Sep 2025.
- Stable: since Dec 2025.
- Tempo: since Mar 2026.

On DefiLlama stablecoin supply (fetched 9 Nov 2026), Plasma leads at about $1.42B, Tempo follows at about $812M, and Stable is far behind at about $30M. Stable's figure looks low against its reported $2B pre-deposits and may reflect a tracking gap, so flag it.

### Cited Findings
- **DefiLlama totalCirculatingUSD (peggedUSD), 9 Nov 2026.** For context, Tron is about $93.6B and Ethereum about $134.6B. — [DefiLlama stablecoin chains API](https://stablecoins.llama.fi/stablecoinchains)

  | Chain | Stablecoin supply |
  |---|---|
  | Plasma | $1,420.7M |
  | Tempo | $811.8M |
  | Stable | $30.0M |

- **Plasma, other supply figures (conflicting).** Secondary sources give about $1.03B (61.6% USDT) and about $710M. Both are older snapshots. — [eco.com](https://eco.com/support/en/articles/15010642-what-is-plasma-blockchain-tether-s-stablecoin-l1-explained); [Datawallet](https://www.datawallet.com/crypto/what-is-plasma-chain)
- **Plasma XPL token.** Down about 95% from its peak. Team and investor unlocks run monthly from 25 Oct 2026. — [Datawallet](https://www.datawallet.com/crypto/what-is-plasma-chain); [DropsTab](https://dropstab.com/coins/xpl)
- **Stable launch.** Mainnet and the STABLE token launched 8 Dec 2025. Pre-deposits topped $2B from about 24k wallets (secondary). — [Bloomingbit/Bitbank summaries](https://en.bloomingbit.io/feed/news/93416)
- **Tempo launch.** Mainnet launched 18 Mar 2026, after a public testnet (Moderato) in Dec 2025. — [Ledger Insights](https://www.ledgerinsights.com/stripe-paradigm-launch-tempo-blockchain-alongside-machine-payments-standard/); [Finextra](https://www.finextra.com/newsarticle/47462/stripe-backed-tempo-blockchain-goes-live-with-machine-payments-protocol)

### Gaps
- Transaction counts, volumes and active addresses for all three; no reliable Nov 2026 figures were found. Artemis, Token Terminal and Dune were not queried. Dune has a Tempo dataset: [docs.dune.com](https://docs.dune.com/data-catalog/evm/tempo/overview.md).
- Tempo had no token announced as of the latest sources (Oct 2026).

## 7. Unique features (what each has that the others lack)

### Takeaway
- **Tempo:** the only chain with no native token at all, fees in any stablecoin via an enshrined Fee AMM, an enshrined stablecoin orderbook DEX for FX, protocol-level memos and virtual addresses, TIP-403 issuer compliance registry, native passkeys and access keys (4337-free AA), Visa/Stripe/Zodia validators, and the MPP standard.
- **Stable:** the only chain where USDT0 *is* the native gas asset, plus a governance-registered gas-waiver system, a typed Enterprise lane (tx type 0x3F), invoice nonces, and a published roadmap toward DAG consensus (Autobahn) and a C++ EVM.
- **Plasma:** the only chain with a consumer neobank and card (Plasma One), protocol-sponsored zero-fee USDT `transfer`, Bitcoin anchoring plus a validator-MPC BTC bridge, and the largest DefiLlama stablecoin float of the three.

### Cited Findings
- See the sections above for sources. Tempo: [docs](https://tempo.xyz/developers). Stable: [docs index](https://docs.stable.xyz/llms.txt). Plasma: [Blockworks](https://blockworks.co/news/plasma-one-stablecoin-neobank), [Equilibrium](https://equilibriumlabs.substack.com/p/equilibrium-infra-bulletin-52-the).

### Inferences
- For a universal UPI-style app:
  - Tempo offers the best native primitives: memo, virtual addresses, passkeys, sponsorship and FX.
  - Plasma offers the best free consumer USDT P2P plus existing liquidity.
  - Stable offers the USDT0-native merchant and enterprise lane.
- A router abstracting over all three would mostly be normalising (a) the gas and sponsorship model, (b) payment references or memos, and (c) USDT0 vs TIP-20 token sets.

### Gaps
- Plasma's live feature set beyond the zero-fee transfer: confidential payments, pBTC, AA. Official docs pages were not retrieved, and these remain partly UNVERIFIED.
