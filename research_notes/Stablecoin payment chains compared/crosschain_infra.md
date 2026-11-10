# Cross-chain and abstraction infrastructure for a universal multi-chain stablecoin payments app ("UPI for stablecoins")

Research date: 2026-11-09. Budget-limited pass (~17 tool calls). Many web results were third-party explainers (notably eco.com support articles, which read as vendor/SEO content); primary-doc confirmations are marked. "LIVE" = shipped on mainnet per a cited source; "ANNOUNCED/UNVERIFIED" = only roadmap or single secondary source.

---

## 1. Stablecoin movement: CCTP v2, Circle Gateway, USDT0, CCIP, intent bridges, chain-abstraction layers

### Takeaway
For USDC, the stack is CCTP V2 (burn/mint, point-to-point, Fast Transfer ~8–20 s on ~14 source chains, ~31 domains) plus Circle Gateway (unified, non-custodial USDC/EURC balance, <500 ms cross-chain mints after deposit, 7-day trustless exit). For USDT, USDT0 (LayerZero OFT burn/mint) covers ~24–25 networks. Intent bridges (Across, Relay) cover the long tail and non-native assets in seconds but carry solver/relayer operational risk (Across had a July 2026 relayer-software exploit). Generic chain-abstraction SDKs are volatile: OneBalance deprecated its Toolkit API in May 2026.

### Cited Findings

