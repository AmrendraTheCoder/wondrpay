# Established stablecoin payment ecosystems: Celo/MiniPay, Base, Solana, Tron (as of Nov 2026)

Scope note: this research ran on 2026-11-09. Several primary docs could not be fetched (docs.solanapay.com DNS failure, Solana Pay SPEC.md 404, docs.base.org Base Account guide now redirects to Coinbase Developer Platform). Many 2026 numbers come from secondary crypto media (Cryptobriefing, KuCoin flash news, Cointelegraph) that cite TRONSCAN, Artemis, CryptoQuant or Grayscale. Treat them as indicative, not audited. Items marked [LIVE], [ANNOUNCED] or [UNVERIFIED] as appropriate.

## Speed, fees and gas model (fee abstraction)

### Takeaway
All four now settle a stablecoin transfer in roughly 1 second or less. They differ most on who pays gas and in what token. Celo has native protocol-level "pay gas in USDT/USDC". Base relies on ERC-4337 paymasters (sponsor or pay-in-USDC). Solana has a native "fee payer" field so an app can pay. Tron is the outlier: by far the most expensive per transfer (~$2-4.50 burned, or a ~1.5 USDT GasFree fee) despite dominating volume.

### Cited Findings
**Celo (Ethereum L2 since 2025)**
- Celo completed its transition to an Ethereum Layer 2 with sub-cent transaction fees promised — [Yellow](https://yellow.com/news/celo-completes-transition-to-ethereum-layer-2-promises-sub-cent-transaction-fees)
- Celo L2 block time is 1s (vs 2s on Optimism) — [Celo docs (legacy/transition)](https://docs.celo.org/legacy/transition/optimism/op-l2.md)
- Fee abstraction: users can pay gas in governance-approved ERC-20s such as USDC, USDT and Mento stablecoins [LIVE] — [Celo docs: fee currency](https://docs.celo.org/developer/fee-currency); [Celo spec: fee abstraction](https://docs.celo.org/specs/fee-abstraction)
- CIP-64 is the transaction type that lets approved ERC-20 tokens act as gas currencies (July 2026 report) — [Cryptonomist](https://en.cryptonomist.ch/2026/07/30/tether-usat-celo-launch/)
- Forum proposal to raise USDT intrinsic gas for fee abstraction from 50,000 to 85,000. The author's worked example (25 gwei base-fee floor, CELO at $0.08) implies about $0.00007 of extra cost per USDT tx. Adoption status unknown — [Celo forum](https://forum.celo.org/t/update-intrinsic-gas-configuration-for-fee-abstraction/13014)
- Average gas fee of about $0.0005 [UNVERIFIED, third-party snapshot] — [Plisio](https://plisio.net/crypto/what-is-celo-blockchain)

**Base (Coinbase OP Stack L2)**
- Flashblocks deliver partial block updates (preconfirmations) every 200ms on Base [LIVE] — [QuickNode docs](https://www.quicknode.com/docs/base/flashblocks/overview); the testnet launch was in Feb 2025 — [The Block](https://www.theblock.co/post/343908/base-cuts-block-times-to-0-2-seconds-on-testnet-with-flashblocks-mainnet-rollout-expected-in-q2)
- Coinbase CDP Paymaster supports two models: (a) the developer sponsors all gas; (b) the user pays gas in USDC through an ERC-20 paymaster — [CDP docs](https://docs.cdp.coinbase.com/paymaster/guides/erc20-gas-payments); [Base docs: ERC20 paymasters](https://docs.base.org/smart-wallet/guides/erc20-paymasters)
- Base Gasless Campaign: up to $15k in gas credits for apps — [Base docs](https://docs.base.org/smart-wallet/guides/erc20-paymasters)
- USDC transfer on Base about $0.00089 in one benchmark; a third-party guide says $0.01-0.05 at typical congestion [UNVERIFIED, third-party]. Paymaster markups are 5-10% of gas; Coinbase charges 7% (Base only) [UNVERIFIED] — [Eco](https://eco.com/support/en/articles/15254045-gas-sponsorship-2026-how-apps-sponsor-user-fees); [Stablecoin Insider](https://stablecoininsider.org/best-paymaster-providers-gas-in-usdc.md)

**Solana**
- Slot time was cut to a 200ms target on Oct 9, 2026. Alpenglow's Votor consensus went live on mainnet Oct 21, 2026 (slot 459,653,000), replacing TowerBFT. It targets about 150ms finality, versus about 12.8s under TowerBFT. 150ms is a consensus target, not a measured end-to-end landing time. Rotor (the Turbine replacement) is not yet deployed — [RPCFast](https://rpcfast.com/blog/alpenglow-solana-150ms-finality-explained). Earlier coverage had pointed to a Q3 2026 launch — [Börse Express](https://www.boerse-express.com/news/articles/solana-alpenglow-fuer-q3-2026-geplant-897109)
- No user-facing fee changes from Votor. Priority-fee rules are unchanged; validators now pay a 0.8 SOL/epoch admission ticket instead of vote-tx fees. The recent-blockhash lifetime fell from ~60s to ~30s, which matters for QR or offline signing flows — [RPCFast](https://rpcfast.com/blog/alpenglow-solana-150ms-finality-explained)
- Base fee is 5,000 lamports (0.000005 SOL) per signature, paid in SOL — [Plisio](https://plisio.net/crypto/solana-payment-gateway) (secondary)
- Gasless USDC via Kora signing [UNVERIFIED, low-quality blog only] — [dellaresorts guide](https://guide.dellaresorts.com/best-payment-solutions-solana.html)

**Tron**
- Energy unit price was cut from 210 to 100 sun via SR governance and went live around Aug 29, 2025. Sources disagree on the proposal number (#789 vs #104). The parameter cut is about 52%; headlines say "60%" based on average fees — [Cointelegraph](https://cointelegraph.com/news/tron-gas-fee-reduction-cuts-daily-revenue-10-days); [Unchained](https://unchainedcrypto.com/tron-slashes-network-fees-by-60/); [CoinMarketCap](https://coinmarketcap.com/academy/article/tron-fee-cut-proposal-gains-strong-support-before-friday-vote)
- After the cut, daily SR fee revenue fell from $13.9M (Aug 28) to $5M (Sept 7) — [Cointelegraph](https://cointelegraph.com/news/tron-gas-fee-reduction-cuts-daily-revenue-10-days)
- The cost of sending to an empty USDT wallet fell from 27.25 TRX to 13.4 TRX — [Coincub](https://coincub.com/blog/tron-halves-network-fees-what-the-record-breaking-cut-means-for-users-and-the-ecosystem/)
- A USDT transfer uses about 65,000 energy (to an existing holder) plus about 345 bandwidth. Burn cost is about 6.5 TRX to an existing holder or about 13 TRX to a fresh address, roughly $2-4.50 (Oct 2026). Staking or renting energy can cut this to near zero — [CoinsDo](https://web.coinsdo.com/en/blog/trc20-fees-explained-energy-bandwidth-usdt-costs); [Dwellir](https://www.dwellir.com/blog/tron-energy-usdt-transfers); [Eco](https://eco.com/support/en/articles/15197974-usdt-trc-20-fees-2026-per-transfer-cost-on-every-exchange)
- GasFree lets users send TRC-20 USDT without holding TRX; the fee is deducted in USDT. It supports USDT-TRC20 only — [Klever support](https://support.klever.org/hc/en-us/articles/38548067522836-How-to-Send-USDT-Without-TRX-Using-Klever-Wallet-s-GasFree-Feature); [Symbiosis](https://symbiosis.finance/blog/tron-gas-free-explained-how-usdt-pays-fees-(no-trx-required))
- GasFree activation and transfer fees were unified at 1.5 USDT effective May 9, 2026 — [ChainCatcher](https://www.chaincatcher.com/en/article/2266593). Klever's guide says about 1 USDT activation plus about 1 USDT per tx; an older report says 10 USDT. One report puts the median GasFree fee near $1.50 — [altFINS](https://altfins.com/crypto-news/crypto-news-summary/388947)
- Gasless USDT transfers reached a record of about $3B (weekly, per KuCoin headline), up from about $1.5B earlier in 2026, per CryptoQuant — [KuCoin](https://www.kucoin.com/pt/news/flash/tron-gasless-usdt-transfers-reach-nearly-3b-weekly); [CryptoQuant research PDF](https://bucket.cryptoquant.com/applied-research/6a5ed4632cc8ea28f79e1b95/TRON_Research_Beyond_P2P.pdf)

### Inferences
- Per-transfer cost ranking: Solana ≈ Celo ≈ Base (all sub-cent) << Tron ($1.50-4.50). Tron's dominance is therefore driven by liquidity, exchange support and network effects, not price. A "UPI for stablecoins" app can win Tron-heavy users on cost alone if it offers cheap off-Tron routes.
- Only Celo offers stablecoin gas at the protocol level, with no extra contract or bundler. On Base, the same UX needs a smart account plus a paymaster. On Solana, an app-run fee payer achieves it but the app eats SOL. On Tron, GasFree is a relayer service with a flat fee that is high relative to small payments.
- The 30s blockhash expiry on Solana post-Oct 2026 shortens the window for slow scan-and-approve QR flows; durable nonces may matter more.

### Gaps
- No official Celo or Base fee dashboard was fetched; the cited fee figures are third-party.
- No measured (p50/p95) Alpenglow finality yet; only the target.
- No official gasfree.io fee schedule was fetched; fee figures conflict.
- Base hard finality (L1 settlement / fault-proof window) was not researched this session.

## Naming/addressing, QR standards and payment links

### Takeaway
MiniPay is the only one with phone-number-first addressing at scale. Base has Basenames (ENS subnames on Base) and Coinbase Payment Links. Solana has the most mature open QR/URI spec (Solana Pay transfer and transaction requests). Tron has no native naming or QR standard of note; it relies on raw T-addresses and exchange/wallet QR conventions.

### Cited Findings
- MiniPay lets users send, swap, hold and spend USD stablecoins on Celo using only a phone number. Account setup uses phone-number authentication plus Google/iCloud backup — [Apple App Store listing](https://apps.apple.com/us/app/-/id6504087257); [Opera MiniPay page](https://www.opera.com:443/id/products/minipay)
- Phone-number mapping was the basis of early P2P sends (no further detail given) — [Celo forum, MiniPay Q1 2026 update](https://forum.celo.org/t/minipay-update-q1-2026/13273)
- Base Pay offers one-tap USDC payments through the `pay()` helper in the Base Account SDK. Docs say to verify payment status on the backend, not the frontend — [Base docs: accept payments](https://docs.base.org/base-account/guides/accept-payments.md). As of Nov 2026 the Base Account SDK docs have moved to Coinbase Developer Platform and been renamed "Coinbase Wallet SDK" — [docs.base.org redirect notice](https://docs.base.org/base-account/guides/accept-payments)
- "Prolinks" are shareable payment links for off-app flows — [Base docs: building with Base Account](https://docs.base.org/ai-agents/skills/base-account/building-with-base-account)
- Coinbase Business payment links let a merchant request a fixed USDC amount, payable from MetaMask, Phantom or the Base app. A Payment Links API was described as upcoming [ANNOUNCED, launch unconfirmed] — [Brave New Coin](https://bravenewcoin.com/insights/coinbase-launches-new-business-payment-tools-for-instant-global-transactions)
- Base Pay in person uses Mini App Payments and QR codes; online uses Payment Links (via Flexa) — [Flexa newsroom](https://flexa.co/newsroom/base-pay)
- Solana Pay is an open set of payment standards (launched 2022 by Solana Labs) for direct USDC settlement at POS and online — [The Block](https://www.theblock.co/amp/post/132644/solana-pay-launch-payments-protocol-digital-commerce); supported wallets include Phantom, Solflare, Glow, Decaf, Espresso Cash and Tiplink — [QuickNode builders guide](https://www.quicknode.com/builders-guide/tools/solana-pay-by-solana-labs)

### Inferences
- For a "UPI" analogue, MiniPay's phone-as-address is the closest to UPI VPA/mobile-number UX, but it is wallet-specific, not a cross-chain registry.
- Solana Pay's two-mode design is the strongest reference model for a universal QR spec. A static "transfer request" covers the UPI static-QR case; an interactive "transaction request", where the wallet POSTs its account to a merchant URL and receives a transaction to sign, covers dynamic QR and merchant-composed transactions such as fee payer, loyalty or splits.

### Gaps
- Could not fetch the Solana Pay spec (docs.solanapay.com DNS failure; GitHub SPEC.md 404). Background knowledge, not verified this session: the transfer request is `solana:<recipient>?amount=&spl-token=&reference=&label=&message=&memo=`; a transaction request is `solana:<https-url>` with GET (label/icon) then POST `{account}` returning a base64 transaction; `reference` public keys are added to the tx so the merchant can find it via `getSignaturesForAddress`. Verify against the live spec.
- No 2026 data was found on Basenames registrations or on Basenames being resolved inside Base Pay.
- No data was found on SNS (.sol) integration in Solana Pay checkout.
- No confirmation that MiniPay uses Celo SocialConnect (ODIS) for phone lookup; it is likely but unverified.
- No Tron-native naming or QR standard was researched.

## Merchant tooling, ramps and cash-out

### Takeaway
Base/Coinbase has the deepest merchant stack: Base Pay, Coinbase Business and Payments, Shopify USDC via Stripe/Coinbase, and Flexa for in-person. Actual Shopify USDC volume looks tiny, though. Solana Pay has a Shopify plugin and Helio. MiniPay's edge is cash-out (15+ ramp partners covering M-Pesa, MoMo, PIX and GCash) plus a Visa card. Tron's merchant tooling is mostly third-party gateways and OTC/exchange rails.

### Cited Findings
**Celo/MiniPay**
- MiniPay has 15+ crypto<>fiat partners covering Apple Pay, cards, bank transfers, M-PESA, MoMo, PIX, GCash and more. Some offer zero-fee deposits and withdrawals — [MiniPay blog](https://www.minipay.to/blog/minipay-2-years-stablecoins-everyday-payments)
- Named ramp partners: Fonbnk, Partna, Cashramp, Yellowcard; Noah powers Pix (Brazil), M-Pesa (Kenya) and bank transfer (Nigeria) inside the wallet — [Finextra](https://www.finextra.com/newsarticle/46239/minipay-and-noah-debut-global-to-local-stablecoin-payments); Onramper partnership — [The Paypers](https://thepaypers.com/crypto-web3-and-cbdc/news/onramper-partners-with-operas-minipay-to-expand-global-access-to-stablecoins)
- Fonbnk "Instant Pay": pay any merchant with USDT, with M-Pesa delivery in under 5s [vendor claim] — [MiniPay blog](https://minipay.to/blog/instant-pay-by-fonbnk-pay-any-merchant-with-usdt)
- MiniPay Visa debit card (powered by Gnosis Pay) launched June 23, 2026 for eligible users in selected EEA, African, LatAm and SE Asian markets. Headlines cite 175M+ merchants in 46 countries [LIVE] — [Cointelegraph](https://cointelegraph.com/news/operas-minipay-launches-visa-debit-card-for-stablecoin-spending); [Gnosis](https://www.gnosis.io/blog/minipay-launches-visa-card-powered-by-gnosis-pay); [Rallies](https://rallies.ai/news/operas-minipay-launches-visa-debit-card-for-175m-merchants-in-46-countries)
- Roadmap as of Q1 2026 [ANNOUNCED]: virtual USD/EUR accounts, cross-chain deposits, zero-fee ramps across 40+ local currencies, "Pay with MiniPay", and USAT in MiniPay. Live: USDT, XAU₮0 (Tether Gold), 50+ Mini Apps, and a $1M builder incentive. The Celo community approved 160M CELO to Opera for MiniPay — [Celo forum Q1 2026](https://forum.celo.org/t/minipay-update-q1-2026/13273)
- Tether and Opera expanded MiniPay access in emerging markets — [Tether](https://tether.io/news/tether-and-opera-expand-financial-access-in-emerging-markets-through-minipay/); USAT launched on Celo (July 2026) — [Cryptonomist](https://en.cryptonomist.ch/2026/07/30/tether-usat-celo-launch/)

**Base/Coinbase**
- Flexa made Base Pay a default checkout option for all its merchants (online, in person, mini apps) in Oct 2025 — [Flexa](https://flexa.co/newsroom/base-pay); [BusinessWire](https://www.businesswire.com/news/home/20251016081089/en)
- Rewards: up to 4.1% APY for holding USDC when paying via Base Pay mini-app payments; Coinbase planned 1% USDC cashback on Base Pay purchases in the US [ANNOUNCED 2025; current rate unverified] — [Flexa](https://flexa.co/newsroom/base-pay)
- Shopify enabled USDC on Base via Coinbase and Stripe (announced June 2025). Merchants get local-fiat payout by default unless they opt to keep USDC — [PYMNTS](https://www.pymnts.com/?p=2739982); [Benzinga](https://benzinga.com/crypto/cryptocurrency/25/06/45921146/shopify-teams-up-with-coinbase-stripe-to-roll-out-usdc-stablecoin-payments-for-merchants)
- The Coinbase/Shopify "Payments Protocol" processed only about $1.2M USDC since June, per growthepie (Feb 2026 headline; article not opened) [UNVERIFIED] — [Pulse](https://www.pulse.bot/crypto/news/payments-protocol-by-coinbase-shopify-processes-just-12m-usdc-since-june-growthepie-61c89980-5b85-479e-bacd-2e933928812b/)
- Coinbase Payments bundles KYC, custody, fiat rails and stablecoin APIs into one regulated product — [Spark research](https://www.spark.money/research/ethereum-base-chain-stablecoin-dominance) (secondary); Coinbase stablecoin payments stack launch — [Seeking Alpha](https://seekingalpha.com/news/4459617-coinbase-introduces-stablecoins-payment-stack)
- WalletConnect Pay also supports accepting payments on Base — [WalletConnect blog](https://walletconnect.com/blog/accepting-crypto-payments-on-base-with-walletconnect-pay)

**Solana**
- Shopify Solana Pay plugin launched Aug 2023 for USDC — [The Block](https://www.theblock.co/amp/post/246974/solana-pay-integrates-with-shopify-for-digital-dollar-currency-payments); [Decrypt](https://decrypt.co/153514/shopify-adds-solana-pay-to-its-platform-to-allow-usdc-payments)
- The Helio-built Solana Pay Shopify plugin (2024) settles in USDC, EURC, PYUSD and USDY. Claim: 200+ Shopify stores, $50M processed, $1M+ fees saved [UNVERIFIED vendor claim] — [Benzinga](https://benzinga.com/markets/cryptocurrency/24/06/39315050/shopify-merchants-can-now-embrace-crypto-payments-with-helio-integration)
- Merchant commerce docs exist at commercedocs.solanapay.com — [Solana Pay Commerce docs](https://commercedocs.solanapay.com/)
- Mastercard selected eight blockchains, Solana included, for a global stablecoin payments network (June 3, 2026) — [Cryptobriefing](https://cryptobriefing.com/solana-5-trillion-stablecoin-volume-2026/)

### Inferences
- The Base/Shopify experience shows that distribution (Shopify checkout) did not translate into consumer USDC spend. Consumer wallet balance plus local cash-out (the MiniPay model) appears to be the binding constraint, not merchant acceptance.
- MiniPay's ramp breadth (M-Pesa, MoMo, PIX, GCash) is the closest thing to a "UPI cash-out mesh" among the four.

### Gaps
- No 2026 Solana Pay merchant count or volume found.
- No 2026 Base Pay transaction or merchant count found.
- Tron merchant tooling (e.g. third-party gateways, Tron-specific POS) not researched in depth; no primary source found.

## Scale as of 2026

### Takeaway
Tron is the USDT settlement giant: about $94B USDT supply, about $24B/day transfers, about 73% of stablecoin transfer volume in Q3 2026. Base leads EVM stablecoin volume, though much of it is likely bot/DeFi. Solana has about $17.5B in stablecoins with outsized transfer share. MiniPay has the largest consumer-wallet footprint in emerging markets (16M+ activations) but small dollar volume (~$150M/month).

### Cited Findings
- **MiniPay:** 16M+ wallet activations, 470M+ transactions, 400M+ Mini App txs, 66+ countries, 50+ Mini Apps. Dec 2025: $96M+ USDT transfers, $153M+ total monthly volume, 3.5M P2P payments. Celo-wide: 700k+ DAU and 3M+ weekly active USDT users — [Celo forum Q1 2026](https://forum.celo.org/t/minipay-update-q1-2026/13273)
- MiniPay trajectory: 7M → 8M (Jul 2025) → 10M (2nd anniversary, ~Sept 2025, 270M txs) → 13M (end 2025) → 15M (Q1 2026 report, May 2026) → 16M (June 2026). Some outlets say "active", but the official term is "activated" — [Opera press](https://press.opera.com/2025/07/17/minipay-surpasses-8-million-wallets/); [FF News](https://ffnews.com/newsarticle/cryptocurrency/minipay-turns-two-with-10-million-wallets-and-270-million-transactions-pointing-to-stablecoins-leading-web3/); [TechCabal](https://techcabal.com/2026/05/08/opera-backed-minipay-crosses-15-million-wallets/); [Cointelegraph](https://cointelegraph.com/news/operas-minipay-launches-visa-debit-card-for-stablecoin-spending)
- **Base:** Coinbase's Lovett cited about $19T in stablecoin volume on Base in 2026 so far (mid-year), triple 2025. A Binance Square post claims $26.1T over the first seven months [UNVERIFIED]. Base handled 62% of global onchain stablecoin volume in Q1 2026 (about $15T) — [Spark research](https://www.spark.money/research/ethereum-base-chain-stablecoin-dominance); [Binance Square](https://www.binance.com/de/square/post/352122377627474); [Brainsum mirror](https://san-1510.aid.brainsum.com/news/top-news/base-now-handles-62-stablecoin-volume-activity-surges-10x)
- Coinbase Q2 2026: Base stablecoin tx volume up 7x YoY, but sequencer revenue fell — [The Defiant](https://thedefiant.io/news/cefi/coinbase-says-revenue-from-its-base-layer-2-fell-despite-record-volume)
- Coinbase: about $1T in annual stablecoin movement, $20B USDC on platform [secondary] — [Spark research](https://www.spark.money/research/ethereum-base-chain-stablecoin-dominance)
- **Solana:** stablecoin supply hit a record $17.51B (Sept 2026), about 5% of global supply, but 32-36% of adjusted transfer volume in peak months; about $5T stablecoin volume in 2026 — [Cryptobriefing](https://cryptobriefing.com/solana-5-trillion-stablecoin-volume-2026/). February 2026 monthly volume: $650B (Grayscale via KuCoin) vs about $850B (TokenPost), a conflict — [KuCoin](https://www.kucoin.com/news/flash/solana-stablecoins-reach-650-billion-in-monthly-transactions-in-february-2026); [TokenPost](https://tokenpost.com/news/business/21382)
- **Tron:** USDT supply above $94B (TRONSCAN, early Nov 2026). Q3 2026 averaged $90.75B (49.49% of tracked USDT). About $24B/day average transfers in Q3 2026 ($2.18-2.21T for the quarter, about 73% of stablecoin transfer volume). $19.4B in a single day (Nov 3, 2026). About 79M holders, 16B+ cumulative txs and $30T+ cumulative volume. Q3 2026 network revenue $693M (93% of tracked L1/L2 revenue) — [Cryptobriefing, Nov 3 2026](https://cryptobriefing.com/tron-leads-usdt-stablecoin-transfer-volume/); [KuCoin](https://www.kucoin.com/news/flash/tron-processes-2-21-trillion-in-stablecoin-transactions-in-q3-2026)
- Conflicting Tron figure: a mid-2026 report said daily volume was "beyond $12B" — [Value The Markets](https://www.valuethemarkets.com/cryptocurrency/news/exploring-the-gasless-transfer-phenomenon-for-usdt-on-tron)
- Tron holds more USDT than Ethereum (March 2026) — [FXStreet](https://www.fxstreet.com/cryptocurrencies/news/tron-now-holds-more-usdt-than-ethereum-what-853-billion-in-stablecoins-means-for-trx-202603121554)

### Inferences
- Raw "stablecoin volume" for Base and Solana in the trillions is dominated by DeFi, MEV and bot flows. It is not comparable to MiniPay's ~$150M/month of genuine consumer P2P. For a consumer payments app, MiniPay's 3.5M P2P payments/month and Tron's 79M holders are better adoption signals than headline volume.
- Tron revenue ($693M/quarter) is essentially fees paid by USDT users. That is the economic "tax" a cheaper rail could undercut.

### Gaps
- No adjusted (Visa/Allium "organic") payments volume per chain for 2026 was retrieved.
- No Base Pay–specific usage, Base App MAU, or Basenames count.
- No Solana Pay–specific volume or merchant count for 2026.
- MiniPay figures after June 2026 (Q2/Q3 updates) not found.

## Unique features and weaknesses

### Takeaway
Each chain has one defining edge. Celo/MiniPay: phone-number UX, protocol stablecoin gas and emerging-market cash-out. Base: Coinbase distribution, regulated fiat rails, paymasters, Shopify. Solana: open QR/transaction-request standard and ~150ms finality. Tron: unmatched USDT liquidity and exchange/OTC reach. Their weaknesses are the mirror images.

### Cited Findings
- Celo/MiniPay unique: stablecoin gas at protocol level ([Celo docs](https://docs.celo.org/developer/fee-currency)), phone-number wallet ([App Store](https://apps.apple.com/us/app/-/id6504087257)), M-Pesa/MoMo/PIX/GCash ramps ([MiniPay blog](https://www.minipay.to/blog/minipay-2-years-stablecoins-everyday-payments)), and Visa card ([Cointelegraph](https://cointelegraph.com/news/operas-minipay-launches-visa-debit-card-for-stablecoin-spending)). Weakness: small dollar volume (~$153M/month) relative to user count; dependent on a single distributor (Opera) and a 160M CELO grant — [Celo forum](https://forum.celo.org/t/minipay-update-q1-2026/13273)
- Base unique: Coinbase regulated rails plus 100M+ verified Coinbase users feeding Base activity [secondary] — [Spark research](https://www.spark.money/research/ethereum-base-chain-stablecoin-dominance); USDC yield/cashback incentives — [Flexa](https://flexa.co/newsroom/base-pay). Weaknesses: weak merchant pull-through (~$1.2M Shopify USDC, unverified) — [Pulse](https://www.pulse.bot/crypto/news/payments-protocol-by-coinbase-shopify-processes-just-12m-usdc-since-june-growthepie-61c89980-5b85-479e-bacd-2e933928812b/); centralized sequencer revenue model under pressure — [The Defiant](https://thedefiant.io/news/cefi/coinbase-says-revenue-from-its-base-layer-2-fell-despite-record-volume); frequent SDK rebranding and doc moves (Base Account SDK → Coinbase Wallet SDK) — [docs.base.org](https://docs.base.org/base-account/guides/accept-payments)
- Solana unique: open Solana Pay standard with many wallets ([QuickNode](https://www.quicknode.com/builders-guide/tools/solana-pay-by-solana-labs)); Alpenglow finality ([RPCFast](https://rpcfast.com/blog/alpenglow-solana-150ms-finality-explained)); multi-stablecoin settlement (USDC, EURC, PYUSD, USDY) via Helio ([Benzinga](https://benzinga.com/markets/cryptocurrency/24/06/39315050/shopify-merchants-can-now-embrace-crypto-payments-with-helio-integration)). Weaknesses: fees are paid in SOL unless the app sponsors them ([Plisio](https://plisio.net/crypto/solana-payment-gateway)); shorter blockhash expiry ([RPCFast](https://rpcfast.com/blog/alpenglow-solana-150ms-finality-explained)); thin public evidence of Solana Pay merchant adoption post-2024.
- Tron unique: dominant USDT liquidity, holders and transfer share ([Cryptobriefing](https://cryptobriefing.com/tron-leads-usdt-stablecoin-transfer-volume/)); GasFree USDT ([Klever](https://support.klever.org/hc/en-us/articles/38548067522836-How-to-Send-USDT-Without-TRX-Using-Klever-Wallet-s-GasFree-Feature)). Weaknesses: highest per-tx cost (~$2-4.50 burn or ~1.5 USDT GasFree) ([Eco](https://eco.com/support/en/articles/15197974-usdt-trc-20-fees-2026-per-transfer-cost-on-every-exchange); [ChainCatcher](https://www.chaincatcher.com/en/article/2266593)); energy/bandwidth complexity and fresh-address surcharge ([Dwellir](https://www.dwellir.com/blog/tron-energy-usdt-transfers)); fee changes depend on SR governance votes ([Cointelegraph](https://cointelegraph.com/news/tron-gas-fee-reduction-cuts-daily-revenue-10-days)).

### Inferences
- Design cues for a universal "UPI for stablecoins" app:
  - phone/handle addressing like MiniPay
  - pay-gas-in-stablecoin like Celo CIP-64, emulated with paymasters/fee payers elsewhere
  - a Solana Pay–style two-mode QR (static transfer plus dynamic transaction request with reference keys)
  - a Tron leg for USDT liquidity and cash-out, since that is where users and OTC desks are
  - MiniPay-style local ramp mesh
- The biggest whitespace is cross-chain: no ecosystem offers one address/QR that settles across Tron USDT, Base USDC, Solana USDC and Celo USDT. Each standard is chain-locked.

### Gaps
- Regulatory and compliance posture per ecosystem (e.g. Tron freeze actions, Coinbase licensing) not researched.
- Tron-side consumer wallet metrics (Tron Wallet, TronLink, Trust Wallet share) not found.
- No primary source on chargeback or refund primitives in any of the four.
