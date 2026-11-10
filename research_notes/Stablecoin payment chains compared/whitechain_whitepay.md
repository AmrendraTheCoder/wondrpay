# Whitechain and W Group payment products (Whitepay, WhiteBIT Nova, Whitewallet), as of Nov 2026

Research date: 2026-11-09. Most sources are first-party (Whitechain docs, WhiteBIT and Whitepay marketing) or press releases. Independent coverage is thin. "Live" means the official docs say it is live; "announced" means it is on a roadmap or described as upcoming. Note: the old docs site `l2docs.whitechain.io` no longer resolves (its DNS points at Mintlify with no A record). Current docs are at `docs.whitechain.io`.

## Whitechain architecture: L1 or OP Stack L2? Consensus, block time, finality, gas, fees, EVM, explorer

### Takeaway
Whitechain is now an OP Stack Ethereum L2. The legacy single-validator PoA L1 (geth/Clique, 2s blocks, fixed 10 gwei) was migrated to L2 mainnet on 26 Oct 2026, keeping chain ID 1875. Testnet "Whitechain Sepolia" is chain 1874. The L2 has 1s blocks, WBT as a custom gas token, EIP-1559 with a 5 gwei floor plus an L1 data fee, data posted to Ethereum as blobs, and one designated sequencer. A plain transfer costs roughly $0.005 (illustrative). There is no native paymaster or gasless support.