**Circle CCTP V2 (LIVE)**
- Circle's official supported-blockchains page lists these CCTP domains: Aptos (9), Arbitrum (3), Arc (26), Avalanche (1), Base (6), BNB Smart Chain (17, USYC only), Codex (12), Cronos (32), EDGE (28), Ethereum (0), HyperEVM (19), Injective (29), Ink (21), Linea (11), Monad (15), Morph (30), OP Mainnet (2), Pharos (31), Plasma (33), Plume (22), Polygon PoS (7), Sei (16), Solana (5), Sonic (13), Starknet (25), Stellar (27), Sui (8), Unichain (10), World Chain (14), X Layer (37), XDC (18). Noble (domain 4) is CCTP V1 (Legacy) only. — [Circle Docs: CCTP supported blockchains](https://developers.circle.com/cctp/cctp-supported-blockchains)
- Fast Transfer as a *source* is supported on: Arbitrum, Base, Codex, EDGE, Ethereum, Ink, Linea, Morph, OP Mainnet, Plume, Solana, Starknet, Unichain, World Chain, X Layer. Other chains are "N/A" because standard attestation is already fast enough (e.g., Avalanche, Polygon PoS, HyperEVM, Arc, Monad, Sonic, Sei). — [Circle Docs](https://developers.circle.com/cctp/cctp-supported-blockchains)
- The same page lists Hooks as a capability of the supported chains (no per-chain breakdown), plus a newer "Forwarding Service" (destination) on a subset (e.g., Arbitrum, Arc, Avalanche, Base, Ethereum, HyperEVM, Ink, Linea, Monad, OP, Plume, Polygon, Sei, Solana, Sonic, Unichain, World Chain, XDC) and "upfront fees" on a subset. — [Circle Docs](https://developers.circle.com/cctp/cctp-supported-blockchains)
- Speed: CCTP Fast Transfer ~8–20 seconds; Standard Transfer 15–19 minutes on Ethereum and L2s (waits for hard finality). — [Circle Docs: Gateway overview (CCTP comparison)](https://developers.circle.com/gateway)
- Fast Transfer and Hooks are unavailable on V1 routes; a third-party guide says V1 deprecation begins Oct 31, 2026 and completes Dec 1, 2026 (UNVERIFIED against Circle). — [eco.com CCTP guide 2026](https://eco.com/support/en/articles/14998923-cctp-cross-chain-usdc-complete-guide-2026)
- Circle's V2 launch framing: Fast Transfer for "crypto capital markets" settlement and Hooks for post-transfer automation on destination. — [Circle pressroom](https://www.circle.com/pressroom/circle-launches-next-evolution-of-cctp-to-enable-fast-cross-chain-settlement-for-crypto-capital-markets); [Circle blog](https://www.circle.com/blog/cctp-v2-the-future-of-cross-chain)
- Conflict note: Circle's page body says Aptos/Sui in the main table while its agent notes say Aptos and Sui require V1 — verify before building on either. — [Circle Docs](https://developers.circle.com/cctp/cctp-supported-blockchains)

**Circle Gateway (LIVE since Aug 2025)**
- Mainnet launch: unified USDC balance accessible cross-chain in <500 ms, initially on Arbitrum, Avalanche, Base, Ethereum, Optimism, Polygon, Unichain. — [Circle on X](https://x.com/circle/status/1957789650174484867)
- Mechanism: deposit USDC, EURC or cirBTC into non-custodial Gateway Wallet contracts on any supported source chain; mint on any supported destination with one API call; separate unified balance per asset, never converts between assets. — [Circle Docs: Gateway](https://developers.circle.com/gateway)
- Security/trust: non-custodial, transfers authorized by user signature; "7-day trustless withdrawal option" that doesn't depend on Circle's API; ERC-1271 supported so smart accounts can authorize; "fully permissionless" integration. — [Circle Docs: Gateway](https://developers.circle.com/gateway)
- Gateway Nanopayments: "gasless, sub-cent USDC payments" for AI agents / machine-to-machine. — [Circle Docs: Gateway](https://developers.circle.com/gateway)
- Current chain list (secondary sources, partly conflicting): Arbitrum, Arc, Avalanche, Base, Ethereum, HyperEVM, OP, Polygon PoS, Sei, Solana, Sonic, Unichain, World Chain (13); Circle's own skills repo says "11 EVM chains + Solana" plus Arc testnet. — [eco.com Gateway vs multi-issuer](https://eco.com/support/en/articles/15182312-circle-gateway-vs-multi-issuer-routing-unified-usdc-balance-tradeoffs); [circlefin/skills use-gateway SKILL.md](https://github.com/circlefin/skills/blob/master/plugins/circle/skills/use-gateway/SKILL.md)

**USDT0 via LayerZero OFT (LIVE)**
- Mechanism: OFT burn on source / mint on destination, no liquidity pool; on Ethereum an OFT adapter locks native USDT. — [eco.com USDT0 explainer](https://eco.com/support/en/articles/15192015-what-is-usdt0-tether-s-omnichain-stablecoin-explained-2026); [Messari OFT report](https://messari.io/report/layerzero-scaling-stablecoin-issuers-with-the-oft-standard)
- Chain count: USDT0 deployments page listed 24 networks on Oct 5, 2026 (per secondary source); Stellar launch article says "more than 25". Frequently named: Arbitrum, Optimism, Polygon PoS, Berachain, Plasma, Unichain, Ink, HyperEVM, Flare, X Layer, Stellar. — [eco.com best USDT bridge 2026](https://eco.com/support/en/articles/15291261-best-cross-chain-usdt-bridge-2026-multi-network-steps); [crypto.news Stellar](https://crypto.news/usdt0-launches-on-stellar-with-cross-chain-liquidity/); [USDT0 blog (OKX support)](https://blog.usdt0.to/okx-now-supports-usdt0-on-arbitrum-optimism-unichain-berachain-polygon-and-x-layer)
- Note: Tether also reportedly moved USDt onto Chainlink's CCT standard (secondary). — [DEXTools CCIP guide](https://www.dextools.io/tutorials/what-is-chainlink-ccip-cross-chain-protocol-guide-2026)

**Chainlink CCIP / CCT (LIVE)**
- CCT = permissionless framework letting an issuer deploy one token across chains with native cross-chain transfers; self-serve integration "within minutes" via Token Manager. — [Hedera blog](https://hedera.com/blog/hedera-adopts-chainlink-standard-for-cross-chain-interoperability-to-accelerate-ecosystem-adoption)
- Network count: "50+ networks" (2026 third-party) vs Hedera's Apr 2025 "41+ other chains" — no official current count retrieved. — [DEXTools](https://www.dextools.io/tutorials/what-is-chainlink-ccip-cross-chain-protocol-guide-2026); [Hedera](https://hedera.com/blog/hedera-adopts-chainlink-standard-for-cross-chain-interoperability-to-accelerate-ecosystem-adoption)
- Chainlink changelog shows steady 2026 CCT token additions (e.g., MNT Jul 20, syrupUSDG Jul 3, FRNT Aug 13). — [Chainlink changelog](https://dev.chain.link/changelog/cross-chain-token-cct-standard-added-support-for-new-tokens-ac28b)
- CCIP is a day-one integration on Circle's Arc mainnet (data feeds, data streams, CCIP, proof of reserves). — [Circle pressroom: Arc mainnet](https://www.circle.com/pressroom/circle-launches-arc-mainnet-an-economic-operating-system-for-the-internet); [KuCoin](https://www.kucoin.com/news/insight/USDC/6aab58287d10fa0007ce0f6d)

**Intent bridges: Across, Relay (LIVE)**
- Across = reference implementation of ERC-7683; ~88% of its volume ran via ERC-7683 (Q3 2025 figure). — [eco.com ERC-7683 deep dive](https://eco.com/support/en/articles/14796366-erc-7683-cross-chain-intents-standard-deep-dive)
- Across fill times: vendor claims ~2 s; other sources 2–15 s, median ~8 s, or 10–60 s (CONFLICTING). Solver reimbursement via optimistic settlement window ~30 min. Fees: LP fee + relayer fee, no flat protocol fee; ~0.05–0.15% on USDC routes. — [Across blog](https://across.to/blog/crosschain-infra); [stablecoininsider Across review](https://stablecoininsider.org/across-protocol-review-is-it-the-best-bridge-for-stablecoins-in-2026/); [Datawallet](https://www.datawallet.com/crypto/best-crypto-bridges)
- Across July 2026 incident: exploit of relayer software reading off-chain events (not core contracts/Solana programs), disclosed Jul 17; loss reported as ~$3.35M or ~$4.5M (CONFLICTING), funds belonged to Risk Labs not users; patched within 5 h; exploiter returned 331.8 ETH (~$623.9K). — [web3isgoinggreat](https://www.web3isgoinggreat.com/single/across-protocol-exploit); [Bitget news](https://www.bitget.com/news/detail/12560605545959); [CoinGabbar](https://www.coingabbar.com/en/crypto-currency-news/crypto-hack-news-across-exploiter-refunds-623k-eth)
- Relay: solver fills with own capital, batched settlement on Relay Chain at ~$0.005/order; ~0.1% + gas (secondary). Zerion recommends Relay as the execution replacement for OneBalance. — [eco.com cheapest bridge 2026](https://eco.com/support/en/articles/15291262-cheapest-crypto-bridge-2026-fee-ranked-routes); [Zerion migration](https://zerion.io/blog/migrating-from-onebalance-to-zerion-api/)

**Chain-abstraction layers**
- OneBalance: Toolkit API deprecated May 18, 2026; OneApp shutting with withdrawals by July 1. Zerion's guide says its API "doesn't replace OneBalance's chain abstracted execution". — [Zerion](https://zerion.io/blog/migrating-from-onebalance-to-zerion-api/); [Bitget](https://www.bitget.com/news/detail/12560605435115)
- Particle Universal Accounts: ERC-4337 smart accounts coordinated across chains by Particle Chain (L1); intents filled by Particle's in-house solvers (centralized solver set). EIP-7702 support reported Mar 24, 2026 (single source). — [Particle docs](https://developers.particle.network/intro/universal-accounts); [Particle whitepaper](https://whitepaper.particle.network/particle-network/abstraction-functionalities)
- NEAR Chain Signatures / NEAR Intents: MPC network lets NEAR contracts sign native txs on other chains; Intents settle without destination contracts or wrapped tokens; "31+ blockchains" (secondary). A ~$3.8M deposit-handling drain around Oct 2026 was reported by one overview (UNVERIFIED). — [NEAR on X](https://x.com/NEARProtocol/status/2098089044693401830); [near.org/intents](https://www.near.org/intents); [coincub chain abstraction](https://coincub.com/blog/chain-abstraction/)

### Inferences
- Best-fit routing for a "one balance" app: hold USDC in Circle Gateway (sub-second spend on ~13 chains, trust-minimized exit) and fall back to CCTP V2 Fast Transfer for chains outside Gateway; USDT via USDT0 OFT; anything else (or USDC↔USDT swaps across chains) via an intent bridge (Across/Relay) with per-route caps.
- Security ranking (my judgement): issuer burn/mint (CCTP, Gateway, USDT0) trusts the issuer/attesters that already back the token — lowest *added* risk. Intent bridges add solver/relayer + optimistic-oracle risk but users are filled before risk lands on solvers. MPC/in-house-solver abstraction layers (NEAR, Particle) add the most new trust assumptions and vendor-continuity risk (OneBalance shutdown is a concrete warning).

### Gaps
- Exact CCTP Fast Transfer fee (bps) and per-chain attestation times — Circle page links a separate finality table I did not fetch.
- Official Gateway chain list and fees; who attests Gateway balances.
- Official USDT0 network list and LayerZero DVN configuration used by USDT0.
- CCIP programmable token transfer details, current chain count, rate limits / Risk Management Network specifics — not retrieved from docs.chain.link in this pass.
- Whether Relay implements ERC-7683.

---

## 2. Gas abstraction: ERC-4337 paymasters, EIP-7702, ERC-20 gas, passkey smart accounts, cross-chain gas

### Takeaway
EIP-7702 (live on Ethereum since the Pectra upgrade) lets EOAs adopt smart-account code, but it does not by itself remove gas: sponsorship or ERC-20 gas still flows through ERC-4337 UserOperations with a bundler + paymaster (EntryPoint v0.8 adds native 7702 support). Pimlico and ZeroDev are the reference providers.

### Cited Findings
- "EIP-7702 gives an EOA smart account code, but it doesn't change who pays for gas. To sponsor gas or let users pay it in ERC-20 tokens, send the account's transactions as ERC-4337 user operations." — [Pimlico docs: EIP-7702](https://docs.pimlico.io/guides/eip7702)
- Pimlico bundler/paymasters accept `eip7702Auth` in `eth_sendUserOperation` / `eth_estimateUserOperationGas` and support EntryPoint v0.8 (native 7702). — [Pimlico docs](https://docs.pimlico.io/guides/eip7702)
- Pimlico offers verifying (sponsorship) and ERC-20 paymasters; its ERC-20 paymaster is widely used as reference. — [Pimlico gas sponsorship](https://www.pimlico.io/products/gas-sponsorship); [Openfort comparison](https://www.openfort.io/blog/best-account-abstraction-providers)
- ZeroDev: 7702 path delegates EOA to Kernel v3.3 with a paymaster client (EntryPoint 0.7 in quickstart); supports ERC-20 gas. — [Openfort comparison](https://www.openfort.io/blog/best-account-abstraction-providers)
- Privy documents embedded-wallet + 7702 integration recipes. — [Privy docs](https://docs.privy.io/recipes/react/eip-7702)
- Circle Gateway Nanopayments advertise gasless sub-cent USDC payments; Gateway accepts ERC-1271 smart-account signatures. — [Circle Docs: Gateway](https://developers.circle.com/gateway)
- x402 V2 adds gasless Permit2 approvals (pay with any ERC-20) — the facilitator pays gas. — [eco.com x402 explained](https://eco.com/support/en/articles/14839402-x402-protocol-explained)

### Inferences
- Simplest gasless USDC path not needing 4337 at all: EIP-3009 `transferWithAuthorization` / EIP-2612 permit signed by the user and submitted by a relayer (this is what x402 "exact" scheme and Gateway use). Combine with 7702 + paymaster only when the user needs arbitrary calls (swaps, multi-step).
- Cross-chain gas: chain-abstraction layers (Particle UA) and Gateway/CCTP Forwarding Service effectively absorb destination gas; a self-built app must run a paymaster per chain and price it in USDC.

### Gaps
- Coinbase Smart Wallet / Base Account passkey details, Safe passkey module status, and cross-chain gas tanks — no reliable sources retrieved this pass.
- Paymaster pricing (markups) per provider.

---

## 3. Naming: ENS multichain records (ENSIP-11/19), ENSv2, CCIP-read, alternatives

### Takeaway
ENS Labs cancelled its Namechain L2 in Feb 2026 and is deploying ENSv2 directly on Ethereum L1; a single (Blockscout PR) source says ENSv2 went live on mainnet in Oct 2026, with primary names set via a DefaultReverseRegistrar and ENSIP-19 multichain primary names. Cross-chain resolution relies on CCIP-Read (EIP-3668) offchain/L2 resolvers.

### Cited Findings
- ENS Labs halted Namechain development (Feb 2026); ENSv2 to deploy directly on Ethereum mainnet; ENS said launch schedule unaffected. — [Radom](https://www.radom.com/insights/ens-labs-revises-strategy-by-halting-development-of-namechain-layer-2-opts-for-full-integration-of-ensv2-on-ethereum-mainnet); [CoinAlertNews](https://coinalertnews.com/news/2026/02/07/ens-abandons-namechain-launches-ensv2-ethereum)
- ENSv2 alpha coverage (Mar 2026). — [bex.co](https://bex.co/blog/2026/03/11/ensv2-alpha-launch-ethereum-name-service-l2-cross-chain-identity)
- "ENS launched ENSv2 on mainnet in October 2026"; ENSv2 app sets primary names through the DefaultReverseRegistrar; indexers now read ENSIP-19 default primary names. (SINGLE SECONDARY SOURCE — UNVERIFIED) — [blockscout-rs PR #1787](https://github.com/blockscout/blockscout-rs/pull/1787)
- ENSIP-19 standardizes reverse/primary-name resolution across EVM chains and coin types, using CCIP-Read as proof mechanism. — [ENS DAO forum: Namechain, ENSIP-19 & multichain interop](https://discuss.ens.domains/t/ens-research-namechain-ensip-19-multichain-interop/21392)

### Inferences
- For "one name, any chain": store per-chain addresses with ENSIP-11 coinType records (EVM chainId → coinType `0x80000000 | chainId`) on a merchant/user name; use ENSIP-19 for reverse lookups on L2s; issue user subnames from an offchain/L2 CCIP-Read resolver to avoid L1 gas. (ENSIP-11 coinType formula is from prior knowledge, not re-verified this pass.)

### Gaps
- Official ENS blog confirmation of ENSv2 mainnet date and feature set.
- Alternatives (Basenames, Solana SNS, Unstoppable Domains, World usernames) not researched this pass.

---

## 4. FX and pricing: Chainlink fiat FX feeds, onchain FX (Arc StableFX, stable pools)

### Takeaway
Chainlink publishes an INR/USD reference feed (confirmed on Polygon mainnet). Circle's Arc mainnet launched Sept 16, 2026 with StableFX (onchain PvP stablecoin FX) and Chainlink feeds/CCIP as day-one integrations.

### Cited Findings
- Chainlink INR/USD price feed exists on Polygon mainnet. — [data.chain.link INR/USD (Polygon)](https://data.chain.link/feeds/polygon/mainnet/inr-usd)
- Arc mainnet launched Sept 16, 2026 (EVM L1 for financial markets, stablecoin payments, agentic activity). — [Circle pressroom](https://www.circle.com/pressroom/circle-launches-arc-mainnet-an-economic-operating-system-for-the-internet); [FXStreet](https://www.fxstreet.com/cryptocurrencies/news/circle-launches-arc-mainnet-with-wall-street-validators-as-clarity-act-stalls-202609161039)
- StableFX live on Arc mainnet, 24/7 FX settlement; payment-versus-payment (both legs settle or neither). — [KuCoin flash](https://www.kucoin.com/news/flash/circle-s-stablefx-launches-on-arc-mainnet-for-24-7-fx-settlement)
- Chainlink on Arc: data feeds, data streams, CCIP, proof of reserves. — [KuCoin](https://www.kucoin.com/news/insight/USDC/6aab58287d10fa0007ce0f6d)

### Inferences
- Display pricing: use Chainlink fiat feeds (INR/USD, AED/USD, etc.) for quoting local-currency amounts; actual conversion USDC↔EURC/local stablecoins via StableFX (institutional RFQ) or DEX stable pools. Fiat feeds have heartbeats/deviation thresholds — not suitable for tight intraday FX settlement without spread.

### Gaps
- Whether INR/USD (and AED, UAH, NGN, BRL feeds) exist on Arc/Base; StableFX pairs supported and access model (permissioned?); Uniswap stable-pool FX depth for non-USD stablecoins.

---

## 5. Payment standards: EIP-681, x402, ERC-7683, Solana Pay, ISO 20022

### Takeaway
x402 is now a Linux Foundation standard (Apr 2026), V2 adds pluggable facilitators and Permit2; Coinbase's CDP facilitator supports Base, Polygon, Arbitrum, World, Solana mainnets. ERC-7683 is still Draft and was substantially rewritten to a resolver-centric model — the older `GaslessCrossChainOrder`/`IOriginSettler` structs Across implemented are no longer in the current draft.

### Cited Findings
- x402 formalized under the Linux Foundation on Apr 2, 2026 (MCP Dev Summit NA); Coinbase contributed but doesn't control it. V2: network-agnostic identifiers, pluggable facilitators, wallet hooks, "Bazaar" discovery, dynamic recipients (fee splits), gasless Permit2 approvals. — [eco.com x402 explained](https://eco.com/support/en/articles/14839402-x402-protocol-explained); [DEV x402 2026](https://dev.to/corwin_8699bb02f025fc99af/x402-payment-protocol-the-rails-powering-the-ai-agent-economy-2026-m6f)
- CDP facilitator mainnets (verified Oct 14, 2026 by third party): Base, Polygon, Arbitrum, World, Solana. Public x402.org facilitator is testnet-only. — [DEV: facilitator lists re-probed](https://dev.to/scriptmasterlabs01/which-payment-networks-support-the-x402-protocol-the-facilitator-lists-re-probed-46bn); [CDP Facilitator docs](https://docs.cdp.coinbase.com/x402/core-concepts/facilitator); [Coinbase: Polygon launch](https://www.coinbase.com/developer-platform/discover/launches/x402facilitator-polygon)
- Stellar shipped a production x402 facilitator (OpenZeppelin Relayer) Mar 2026; concentration risk: Coinbase's facilitator verifies most traffic. — [wavect x402 comparison](https://wavect.io/blog/x402-payments-comparison-2026/)
- ERC-7683: Status Draft, created 2024-04-11, requires ERC-7930; current draft replaces earlier `GaslessCrossChainOrder`/`OnchainCrossChainOrder`/`ResolvedCrossChainOrder` and `IOriginSettler`/`IDestinationSettler` with an `IResolver.resolve` → `ResolvedOrder` (steps, variables, payments, assumptions) model. — [EIPs: ERC-7683](https://eips.ethereum.org/EIPS/eip-7683)
- ERC-7683 fillers as of Apr 2026: Across, Eco, LI.FI, UniswapX, Symbiosis. — [eco.com ERC-7683 deep dive](https://eco.com/support/en/articles/14796366-erc-7683-cross-chain-intents-standard-deep-dive)

### Inferences
- A QR "pay request" for the app should emit EIP-681 (`ethereum:<token>@<chainId>/transfer?address=…&uint256=…`) for EVM wallets and Solana Pay transfer-request URLs for Solana, with the app's own universal name/URI wrapping both. (EIP-681 and Solana Pay formats are from prior knowledge; not re-verified this pass.)
- ERC-7683 instability means integrate intent bridges via their SDK/API, not by hard-coding 7683 structs.

### Gaps
- EIP-681 current status and Solana Pay spec details — not fetched.
- ISO 20022 alignment for stablecoin payments (e.g., pacs.008 mapping, XRPL/Stellar/Hedera claims, SWIFT-onchain pilots) — not researched; no sources.

---

## 6. Compliance tooling and licensed ramp providers by region

### Takeaway
Standard stack: Chainalysis / Elliptic / TRM for KYT + sanctions screening, Notabene (2,000+ VASP network) for Travel Rule. EU MiCA CASP transition ended July 1, 2026 — ramps must be on ESMA's register (e.g., Bridge/Stripe, BitPay, OpenPayd, Paybis). India: FIU-IND updated VDA AML/CFT guidelines Jan 8, 2026 restating Travel Rule. Other regions not covered in this pass.

### Cited Findings
- Chainalysis covers ~200+ chains; Elliptic monitors ~1,100 networks (deep analytics 100+). Chainalysis KYT integrates with Notabene for Travel Rule flagging (partnership since Mar 2021). — [Spark AML comparison](https://www.spark.money/tools/crypto-aml-tool-comparison); [Corsa](https://corsa.finance/compare/best-crypto-compliance-software)
- Notabene: >2,000 VASP network; added pre-transaction authorization for stablecoin payments. — [stablecoininsider compliance tools](https://stablecoininsider.org/stablecoin-compliance-tools/)
- India: FIU-IND updated AML/CFT guidelines for VDA service providers on Jan 8, 2026, restating Travel Rule obligations (Notabene's reading; page also labels the regulation "pending" — inconsistent). — [Notabene: India](https://notabene.id/world/india)
- EU MiCA: CASP transitional deadline July 1, 2026 passed with no extensions. OpenPayd CASP (MFSA, Jun 24, 2026); BitPay CASP (Dutch AFM, EEA passport); Bridge (Stripe) on ESMA register via Luxembourg; Paybis CASP + PSD2 PI (Bank of Latvia, May 2026). CASP count ~280–390 depending on tracker. — [luvkaizen MiCA guide](https://www.luvkaizen.com/blogs/mica-licensing-guide-2026); [stablecoininsider ramps](https://stablecoininsider.org/best-institutional-stablecoin-on-off-ramp-providers-in-2026/); [Outrun MiCA tracker](https://www.outrun.at/micar-dashboard)

### Inferences
- Onchain pre-check: the Chainalysis free sanctions screening oracle (contract `isSanctioned(address)` on major EVM chains) is commonly used as a cheap first gate before offchain KYT — this is from prior knowledge, NOT verified this pass (no source found on current chain coverage).

### Gaps
- Chainalysis sanctions oracle current addresses/chains.
- Licensed ramps: India (FIU-registered: e.g., Transak, Onramp Money, CoinDCX/Mudrex — not verified), Gulf (VARA/ADGM/CBUAE licensees), Ukraine (virtual-asset law status), Africa (Yellow Card, Kotani Pay; Nigeria SEC / Kenya VASP Act), LatAm (PIX-based ramps in Brazil, Bitso, Mercado Pago) — searches returned nothing usable within budget.