### Cited Findings
**Legacy L1 (chain 1875, pre-Oct 2026)**
- Legacy L1: built on go-ethereum, Clique PoA (EIP-225), operated by WhiteBIT, 2s blocks, fixed 10 gwei gas price in WBT, single validator — [l2docs.whitechain.io legacy overview (search snippet)](https://l2docs.whitechain.io/legacy/overview); [WhiteBIT help: PoA consensus](https://help.whitebit.com/hc/en-gb/articles/11097217096477-POA-consensus-in-WB-Network)
- A 2024 analysis said the PoA used "a singular validator, which is managed directly by WhiteBIT" — [Medium / FutureValue](https://medium.com/@FutureValue/deep-dive-in-whitebit-coin-wbt-d2235f4ecfbc)
- Whitechain launched as a WhiteBIT-backed EVM L1 (Aug 2023) and served as the settlement layer for WBT's SoulDrop program — [Solana Compass profile](https://solanacompass.com/projects/whitebit); [Newsfile release](https://www.newsfilecorp.com/release/176035?lang=fr)

**Relaunch and migration to L2**
- 18 Aug 2026: Whitechain announced its relaunch as a "distribution-focused" Ethereum L2 on the OP Stack, opened a public testnet, and opened funding and migration applications. The announcement gave no mainnet date and promised a native DEX, an oracle and a bridge as "Day 1 primitives" — [Incrypted, 18 Aug 2026](https://incrypted.com/whitechain-obyavila-o-perezapuske-kak-l2-set-na-baze-op-stack/)
- Migration timeline (UTC): legacy L1 hardfork at block 50851438 on 23 Oct 2026 13:00; migration to L2 mainnet on 26 Oct 2026 02:00. The full state became the L2 genesis. Last L1 block 50961389, first L2 block 50961390. The state held 166,812 accounts, 435 of them contracts. A `NativeAssetLiquidity` allocation of 200,000,000 WBT. The legacy L1 testnet (chain 2625) stopped on 26 Oct and its endpoints were removed by 30 Oct — [Whitechain docs: Migration to L2](https://docs.whitechain.io/learn/general/migration.md)
- Carried over: WBT balances to the wei, contract bytecode, storage, nonces, addresses and ERC-20 balances. Not migrated: tx history, event logs, mempool. `eth_chainId` returns 0x753 on both legacy L1 and L2, so clients cannot tell them apart by chain ID. Legacy endpoints are read-only (`legacy.rpc.whitechain.io`, `legacy.explorer.whitechain.io`) with no shutdown date — [Migration to L2](https://docs.whitechain.io/learn/general/migration.md)
- What changed: single-validator PoA became an OP Stack sequencer "run by a designated operator at launch" with a stated aim of permissionless sequencing; fixed 10 gwei became EIP-1559 with a 5 gwei floor plus an L1 data fee; 2s blocks became 1s; data and settlement moved to Ethereum via blobs; a native OP canonical bridge was added — [Migration to L2](https://docs.whitechain.io/learn/general/migration.md)

**Network parameters**
- Mainnet: chain 1875 (0x753), status "Live, production", settles to Ethereum (1). Sepolia testnet: chain 1874 (0x752), settles to Ethereum Sepolia. Both have 1s blocks, WBT gas (18 decimals) as the OP Stack custom gas token, and a 5 gwei minimum base fee — [Network reference](https://docs.whitechain.io/learn/network/reference)
- EVM: Prague via OP Stack Isthmus. Mainnet also has part of Osaka via the OP "Karst" upgrade: CLZ opcode, a 16,777,216 per-tx gas cap, and MODEXP/P256VERIFY repricing. Sepolia does not have Karst, so a tx above the cap succeeds on testnet but fails on mainnet. Recommended `evmVersion`: prague — [Network reference](https://docs.whitechain.io/learn/network/reference)
- Endpoints: RPC `https://rpc.whitechain.io` / `https://rpc.testnet.whitechain.io` (WebSocket at `/ws`); explorer `https://explorer.whitechain.io` / `https://explorer.testnet.whitechain.io` (Blockscout); testnet faucet `faucet.testnet.whitechain.io`. Public RPC limits are 50 req/s per IP (burst +500) and 100 calls per batch. Multicall3 and GasPriceOracle (`0x42..0F`) are predeployed — [Network reference](https://docs.whitechain.io/learn/network/reference); [whitechain.io](https://whitechain.io/)
- Finality: soft confirmation in about 1s (sequencer's word; can be reordered or dropped before the batch lands); "safe" up to about 30 min once the batch is on Ethereum; "finalized" about 13 min after that, so under 1 hour in total. Withdrawals to Ethereum through the canonical bridge take about 1 hour on testnet and at least 7 days on mainnet. One sequencer, run by a designated operator; op-batcher posts blobs (EIP-4844); op-proposer posts roots through DisputeGameFactory — [Transaction finality](https://docs.whitechain.io/learn/network/transaction-finality.md)
- Fees = L2 execution fee (gas × (base + priority)) + L1 data fee (estimate with `getL1Fee` on GasPriceOracle). Fees go to on-chain fee vaults, with "no operator surcharge". A 21,000-gas WBT transfer at the 5 gwei floor costs about 0.000105 WBT, roughly $0.005 at a hypothetical $50/WBT. The page does not mention gasless, paymaster or sponsored transactions — [Network fees](https://docs.whitechain.io/learn/network/network-fees.md)
- The homepage claims an average fee under $0.01, gives a max WBT supply of 400M, and says "53M+" next to "WBT On-Chain" without making clear what that counts — [whitechain.io](https://whitechain.io/)
- viem ships a `whitechain` chain definition — [viem on jsDelivr](https://cdn.jsdelivr.net/npm/viem@2.48.8/chains/definitions/whitechain.ts)

### Inferences
- Many third-party sources (CoinMarketCap-style profiles, older WhiteBIT blogs, the Medium piece) still describe Whitechain as a PoA L1. Treat any pre-Oct-2026 source as describing the legacy chain.
- For a payments app, a 1s soft confirmation is good enough for UX. Fiat-equivalent finality is either about 1h (Ethereum-final) or immediate if you trust the single WhiteBIT-aligned sequencer.
- Gas must be paid in WBT and there is no native paymaster, so a "UPI for stablecoins" UX needs a relayer, ERC-4337 or EIP-3009/permit flows built by the app itself. 4337 support is not documented.
- The whitechain.io roadmap lists the "mainnet migration" as shipped but the "Public Mainnet Launch" (dynamic EIP-1559, genesis dApps, unified distribution platform) as upcoming under a Q4 2026 "targeted launch". So the chain is technically live, but the ecosystem launch may not be complete — [whitechain.io](https://whitechain.io/)

### Gaps
- The sequencer operator's legal identity is not named ("designated operator"). The fault-proof status (permissionless or permissioned dispute games) is not stated.
- No live mainnet metrics (TPS, daily tx, TVL) for the L2 were found. status.whitechain.io and the explorer were not checked live.
- The legacy L1 explorer URL changed: `explorer.whitechain.io` now serves L2 history only from block 50961390.

## Stablecoins on Whitechain: official USDT, native/bridged stables, bridges, WhiteBIT deposit/withdraw

### Takeaway
On mainnet, official USDT is not live yet. The Portal docs say "official USD₮" (and ETH) will arrive in later releases, each after its audit. Testnet has a USDT token (bridged from Tron Nile) and USDC.e (from Ethereum). The main stablecoin on-ramp is the Portal, a centralized bridge operated by Whitechain linking Ethereum, Tron and Whitechain. It was slated to open on mainnet on 27 Oct 2026. WhiteBIT also historically issued its own Whitechain stablecoins (WBUSD, WBEURO, WBGEL) with no published reserve attestations.

### Cited Findings
- The Portal is "a centralized bridge operated by Whitechain" and the only Tron↔Whitechain route. A Whitechain backend key signs each transfer, the admin can pause it, and it "trades self-custody for speed". There is no direct Ethereum↔Tron route, so transfers go via Whitechain — [Portal bridge docs](https://docs.whitechain.io/build/bridge/portal-bridge)
- Portal routes:
  - Ethereum↔Whitechain: USDC (arrives as USDC.e), WBT, UAHe, ETH
  - Tron↔Whitechain: USDT, WBT
  - Testnet daily limits: USDC 10k, USDT 10k, WBT 200, UAHe 1M
  - No bridging fee today. For Whitechain→Ethereum, the Portal pays ETH gas and charges the equivalent in WBT at WhiteBIT market rates
  - Timing: about 12 min to confirm on Ethereum, about 1 min on Whitechain

  Source: [Portal bridge docs](https://docs.whitechain.io/build/bridge/portal-bridge)
- Whitechain Sepolia testnet addresses: USDT `0xaa7962d073935D387e8d442DA1D7149C81388f46`, USDC.e `0x5Eb541ba8A2DD841aF7864c3389162a23ddA8401`, WWBT `0x4200000000000000000000000000000000000006`, bridged ETH `0x1c7E0793c69838D1da9D5b98B5893866B977bA67`, Portal Bridge `0x8F4D5bC9379beF9c209C895a1d6e7c26F64fE14F`. Tron Nile USDT is `TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf` — [Portal bridge docs](https://docs.whitechain.io/build/bridge/portal-bridge)
- Mainnet Portal: "slated to open at bridge.whitechain.io on 27 October 2026". Its Whitechain contracts migrated with the legacy state and keep their addresses. "ETH and official USD₮ will arrive in later releases, each after its audit." Mainnet routes and addresses are to be published at launch — [Portal bridge docs](https://docs.whitechain.io/build/bridge/portal-bridge)
- The canonical OP Stack bridge is trustless but has a 7-day minimum withdrawal to Ethereum — [Portal bridge docs](https://docs.whitechain.io/build/bridge/portal-bridge); [Transaction finality](https://docs.whitechain.io/learn/network/transaction-finality.md)
- A search snippet mentions a "USDT.e" token on Whitechain Sepolia, while the Portal page lists it as "USDT", so the naming is inconsistent — [Whitechain docs search result](https://docs.whitechain.io/build/bridge/bridge-e2e-testnet)
- UAHe ("UAH eStable") is described as a tokenized hryvnia backed by Ukrainian government bonds (OVDPs) via the Evidentia protocol, with P2P tooling in a Telegram bot. It can be bridged Ethereum↔Whitechain via the Portal — [WhiteBIT blog: UAHe](https://blog.whitebit.com/en/uahe-a-tokenized-financial-layer/); [Portal docs](https://docs.whitechain.io/build/bridge/portal-bridge). CryptoRank lists a supply of about 20.9M at about $0.023 (snapshot, unverified) — [CryptoRank](https://cryptorank.io/price/uahe)
- WhiteBIT's own fiat-pegged tokens WBUSD, WBEURO (also written WBEUR) and WBGEL (Georgian lari) are described as "developed using the Whitechain protocol". WBGEL is minted on whitebit.ge deposits via PayUnicard. No reserve attestation was found — [WhiteBIT blog: stablecoins](https://blog.whitebit.com/en/whitebit-stablecoins-explained-key-features-and-advantages/); [CoinMarketCap: WhiteBIT reserves unavailable](https://coinmarketcap.com/fil/exchanges/whitebit)
- WhiteBIT deposits and withdrawals: the migration doc only says WBT on WhiteBIT was "handled by the exchange" and that moving WBT in or out is "subject to exchange Terms of Use and compliance checks" — [Migration to L2](https://docs.whitechain.io/learn/general/migration.md). The homepage advertises "one-click" bridge-in from WhiteBIT, swap and staking of WBT — [whitechain.io](https://whitechain.io/)

### Inferences
- Stablecoin liquidity on Whitechain mainnet in Nov 2026 is probably thin: USDT is gated on audit, and USDC arrives only as a bridged USDC.e behind a centralized bridge. For a cross-chain "UPI for stablecoins", Whitechain alone is not yet a deep stablecoin venue. Its edge is distribution (WhiteBIT users), not liquidity.
- The Tron route matters most strategically: USDT-on-Tron is the dominant retail rail in Ukraine, CIS and emerging markets, and the Portal is designed to pull that onto Whitechain.
- A WondrPay build that uses "official USDT" on Whitechain Sepolia is using the testnet Portal-bridged token at `0xaa79…8f46`. Mainnet will need a different, post-audit address.

### Gaps
- I could not confirm whether the mainnet Portal actually opened on 27 Oct 2026, or whether official USDT has launched on mainnet since (no source after late October).
- No direct WhiteBIT-exchange deposit/withdrawal support for USDT/USDC on the Whitechain L2 network was confirmed. WhiteBIT's asset/network pages were not checked.
- Tether's issuance model for Whitechain (native mint or bridged) is unknown. "Official USD₮" implies Tether-recognized, but no Tether announcement was found.

## Whitepay: what it is, who runs it, features, fees, countries, licensing, scale

### Takeaway
Whitepay (whitepay.com) is a Ukrainian-origin crypto payment processor (SaaS) in the WhiteBIT/W Group ecosystem. It offers online acquiring, invoices and top-ups, POS terminals, donations, mass payouts and stablecoin settlement, plus a fee-free "Express payment" path for WhiteBIT app users. Pay-in fees are 0.4–1.5%. It advertises 200+ cryptocurrencies. Whitechain is not mentioned on its site. No legal entity, license or merchant count is published, so the name overlaps directly with the hackathon project's original name, WhitePay.

### Cited Findings
- Products: crypto payments for invoices and top-ups, crypto acquiring, crypto top-up, donation pages/jars/widgets, business wallets (a fixed address for multiple deposits), POS for physical stores, white-label/h2h custom payment forms, mass payouts, conversion and withdrawal, balance swap, "volatility prevention" (locks the rate and converts to stable assets), reporting, and user roles. Settlement is in USDT/USDC or multi-balance accounts. Markets served: "Worldwide" — [whitepay.com](https://whitepay.com/)
- Fees: pay-in 0.4%–1.5% depending on monthly volume. Settlement, crypto payouts, conversion/withdrawal and mass payouts are listed at 0%, with custom pricing via sales — [whitepay.com](https://whitepay.com/). The POS page states a fixed 1% fee — [Whitepay POS](https://whitepay.com/product/pos)
- It locks the rate at checkout, converts to USDT/USDC instantly, claims access to "450 million crypto-owners" and offers next-day payouts (marketing claims) — [Whitepay news](https://whitepay.com/news/accept-crypto-payments-with-fast-and-secure-crypto-payment-gateway-or-whitepay)
- Relationship to WhiteBIT: "Powered by WhiteBIT, a licensed European exchange", and part of the WhiteBIT ecosystem — [Adobe Commerce listing](https://commercemarketplace.adobe.com/whitepay-magento-payment-getaway.html); WhiteBIT's help center has a "What is Whitepay" article on acquiring forms, custom integrations and 200+ cryptos — [WhiteBIT help](https://help.whitebit.com/hc/en-gb/articles/25649783537565-What-is-Whitepay) (search snippet; the page did not load)
- Express payments: customers can pay from the WhiteBIT app with "no transfer fees, regardless of the chosen asset" or from any wallet — [Whitepay: Express payments via WhiteBIT](https://whitepay.com/news/express-payments-via-whitepay-and-whitebit-how-does-it-work)
- Integrations:
  - Magento 2 extension (claims 140+ cryptos) — [Adobe Commerce](https://commercemarketplace.adobe.com/whitepay-magento-payment-getaway.html)
  - WooCommerce plugin, flagged "possibly abandoned" (last update about 545 days earlier) — [WordPress.org](https://wordpress.org/plugins/?p=167397); [pluginsdb](https://pluginsdb.com/plugins/whitepay-for-woocommerce)
  - Corefy orchestration connector (200+ cryptos plus selected fiat) — [Corefy](https://corefy.com/connectors/whitepay/)
  - NIC.ua (Ukrainian registrar) integration — [nic.ua](https://nic.ua/en/news/integraciya)
- Origin and markets: described as "a SaaS company from Ukraine providing cryptocurrency solutions for business and charity" — [WordPress plugin](https://cy.wordpress.org/plugins/whitepay-for-woocommerce/). Sep 2023: Ukrainian tech retailers Stylus and Tehnoezh accepted 130+ cryptos via Whitepay POS. The EU expansion added EUR payouts to bank accounts — [Coin360, 12 Sep 2023](https://coin360.com/news/whitepay-brings-crypto-payments-to-ukrainian-tech-stores). Jul 2023: expanded to Poland and Turkey with PLN/TRY invoicing and a 120-second POS rate lock — [Whitepay news, 21 Jul 2023](https://whitepay.com/news/whitepay-reaches-new-markets-now-in-poland-and-turkey)
- Separate WhiteBIT developer Payments API: deposit addresses (persistent or per end user) with webhook reconciliation. This is distinct from the Whitepay merchant product — [WhiteBIT docs: payments overview](https://docs.whitebit.com/guides/payments-overview.md)
- No Whitepay licensing info, legal entity or merchant/volume numbers appear on its site — [whitepay.com](https://whitepay.com/). A search of VASP-register commentary found nothing tying Whitepay to a specific license — (negative search result; see Gaps)

### Inferences
- Whitepay is a custodial, exchange-backed processor (like BitPay or CoinsPaid). It is not an on-chain, self-custody or Whitechain-native product. Its moat is WhiteBIT app users paying with no fee and auto-conversion to stablecoins.
- Name and brand risk: an active W Group product called "Whitepay" exists on whitepay.com in the same ecosystem the hackathon targets (Whitechain). The rename from WhitePay to WondrPay is well justified.
- Whitepay's own news is dated 2023–2025. There is no visible 2026 product news, and the WooCommerce plugin is stale, which may mean slowing investment or a shift toward Whitechain/WhiteBIT-native rails.

### Gaps
- The operating legal entity, jurisdictions and licenses (EU VASP/CASP, Ukraine) are unverified. `acquiring.whitepay.com` did not resolve.
- No merchant count, TPV or supported-network list (whether Whitechain or Tron is used for settlement) was found.
- No evidence was found that Whitepay settles on Whitechain or plans to.

## Other W Group payment products (WhiteBIT Pay, cards, Whitewallet, WB Network/Soul, Ukraine payments) and links to Whitechain

### Takeaway
Payment products: the WhiteBIT Nova Visa debit card (EU, issued by Wallester, Dec 2024), WhiteBIT's in-app "Express" payments to Whitepay merchants, Whitewallet (non-custodial multichain wallet that supports Whitechain), and WB Soul (KYC-backed, soulbound on-chain identity on Whitechain) with SoulDrop rewards. Only Whitewallet, WB Soul/SoulDrop and the WB stablecoins touch Whitechain directly. The card and Whitepay are exchange-custodial rails.

### Cited Findings
- WhiteBIT Nova:
  - Visa debit card launched Dec 2024, issued by Wallester AS, for EU residents
  - No service fee, up to 10% cashback (paid partly in WBT)
  - Spends USDC, BTC, ETH, SOL, XRP and others with auto-conversion at point of sale; supports Apple Pay and Google Pay

  Sources: [Finextra](https://finextra.com/pressarticle/103579/whitebit-launches-visa-debit-card-for-crypto-payments); [PYMNTS](https://www.pymnts.com/partnerships/2024/visa-teams-with-whitebit-offer-crypto-focused-debit-card/); [Invezz](https://invezz.com/news/2024/12/11/whitebit-launches-nova-card-a-crypto-debit-card-with-10-cashback/). In May 2026 WhiteBIT added a Svitolina-branded Nova card skin with a donation mechanism — [Rubryka](https://rubryka.com/en/?p=855217)
- Whitewallet: non-custodial wallet supporting Solana, TON, TRON and EVM chains including Ethereum, Whitechain, BNB, Arbitrum, Optimism, Base, Linea and Monad, with cross-chain swaps and cloud backup — [WhiteBIT blog: Whitewallet](https://blog.whitebit.com/en/whitewallet/); [Avalanche integrations](https://build.avax.network/integrations/whitewallet)
- WB Soul: an on-chain identity on Whitechain that any KYC'd WhiteBIT user can create, with no personal data put on chain. It uses soulbound tokens and can link up to 4 secondary addresses — [WhiteBIT help: WB Soul ecosystem](https://help.whitebit.com/hc/en-gb/articles/11905736649885); [WB Soul docs](https://docs.whitechain.io/wb-soul/wb-soul-ecosystem/wb-soul-explained). "WB Network" was Whitechain's earlier name (whitebit.network) — [whitebit.network/soul](https://whitebit.network/soul/features)
- SoulDrop: reward distribution tied to WB Network commissions and hold amounts. Rewards are claimed on-chain with a small WBT gas balance — [WhiteBIT blog: SoulDrop explained](https://blog.whitebit.com/en/?p=59752). The current homepage says SoulDrop rewards are driven by on-chain activity — [whitechain.io](https://whitechain.io/)
- Whitechain partners listed on the homepage: Safe, WhiteBIT, W Group, hashbank. Products listed: Explorer, Bridge, WBT, Whitewallet, WB Soul, Builders Program, SoulDrop. Roadmap: "Unified distribution platform spanning WhiteBIT and W Group" (upcoming) and 2027+ tracks for "institutional and B2B rails" and "RWA tokenization" — [whitechain.io](https://whitechain.io/)
- Ukraine-related stablecoins: UAHe can be bridged to Whitechain via the Portal — [Portal docs](https://docs.whitechain.io/build/bridge/portal-bridge). WhiteBIT also listed UAHg, a separate hryvnia stablecoin from Emittance, with a 300k UAHg bounty — [ForkLog](https://forklog.com/en/creators-of-first-hryvnia-pegged-stablecoin-to-run-300000-uahg-bounty-on-whitebit/amp)
- WhiteBIT Payments API for platforms (deposit addresses and webhooks) — [WhiteBIT docs](https://docs.whitebit.com/guides/payments-overview.md)

### Inferences
- W Group's payment stack is CEX-centric: card, Whitepay and the app all settle on WhiteBIT's ledger. Whitechain is positioned as the on-chain "distribution layer" (identity, rewards, DeFi), not yet as the payments settlement rail. That leaves a gap a self-custodial, on-chain stablecoin payments app on Whitechain could fill, especially combining WB Soul-style KYC'd identity, UAHe/USDT and the Tron→Whitechain Portal.
- Whitechain's partner list includes Safe, which suggests smart accounts are possible. No paymaster or 4337 bundler is documented.

### Gaps
- No product called "WhiteBIT Pay" was found. Searches surfaced only Whitepay and in-app Express payments.
- No evidence was found for Kyiv metro or other Ukrainian transit payments via W Group products (searched; nothing relevant).
- The current Nova card availability (UK, Ukraine) and any stablecoin-specific card features in 2026 were not verified.

## User numbers, mainnet status as of Nov 2026, notable integrations

### Takeaway
W Group claims 40M+ users and WhiteBIT 10M+ (Aug 2026, up from about 35M and 8M in Nov 2025). Whitechain L2 mainnet (chain 1875) has been live since 26 Oct 2026 per the docs. The broader "public mainnet launch" with genesis dApps and the official USDT/ETH bridge assets is still listed as upcoming in Q4 2026.

### Cited Findings
- Nov 2025 press release: W Group about 35M users, WhiteBIT about 8M; W Group was introduced as a "global fintech" group on WhiteBIT's 7th anniversary. The Ukrainian coverage headline cites a $38.9B capitalization (company claim) — [The Block press release](https://www.theblock.co/press-releases/379628/whitebit-marks-7-years-of-growth-introduces-w-group-as-a-global-fintech-powerhouse); [ITC.ua](https://itc.ua/articles/whitebit-otmechaet-7-let-y-predstavlyaet-w-group-globalnuyu-fynteh-ekosystemu-s-kapytalyzatsyej-38-9-mlrd/)
- Aug 2026: W Group 40M+ users, WhiteBIT 10M+ — [Incrypted](https://incrypted.com/whitechain-obyavila-o-perezapuske-kak-l2-set-na-baze-op-stack/); repeated on [whitechain.io](https://whitechain.io/)
- Mainnet status: "L2 Mainnet is live, serving chain ID 1875"; legacy L1 is read-only — [Migration to L2](https://docs.whitechain.io/learn/general/migration.md); [Network reference](https://docs.whitechain.io/learn/network/reference). A search snippet of an earlier version of the reference page showed mainnet as "Coming soon / TBD", so it was updated around the migration — [search result for Network reference](https://docs.whitechain.io/learn/network/reference)
- Builders Program: up to $300k per project in milestone tranches. There are also Strategic Ecosystem Deals (migration and liquidity help for protocols with TVL) and Chain Expansion Support (no exclusivity) — [Incrypted](https://incrypted.com/whitechain-obyavila-o-perezapuske-kak-l2-set-na-baze-op-stack/)
- AI-native developer tooling (llms.txt, Claude Code "Agent Skills") is listed as shipped in Q3 2026 — [whitechain.io](https://whitechain.io/); [docs llms.txt](https://docs.whitechain.io/llms.txt)
- Integrations and tooling: viem chain definition ([jsDelivr](https://cdn.jsdelivr.net/npm/viem@2.48.8/chains/definitions/whitechain.ts)); Reown AppKit, Hardhat, Foundry and Remix guides; Blockscout explorer ([docs llms.txt](https://docs.whitechain.io/llms.txt)); Safe listed as a partner ([whitechain.io](https://whitechain.io/)). Whitechain also appeared in an ethereum-optimism docs PR, possibly a Superchain/OP registry listing (unverified) — [GitHub PR](https://github.com/ethereum-optimism/docs/pull/1693/files)
- Regulatory and context:
  - Jan 2026: Russia designated WhiteBIT and W Group "undesirable organizations" — [MEXC news](https://www.mexc.com/news/562774)
  - 20 May 2026: WhiteBIT launched a UK platform (whitebit.uk) with GBP trading — [Bitcoin.com News](https://news.bitcoin.com/whitebit-brings-gbp-trading-to-uk-users-with-dedicated-exchange/)
  - 18 Jun 2026: Austria's FMA authorized WB-Shield Innovations GmbH under MiCAR — [yespress.io summary](https://yespress.io/whitebit.md) (secondary source; verify on the ESMA/FMA register)
  - FC Barcelona partnership reportedly extended to 2030 — [yespress.io](https://yespress.io/whitebit.md)

### Inferences
- The user numbers are company claims, not audited, and "W Group users" probably aggregates several products (exchange, Whitepay, card, other ventures). Whitechain's own on-chain user base is much smaller: the L2 genesis carried 166,812 accounts.
- A MiCA CASP authorization (via an Austrian entity) would make EU stablecoin payment flows through WhiteBIT more viable from mid-2026, if it is confirmed.

### Gaps
- No independent on-chain metrics for the L2 in its first two weeks (tx/day, active addresses, stablecoin supply).
- No confirmation that the mainnet Portal or any genesis dApps (DEX, oracle) went live on schedule.

## Unique features vs other chains, and gaps

### Takeaway
Whitechain's differentiator is distribution: a direct pipe to 10M+ WhiteBIT and 40M+ W Group users, KYC-backed WB Soul identity, SoulDrop incentives, a WBT gas token with a deep CEX market, and the only Tron↔EVM-L2 USDT route run by an exchange. On payments it has weaknesses: a centralized sequencer and bridge, WBT-only gas with no native paymaster, no live official USDT on mainnet yet, thin DeFi and stablecoin liquidity, and heavy reliance on one company's ecosystem.

### Cited Findings
- Positioning is "distribution-focused", helping projects attract and retain users rather than competing on performance or fees — [Incrypted](https://incrypted.com/whitechain-obyavila-o-perezapuske-kak-l2-set-na-baze-op-stack/)
- Unique pieces: WB Soul KYC-backed identity ([WhiteBIT help](https://help.whitebit.com/hc/en-gb/articles/11905736649885)); SoulDrop on-chain-activity rewards ([whitechain.io](https://whitechain.io/)); the Portal Tron↔Whitechain USDT route, with WhiteBIT market-rate pricing of gas ([Portal docs](https://docs.whitechain.io/build/bridge/portal-bridge)); UAHe hryvnia token route ([Portal docs](https://docs.whitechain.io/build/bridge/portal-bridge)); about 1s blocks and sub-cent fees ([Network fees](https://docs.whitechain.io/learn/network/network-fees.md))
- Trust and centralization limits:
  - Single designated sequencer that can reorder or drop soft-confirmed txs ([Transaction finality](https://docs.whitechain.io/learn/network/transaction-finality.md))
  - Portal is admin-pausable with a backend signing key ([Portal docs](https://docs.whitechain.io/build/bridge/portal-bridge))
  - 7-day canonical withdrawal ([Portal docs](https://docs.whitechain.io/build/bridge/portal-bridge))
  - Legacy L1 had a single WhiteBIT validator ([Medium](https://medium.com/@FutureValue/deep-dive-in-whitebit-coin-wbt-d2235f4ecfbc))
- Payment UX and asset limits:
  - Gas only in WBT, and no gasless or paymaster feature is documented ([Network fees](https://docs.whitechain.io/learn/network/network-fees.md))
  - Official USDT and ETH are pending audit on mainnet ([Portal docs](https://docs.whitechain.io/build/bridge/portal-bridge))
  - No reserve attestations for WB stablecoins ([CoinMarketCap](https://coinmarketcap.com/fil/exchanges/whitebit))
- Tooling gotcha: Karst gas cap and opcode differences between Sepolia and mainnet ([Network reference](https://docs.whitechain.io/learn/network/reference)); `eth_chainId` is the same on legacy L1 and L2 ([Migration](https://docs.whitechain.io/learn/general/migration.md))

### Inferences
- Compared with stablecoin-first chains (Plasma, Tempo, Arc, Stable), which offer gasless USDT, stablecoin gas or native stablecoin issuance, Whitechain is a general-purpose OP L2 with an exchange attached. Its payments case rests on distribution and on-ramps (WhiteBIT and Tron USDT), not on payment-specific protocol features.
- For WondrPay or a universal "UPI for stablecoins" app, Whitechain is useful as a high-distribution corridor (WhiteBIT users, Ukraine/CEE, hryvnia via UAHe, Tron USDT inflows). The app has to supply gas abstraction itself (relayer, permit/EIP-3009, or Safe/4337) and must not rely on Whitechain for deep stablecoin liquidity yet.
- Whitepay (custodial gateway) and the WondrPay concept (on-chain, self-custodial, receipts and refunds on Whitechain) are complementary rather than identical. The name collision is the main overlap.

### Gaps
- No independent security audits of the L2 deployment or the Portal mainnet contracts were found. The audit status of "official USD₮" is unstated.
- Whether OP fault proofs are permissionless on Whitechain, and whether it is in the Superchain, is unconfirmed.
- No head-to-head fee or latency benchmarks against other L2s were found.
