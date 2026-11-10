# Consumer crypto/stablecoin payment apps that behave like UPI (as of November 2026)

Scope: apps that let a consumer pay a name, phone number or QR, send to friends, and pay shops at low or zero fees. Research date: 2026-11-09. About 25 web searches and fetches. Most metrics are company-reported. Anything marked **[UNVERIFIED]** came from an aggregator, an affiliate blog or social media, or conflicts with another source.

Status legend: LIVE · REGION-LIMITED · ANNOUNCED-ONLY · SHUT DOWN / PIVOTED · NOT A REAL PRODUCT

---

## Q1. Per-app catalogue: operator, chains, addressing, gas, ramps, countries, merchants, users/volume, funding, distinctive feature

### Takeaway
No single app combines UPI's four properties at scale: one universal handle, free P2P, QR acceptance at ordinary shops, and instant bank on/off-ramps. The closest matches are MiniPay (phone number plus near-zero fees, but self-custody in emerging markets with a card instead of local QR), Binance Pay (QR at about 20M merchants, but custodial and exchange-gated), and Bybit Pay/OKX Pay (QR piggybacking on local rails such as Pix, AEON and MoneyBadger). Several 2024–25 "crypto Venmo" apps (Daimo, Yellow Card retail, Valora's team) have shut down or pivoted. The 2026 wave is dominated by incumbents: Cash App USDC, Venmo PYUSD, Nubank Nu Global, World Money, MetaMask Money Account and Exodus Pay.

### Cited Findings

#### A. Wallet / L2 "super-apps"

**Coinbase Wallet (was "Base App" from July 2025 to Sept 2026) / Base Pay** — LIVE, but the payments/social pitch has been de-emphasised
- Coinbase launched Base App in July 2025 as an "everything app" (social, mini-apps, messaging, payments, trading) and rebranded Coinbase Wallet to it; users could send USDC with tap-to-pay — [The Block](https://www.theblock.co/post/362713/coinbase-unveils-base-app-rebrands-wallet-as-all-in-one-social-and-trading-platform); [TradingView/Cointelegraph](https://www.tradingview.com/news/cointelegraph:9bdaaea4a094b:0-coinbase-wallet-is-now-base-app-a-crypto-everything-app/)
- On Sept 10–11, 2026, Coinbase reverted the name to Coinbase Wallet. The app now leads with trading: Hyperliquid-powered perps, prediction markets, tokenized stocks, and more than 10 networks, with non-US trades settled in USDC. Press framed it as the social experiment "falling short" — [The Block](https://www.theblock.co/news/defi/2026-09-10-coinbase-rebrands-base-app-back-to-coinbase-wallet-after-just-over-a-year-as-social-experiment-falls-short-414115); [CryptoTimes](https://www.cryptotimes.io/2026/09/11/base-app-returns-to-coinbase-wallet-a-year-after-rebranding/); [Cryptopolitan](https://www.cryptopolitan.com/base-app-reverts-to-coinbase-wallet/)
- Base Pay launched as a USDC checkout option with Shopify integrations live, and one source cited 1% cashback for US users. I found no reporting on Base Pay's status after the rename — [same search set; The Block 2025](https://www.theblock.co/post/362713/coinbase-unveils-base-app-rebrands-wallet-as-all-in-one-social-and-trading-platform)
- Distinctive: Shopify-native USDC checkout, plus a social/mini-app layer, now retired as branding.

**World App → "World Money" (Tools for Humanity)** — LIVE, REGION-LIMITED by feature
- World Money launched Sept 2026 as a self-custodial app rolling out in more than 150 countries, with stablecoin payments, trading, earn, virtual accounts and balances in 8 currencies. It integrates Stripe (US Apple Pay → stablecoin funding "within a few minutes"), Kalshi and Morpho. World ID unlocks boosted earn rewards — [The Block](https://www.theblock.co/news/business/2026-09-17-world-launches-world-money-super-app-stablecoins-stripe-integration-boosted-rewards-415394)
- Users can send to another World Money user **by username**, subject to country availability. Key features remain country-limited — [BitcoinEthereumNews summary](https://bitcoinethereumnews.com/tech/world-rolls-out-money-app-as-key-features-remain-country-limited/)
- Chain: World Chain (OP Stack L2). Native Circle USDC and CCTP V2 are live, and "almost two million humans" already held bridged USDC before the upgrade — [World blog](https://world.org/blog/announcements/world-integrates-circles-usdc-and-cctp)
- On-ramp: Bridge-powered virtual accounts. Lead Bank receives fiat, Bridge converts it to USDC, and the USDC lands in World Wallet. The service started as a US pilot in Nov 2025 and has expanded to Singapore, South Korea, Taiwan and LatAm. It is for payroll/employer deposits; P2P bank transfers are not supported — [World blog](https://world.org/blog/announcements/virtual-accounts-powered-by-bridge-unlock-direct-usdc-payroll-and-deposits); [CoinDesk](https://www.coindesk.com/tech/2025/11/19/world-app-launches-virtual-bank-accounts-pilot-for-usdc-payroll-deposits)
- Dec 2025 app relaunch added encrypted chat plus global payments; "nearly 40 million" people use the app (company) — [BusinessWire](https://www.businesswire.com/news/home/20251212048432/en/The-New-World-App-Encrypted-Chat-and-Global-Payments-for-Everyone)
- Merchant: mini apps can accept USDC via the MiniKit-JS `pay` command — [Circle blog](https://www.circle.com/blog/accepting-usdc-instantly-in-world-app-mini-apps-with-minikit-js)
- Users: about 38M users / 850M+ transactions (Bridge-cited) and 27M+ World Chain users in 160+ countries. These are company figures that measure different things — [World blog](https://world.org/blog/how-to/stablecoins-on-world-one-real-human-network-billions-in-potential)
- Distinctive: **proof-of-personhood (World ID) attached to payments**, plus chat-native sending.

**MiniPay (Opera, on Celo)** — LIVE
- Self-custodial wallet. Sends "with just a phone number", with no fees and "20M+ wallets" (site claim) — [minipay.to](https://minipay.to/)
- 16M+ activated wallets across 65 countries as of June 2026 — [Cointelegraph](https://cointelegraph.com/news/operas-minipay-launches-visa-debit-card-for-stablecoin-spending); Q1 2026 update also reports 16M+ activations — [Celo Forum](https://forum.celo.org/t/minipay-update-q1-2026/13273). Conflicts with the site's "20M+" and with Tether's "3.64M estimated on-chain users" — [Tether](https://tether.io/news/tether-and-opera-expand-financial-access-in-emerging-markets-through-minipay/)
- Volume: users initiated 96M+ USDT in transfers in Dec 2025 alone — [Opera press](https://press.opera.com/2026/02/02/tether-and-opera-expand-financial-access-in-emerging-markets-through-minipay/)
- Stablecoins: USDT, USDC, cUSD, plus Tether Gold (Feb 2026 expansion) — [Opera press](https://press.opera.com/2026/02/02/tether-and-opera-expand-financial-access-in-emerging-markets-through-minipay/)
- Merchant: MiniPay Card (Visa, built on Gnosis Pay) launched June 23, 2026 in selected EEA, Africa, LatAm and SEA markets, with access to 175M+ merchant locations and stablecoin cashback — [Opera press](https://press.opera.com/2026/06/23/minipay-visa-debit-card/)
- Funding: Celo community proposal to allocate 160M CELO to Opera for MiniPay. Sources differ on whether the vote had passed — [blockchain.news](https://blockchain.news/flashnews/opera-s-minipay-wallet-surpasses-420m-transactions-and-eyes-50m-new-users-with-celo-partnership) **[UNVERIFIED status]**
- Gas: Celo fee abstraction (fees paid in stablecoins). See Gaps.
- Distinctive: **phone-number addressing on a public chain, at emerging-market scale.**

**Valora (cLabs / Celo)** — PIVOTED (team acqui-hired)
- Stripe acqui-hired Valora's team. The IP was not included; the app returned to cLabs to steward — [The Block](https://www.theblock.co/post/382111/stripe-acquires-valora-wallet-team-builds-stablecoin-services)
- I found no 2026 evidence of active development. The GitHub repo is still public — [GitHub](https://github.com/valora-xyz/wallet)

**Daimo** — SHUT DOWN (consumer app); pivoted to Daimo Pay (dev infra)
- The old payments app is shut down and users were told to withdraw. The repo was archived Feb 18, 2026 with the note "This is our old, archived payments app" — [GitHub](https://github.com/daimo-eth/daimo); Walletbeat lists it as no longer offered — [Walletbeat issue](https://github.com/walletbeat/walletbeat/issues/1169)
- Funding: about $2M seed (Mar 2024) and 5 employees (Aug 2026) — [Tracxn](https://tracxn.com/d/companies/daimo/__0oWfevITQC2RVfxkCLk6rcWZBWMPXJ5W38NiT-J9o2c) **[UNVERIFIED aggregator]**

**Peanut (peanut.me)** — LIVE, invite-only
- iOS app "Peanut: Send Money & Card". Core send/receive needs no KYC, and Bridge (Stripe) provides the stablecoin infrastructure — [App Store](https://apps.apple.com/us/app/peanut-send-money-card/id6786373552)
- Addressing: **claimable send links** dropped in any chat, and request links/QRs that multiple people can contribute to — [Show HN](https://news.ycombinator.com/item?id=45424427); [Peanut help](https://peanut.me/en/help/request-money). A UI PR shows sends routed to EVM addresses or ENS names — [GitHub PR](https://github.com/peanutprotocol/peanut-ui/pull/3802)
- Chains: multi-EVM. Added Stable-network USDT deposits/withdrawals — [Stable on X](https://x.com/Stable/status/2097347602627088568)
- Self-custodial Visa card in closed beta as of July 2026; the app is invite-only — [SpendNode](https://www.spendnode.io/crypto-cards/peanut/) **[UNVERIFIED]**
- Distinctive: **send-by-link to people with no wallet.**

**Phantom (Phantom Cash / CASH stablecoin)** — LIVE, card and bank funding US-only
- Phantom Cash is built on CASH, a Bridge-issued stablecoin and the first on Stripe's Open Issuance. Users fund by bank or card, pay with Visa via Apple/Google Pay, and send to peers. Bank linking is US-only — [Blockworks](https://blockworks.com/news/phantom-unveils-phantom-cash); [crypto.news](https://crypto.news/phantom-launches-new-stablecoin-cash-on-solana/)
- Chain: Solana. I found no 2026 source on Solana Pay QR merchant adoption specifically.
- Distinctive: wallet-issued own stablecoin, with yield and spend in one balance.

**MetaMask (Money Account / mUSD / MetaMask Card)** — LIVE, REGION-LIMITED
- Money Account launched June 30, 2026. It is self-custodial, **built on Monad**, holds mUSD and pays variable yield. Cards, perps, mUSD and Rewards are region-limited — [stablecoininsider](https://stablecoininsider.org/stablecoin-wallets-2026-2027/) **[UNVERIFIED secondary]**
- mUSD is issued on the same Stripe/Bridge Open Issuance platform as CASH — [Blockworks](https://blockworks.com/news/phantom-unveils-phantom-cash)
- MetaMask Card: self-custodial, but new US sign-ups have been paused since June 2026 — [web3wagmi guide](https://blog.web3wagmi.com/best-stablecoin-cards-neobanks) **[UNVERIFIED]**

**Exodus Pay** — LIVE (US)
- Launched Apr 9, 2026 as a self-custodial way to spend and send USD stablecoins **with phone transfers**. It started in NE, TX, FL, NY and CA with a national rollout through April 2026. Its stablecoin is issued by MoonPay on M0 rails — [CoinDesk](https://www.coindesk.com/business/2025/12/09/crypto-wallet-firm-exodus-bets-on-stablecoins-for-real-world-payments-with-2026-app); [StockTitan](https://www.stocktitan.net/news/EXOD/exodus-launches-exodus-pay-to-let-users-spend-send-and-earn-rewards-ja8y0ky8z0rq.html); [Cointelegraph](https://cointelegraph.com/news/exodus-moonpay-join-stablecoin-gold-rush-with-latest-offering)
- Merchant: Exodus Checkout (Oct 1, 2026) launched with DIRECTV's DGO — [same search, release snippet] **[UNVERIFIED detail]**
- Distinctive: a NYSE-American-listed self-custody wallet issuing a white-label stablecoin with phone-number sends.

**Trust Wallet** — LIVE
- Supports 100+ chains and relies on third-party ramps (MoonPay, Ramp). It has no native card or stablecoin; it is strong for USDT on Tron — [stablecoininsider](https://stablecoininsider.org/stablecoin-wallets-2026-2027/) **[UNVERIFIED secondary]**

#### B. Exchange "Pay" products (custodial, QR + P2P inside the exchange)

**Binance Pay** — LIVE (excludes restricted jurisdictions)
- About 20M+ merchants by Nov 2025 (from 12k at the start of 2025), 45M+ users, $250B+ cumulative volume since 2021; over 98% of B2C payments settle in stablecoins (USDT, USDC, EURI, XUSD, FDUSD) — [Cobo guide](https://www.cobo.com/post/2026-guide-to-the-most-reliable-stablecoin-payments-providers) **[vendor-reported; 21M figure in [CoinAlert](https://coinalertnews.com/news/2026/05/05/binance-pay-crypto-qr-expansion)]**
- QR expansion to 10+ more countries by Q3 2026. QR transfers grew 23% (Feb→Mar 2026) and 13% (Mar→Apr) — [MEXC news](https://www.mexc.com/news/1073009)
- **Japan: linked to PayPay's QR network** so KYC'd foreign tourists can scan PayPay merchant codes — [same](https://www.mexc.com/news/1073009)
- Gas: zero fees for Binance-Pay-to-Binance-Pay transfers. These are off-chain ledger moves — [Finovate roundup](https://finovate.com/stable-launches-stablepay-to-bring-stablecoin-payments-to-the-mainstream/)
- Distinctive: **largest merchant QR footprint, with interop into a national QR scheme (PayPay).**

**Bybit Pay** — LIVE, REGION-LIMITED (KYC'd users outside restricted jurisdictions)
- Scan-to-pay flow. Expansions include Vietnam and the Philippines via AEON (AEON Pay is accepted by more than 90% of urban merchants) — [Electronic Payments Intl](https://www.electronicpaymentsinternational.com/news/bybit-pay-vietnam-philippines/); **Brazil via Pix** (Bybit Card QR Pay, Jan 2026); **South Africa via MoneyBadger**, settled in rand (Apr 28, 2026) — [PR Newswire](https://www.prnewswire.com/news-releases/bybit-pay-expands-to-south-africa-with-moneybadger-enabling-nationwide-crypto-qr-payments-302755739.html)
- Distinctive: **piggybacks on domestic instant-payment QR rails (Pix, AEON, SA QR).**

**OKX Pay / OKX Money** — LIVE in 10 markets
- Scan to Pay with USDG, USDT or USDC, available in 10 markets — [OKX help](https://www.okx.com/en-us/help/okx-pay-scan-to-pay-guide)
- OKX Money (Oct 2026) converts 50+ local currencies into stablecoins, with "save, earn ~10% yield, spend" via a virtual or physical card — [CoinDesk](https://www.coindesk.com/business/2026/10/06/okx-money-lets-users-save-earn-10-yield-and-spend-dollar-stablecoins-in-one-app)
- Distinctive: USDG (Paxos/Global Dollar Network) as the default spend asset.

**KuCoin Pay** — no 2026 source found (see Gaps).

**Crypto.com Pay** — LIVE. Zero transaction fees on native settlement, with CRO cashback — [Ventureburn roundup](https://ventureburn.com/best-crypto-payment-gateway/) **[UNVERIFIED]**. I found no 2026 stablecoin-specific data.

#### C. Fintech incumbents adding stablecoins

**PayPal / Venmo (PYUSD)** — LIVE (US)
- Venmo offers PYUSD. Transfers to other Venmo/PayPal accounts are free; external sends pay network fees and are irreversible. From May 19, 2026, crypto services are provided by PayPal Digital, Inc. d/b/a Venmo Digital — [Venmo help](https://help.venmo.com/cs/articles/cryptocurrency-faq-vhel141); [Venmo transfers](https://help.venmo.com/hc/en-us/articles/16145303480595-Crypto-Transfers)
- "67M users get PYUSD access" (Aug 2026); no official volume data — [Cryptonomist](https://en.cryptonomist.ch/2026/08/25/venmo-pyusd-support/) **[UNVERIFIED headline figure]**
- PYUSD market cap of about $4B mid-2026, in about 70 markets — [Finovate roundup](https://finovate.com/stable-launches-stablepay-to-bring-stablecoin-payments-to-the-mainstream/) **[UNVERIFIED]**
- Distinctive: stablecoins reachable through **existing @username social-payment graphs** (Venmo).

**Cash App (Block)** — LIVE (US)
- May 2026: eligible customers can send and receive **USDC on Solana, Ethereum, Polygon and Arbitrum**. Stablecoin balances auto-convert into a single USD balance. Bitcoin spending and auto-convert were planned for 2026, with no confirmed release date — [PYMNTS](https://www.pymnts.com/cryptocurrency/2026/cash-app-rolls-out-stablecoin-payments/); [Cointribune](https://www.cointribune.com/en/cash-app-sets-2026-rollout-for-major-crypto-upgrade-with-stablecoin-and-bitcoin-payment-features/)
- PYUSD on Cash App is a rumour and not confirmed — [defi-intel](https://defi-intel.com/guides/pyusd-paypal-stablecoin-2026-guide/)
- Distinctive: **stablecoins as an invisible inbound rail into a $cashtag fiat balance.** Users never hold the token.

**Strike** — LIVE in 95+ countries (US except NY)
- 95+ countries — [BitDegree](https://www.bitdegree.org/crypto/strike-crypto-review) **[UNVERIFIED]**. USDT on Tron in select regions (Argentina, Brazil, El Salvador, India, Mexico, Nigeria) alongside Lightning — [Spark comparison](https://www.spark.money/tools/stablecoin-payment-app-comparison)
- Distinctive: **Lightning-native**, with USDT available in EM corridors.

**Revolut** — LIVE outside the US (pay with USDT/USDC via cards); US stablecoin bank is ANNOUNCED-ONLY
- US bank is expected to begin operating in 2027 per its US CEO (Reuters via PYMNTS). Some outlets still say 2026 — [PYMNTS](https://www.pymnts.com/news/banking/2026/revolut-wants-to-give-us-banking-customers-stablecoin-access/); [Cryptonomist](https://en.cryptonomist.ch/2026/06/03/revolut-us-bank-launch-stablecoin/)

**Nubank (Nu Global)** — LIVE (US, mid-Sept 2026)
- US retail accounts via Lead Bank. The OCC charter is pending (conditional approval Jan 2026). Nu Global converts deposits into **USDC or EURC across 35+ countries**. The launch date conflicts (Sept 10 vs 13) — [Rio Times](https://www.riotimesonline.com/nubank-us-launch-nu-global-stablecoin-account-2026/); [Fintech Brainfood](https://www.fintechbrainfood.com/p/nubank-america)

#### D. Stablecoin neobanks and card-first apps

**Plasma One (Plasma chain)** — LIVE (staged rollout from mid-June 2026)
- First unveiled Sept 2025 with a waitlist. It launched June 2026 with **zero-fee USDT transfers**, a Visa card and yield; the rollout reportedly began in the Middle East — [Blockworks](https://blockworks.com/news/plasma-one-stablecoin-neobank); [Fintech Byte](https://www.fintechbyte.com/articles/stablecoin-infra/2026-06-20/plasma-one-launches-to-herald-a-new-era-of-stablecoin-banking/); [The Paypers](https://thepaypers.com/crypto-web3-and-cbdc/news/plasma-launches-stablecoin-native-neobank-and-card)
- Country claims conflict: 150+ (2025) vs card usable in 180+ (2026). Multi-currency funding (USD, EUR, GBP, MXN, BRL) — [stablecoininsider](https://stablecoininsider.org/british-neobank-plasma-launches-plasma-one-its-flagship-stablecoin-banking-product-built-on-its-own-blockchain/) **[UNVERIFIED]**. No user count published.
- Distinctive: **chain-owner-operated neobank with protocol-level gasless USDT.**

**Stable / StablePay** — LIVE (July 2026)
- Send **USDT by phone number, email or QR**, instant and free, with yield on idle USDT. It runs on the Stable chain (USDT-as-gas L1) — [PR Newswire](https://www.prnewswire.com/news-releases/stable-launches-stablepay-instant-zero-fee-global-payments-app-built-on-stablecoin-rails-302825737.html); [Finovate](https://finovate.com/stable-launches-stablepay-to-bring-stablecoin-payments-to-the-mainstream/)
- Distinctive: the closest feature-for-feature "UPI-on-USDT" consumer pitch from a chain owner.

**RedotPay (Hong Kong)** — LIVE, not available in the US
- About 8M+ customers (company, Aug 2026), with $395.1M July 2026 card volume, the largest of the crypto cards — [CoinDesk](https://www.coindesk.com/business/2026/08/23/crypto-card-spending-tops-usd1-billion-as-stablecoins-move-into-everyday-purchases)
- Funding: $47M (Sept 2025, unicorn) plus a $107M Series B (Dec 2025, Goodwater lead; Pantera, Blockchain Capital, Circle Ventures), for $194M in 2025 — [Fintech Futures](https://www.fintechfutures.com/venture-capital-funding/redotpay-secures-107m-in-series-b); [fintech.global](https://fintech.global/2025/12/19/stablecoin-payments-firm-redotpay-bags-107m-funding/). Reportedly negotiating a pre-IPO round at a $4–5B valuation — [ChainCatcher](https://www.chaincatcher.com/en/article/2299513) **[UNVERIFIED]**
- Share of stablecoin card spend fell from about 85% (late 2023) to about 36% — [web3wagmi](https://blog.web3wagmi.com/best-stablecoin-cards-neobanks) **[UNVERIFIED]**

**KAST** — LIVE (custodial; includes US)
- USD Visa from a stablecoin balance, usable in 170+ countries including the US. Membership model rebuilt May 8, 2026 — [CryptoSlate review](https://cryptoslate.com/crypto-cards/kast-card-review/)
- $89.6M July 2026 card volume — [CoinDesk](https://www.coindesk.com/business/2026/08/23/crypto-card-spending-tops-usd1-billion-as-stablecoins-move-into-everyday-purchases)
- Funding: "$80M Series A" claimed only in a tweet — [X post](https://x.com/ourcryptotalk/status/2044560254558736706) **[UNVERIFIED]**

**ether.fi Cash** — LIVE, not in the US
- Non-custodial Safe vault. Users spend stablecoins or borrow against ETH/eETH, which keeps earning restaking yield — [web3wagmi](https://blog.web3wagmi.com/best-stablecoin-cards-neobanks)
- $100.3M July 2026 card purchase volume, excluding about $30M of fiat transfers (CEO confirmed) — [CoinDesk](https://www.coindesk.com/business/2026/08/23/crypto-card-spending-tops-usd1-billion-as-stablecoins-move-into-everyday-purchases)
- Distinctive: **credit-style spending against a yield-bearing collateral position.**

Aggregate: crypto card spending topped $1B (monthly) — [CoinDesk](https://www.coindesk.com/business/2026/08/23/crypto-card-spending-tops-usd1-billion-as-stablecoins-move-into-everyday-purchases)

#### E. Cross-border stablecoin P2P apps

**Sling Money** — LIVE (US MSB, UK FCA approval with a closed beta)
- Settles in **USDP on Solana**. $15M Series A (Aug 2024; USV, Ribbit, Slow) plus a $5M seed — [The Block](https://www.theblock.co/post/311223/sling-money-a-stablecoin-based-global-payment-app-raises-15-million-in-series-a); [Yahoo/FCA licence](https://finance.yahoo.com/news/crypto-payments-app-sling-money-134404378.html)
- 2024 feature claiming reach to "2.7B people" via fiat payout — [BusinessWire](https://www.businesswire.com/news/home/20240919675796/en/Sling-Money-Bridges-Stablecoins-and-Fiat-with-New-Feature-Reaching-Over-2.7-Billion-People-Worldwide)

**Zar** — status unclear in 2026
- Founded by ex-SadaPay CEO Brandon Timinsky. $7M (spring 2025; Dragonfly, a16z, VanEck, Coinbase Ventures) to bring stablecoins "to local stores", using a cash-agent model — [Yahoo/Fortune exclusive](https://finance.yahoo.com/news/exclusive-stablecoin-company-zar-raises-120000155.html); [Cryptonews](https://cryptonews.com/news/zar-secures-7m-from-a16z-dragonfly-to-bring-stablecoins-to-local-stores/)
- I found no 2026 coverage.

#### F. Regional dollar apps (LatAm, Africa)

**Bitso** — LIVE (MX, AR, BR, CO). 9M+ users, with stablecoin savings, cross-border and a Visa debit card — [stablecoininsider](https://stablecoininsider.org/top-stablecoin-payment-startups-in-june-2026/) **[UNVERIFIED]**

**Lemon Cash** — LIVE (AR, PE). 2M+ (AR) or 4M+ (LatAm) users, with a Visa card and USDC yield — [stablecoininsider review](https://stablecoininsider.org/lemon-cash-review-2026-the-stablecoin-app-that-replaced-the-peso-for-millions-of-argentines/) **[UNVERIFIED, figures conflict]**

**Belo** — LIVE (AR, LatAm). $14M Series A **led by Tether** (Apr 2026), 3M+ users — [CoinDesk](https://www.coindesk.com/business/2026/04/28/tether-leads-belo-s-usd14-million-raise-to-expand-stablecoin-payments-across-latin-america)

**El Dorado** — LIVE as of the last available source; P2P wallet founded by Venezuelans, 200k+ users (about 2 years old) — [Mobile Money LatAm](https://noticias.mobilemoneylatam.com/the-el-dorado-the-new-crypto-wallet-bets-on-argentina/) **[STALE]**

**Airtm** — LIVE. Stablecoin rails for digital workers outside the US/EU to receive earnings; spoke at Money20/20 USA 2026 on "hidden" stablecoin plumbing — [Stripe blog](https://stripe.com/blog/trends-from-money20-20-2026-the-rise-of-hidden-financial-services)

**Yellow Card** — consumer app SHUT DOWN (retail discontinued from Jan 1, 2026); B2B only now, with a Mastercard partnership — [Condia](https://thecondia.com/yellow-card-shutdown-retail-consumer-app-stablecoin/)

**Chipper Cash** — LIVE. Wallet supports USDC, USDT, RLUSD and PYUSD deposits; card funding varies by region — [ucard.observer](https://ucard.observer/en/cards/chipper-card/) **[UNVERIFIED]**

**Nigeria:** Sentz (eUSD; "just a phone number", USDT/USDC or bank funding) — [sentz.com](https://www.sentz.com/); Karsa, Breet and Cash-In for naira off-ramp — [Monierate](https://monierate.com/blog/top-7-apps-to-receive-stablecoins-in-nigeria)
**Turkey:** the typical path is Binance TR/BTCTurk USDT, sent over TRC-20 to a wallet address (not a phone number). BTCTurk offers USDT savings — [Monica](https://monica.cash/send-usdt-from-turkey-to-nigeria); [CoinPaprika](https://coinpaprika.com/education/stablecoins-emerging-markets/)
**Gulf/UAE:** no UAE-specific consumer app found. Plasma One's rollout reportedly began in the Middle East — [stablecoininsider](https://stablecoininsider.org/british-neobank-plasma-launches-plasma-one-its-flagship-stablecoin-banking-product-built-on-its-own-blockchain/)

**Announced-only:** CZR Pay (CZR Exchange; US stablecoin spending app, announced Nov 6, 2026, pending approvals) — [MENAFN](https://menafn.com/1111927700/CZR-Exchange-Unveils-CZR-Pay-A-Stablecoin-Spending-App-For-US-Consumers)

#### G. India

- **No licensed crypto-UPI product exists.** I found no 2026 source showing a crypto or stablecoin app connected to UPI.
- RBI FAQ (updated Oct 1, 2026): the retail e₹ is still a pilot, and merchants can accept e₹ by scanning **either the CBDC QR or the UPI QR**. e₹–UPI QR interoperability is therefore live for merchant payments — [productgrowth.in summary of RBI FAQ](https://productgrowth.in/insights/web3/digital-rupee-e-rupee-wallet-builders/); RBI deputy governor flagged UPI/e₹ interoperability as a focus as early as 2023 — [Business Standard](https://www.business-standard.com/finance/news/focusing-on-enabling-upi-e-rupee-interoperability-says-rbi-deputy-guv-123091400597_1.html)
- Scale: about 10M e₹ users vs 300M+ UPI users; about $3.6B cumulative e₹ since Dec 2022 vs about $300B per month on UPI — [IndianWeb2](https://www.indianweb2.com/2026/04/erupee-pilots-put-india-at-forefront-of.html) **[secondary]**
- Draft PPI Master Direction (Apr 2026) would make full-KYC PPIs (wallets) interoperable with UPI and cards — [KS&K](https://ksandk.com/newsletter/rbi-draft-ppi-directions-2026/)
- Strike lists India among its USDT/Tron regions — [Spark](https://www.spark.money/tools/stablecoin-payment-app-comparison)

#### H. More UPI-style apps (no "Pay" in the name)

**Wallet in Telegram (@wallet, TON)** — LIVE (region-limited; not in US per general knowledge, unverified)
- Mechanism: send TON/USDT to another Telegram user by **@username or linked phone number** inside chat. Internal transfers between Telegram users are reported as free because they are ledger moves. On-chain USDT-on-TON sends pay gas in TON. USDT payments on TON in Telegram were announced in Apr 2025 — [CoinCodeCap](https://coincodecap.com/top-wallets-inside-telegram); [DailyCoin](https://dailycoin.com/telegram-wallet-ads-usdt-payments-heres-how-to-set-them-up/); [eco.com guide](https://eco.com/support/en/articles/14998909-usdt-on-ton-complete-guide-for-telegram-wallet-users)
- Custody conflicts: the main wallet is described as custodial, and a separate self-custodial "TON Wallet" mode also exists — [themarketsunplugged](https://www.themarketsunplugged.com/send-usdt-in-telegram-ton-wallet-vs-tonkeeper-2025/) **[UNVERIFIED]**
- Distinctive: the **messaging graph is the address book**. This is the closest analogue to WeChat Pay in crypto.

**MoneyGram app (Stellar, USDC + MGUSD)** — LIVE in Colombia and El Salvador; MGUSD US-only
- Mechanism: in-app USDC balance on **Stellar**, with wallet infrastructure from Crossmint. Cash in/out goes through MoneyGram's retail agent network. Launched in Colombia, then El Salvador (Apr 2026 extension) — [The Paypers](https://thepaypers.com/crypto-web3-and-cbdc/news/moneygram-stellar-extend-partnership-to-scale-stablecoin-utility-in-latam); [PR Newswire](https://www.prnewswire.com/news-releases/moneygram-and-stellar-extend-partnership-to-scale-real-world-stablecoin-utility-globally-302749574.html)
- MGUSD stablecoin issued by Bridge on Stellar, launched June 2, 2026 in the US only — [CoinDesk](https://www.coindesk.com/business/2026/06/02/moneygram-launches-stablecoin-on-stellar-joining-rush-toward-digital-dollar-payments)
- USDC Visa card in Colombia (Sept 10, 2026), with Apple/Google Wallet — [Newscord roundup](https://newscord.org/article/moneygram-launches-stellar-powered-usdc-visa-stablecoin-card-in-colombia--Story_20260910_MoneyGramlaunchesVis6e8212ca)
- "60M MoneyGram users gain access" is a reach claim, not usage — [Bitcoin.com](https://news.bitcoin.com/60-million-moneygram-users-gain-access-to-a-self-custodial-dollar-via-stellar-stablecoin/) **[UNVERIFIED]**
- Distinctive: **physical cash agents as the on/off-ramp** for a self-custodial stablecoin wallet.

**StablePay (Stable chain)** mechanism note: phone/email/QR addressing resolved by the app; on-chain settlement on Stable L1, where USDT is the gas token, so transfers are "free" to the user — [PR Newswire](https://www.prnewswire.com/news-releases/stable-launches-stablepay-instant-zero-fee-global-payments-app-built-on-stablecoin-rails-302825737.html)

#### I. Open payment protocols and addressing layers (the "UPI switch" equivalents)

**Celo SocialConnect + ODIS (phone-number registry) and Celo fee abstraction** — LIVE (Celo mainnet)
- Mechanism (addressing): SocialConnect maps phone numbers to addresses **privately via ODIS** (Oblivious Decentralized Identifier Service). An "issuer" (for example MiniPay) verifies the number by SMS and registers the attestation, and lookups are scoped per issuer. MiniPay uses this so users send to contacts instead of hex addresses. ODIS contexts are mainnet-only — [Celo Docs: Build for MiniPay](https://docs.celo.org/build-on-celo/build-on-minipay/overview); [GitHub celo-org/minipay](https://github.com/celo-org/minipay)
- Conflict: one 2025 article says MiniPay's phone mapping uses Self.xyz "Self Connect" — [same search set](https://www.cointrust.com/market-news/opera-minipay-surpasses-20-million-activated-wallets-on-celo) **[UNVERIFIED]**
- Mechanism (gas): **node-level fee abstraction** (CIP-64 tx type), not paymasters or relayers. Any EOA pays gas in an allowlisted token (USDm, USDC, USDT). MiniPay auto-selects the stablecoin the user holds most of, so users never hold CELO — [Celo Docs](https://docs.celo.org/build-on-celo/build-on-minipay/overview); [Celo Protocol docs](https://docs.celo.org/learn/protocol)
- Significance: the only **on-chain, issuer-attested phone-number directory** found. Note that attestations are issuer-scoped, not one global registry.

**Solana Pay (open QR / URL standard)** — LIVE
- Mechanism: the merchant encodes recipient, amount, SPL token (USDC default) and a `reference` key into a URL/QR. The wallet builds and signs the transaction, and the merchant matches it on-chain by reference. Sub-second settlement and fees under $0.01 (vendor claim) — [Spark research](https://www.spark.money/research/solana-pay-protocol-merchant-adoption)
- Adoption: Shopify integration. **KSNET (Korea) signed an MOU in July 2026 to bring Solana Pay to 330,000+ merchant locations** — [stablecoininsider](https://stablecoininsider.org/solana-pay-usdc/); [cryptodaily](https://cryptodaily.co.uk/2026/05/solana-usdc-payments-vs-nft-volume) **[MOU, not live]**
- Supported in third-party wallets, for example Exodus — [Exodus support](https://www.exodus.com/support/en/articles/8598913-solana-pay-in-exodus)
- **X9.150 (ANSI merchant-presented QR standard, published July 2026):** a Money20/20 Oct 2026 demo (Altitude, Matera, Solana Foundation) showed **one invoice QR payable over FedNow/RTP or USDC on Solana** — [Solana Compass](https://solanacompass.com/news/x9150-qr-code-payments-demo-at-money2020-lets-one-invoice-be-paid-over-fednow-rtp-or-usdc-on-solana)
- Significance: the nearest thing to a **UPI/Pix-style QR that spans bank and stablecoin rails**. It is a demo, not a product.

**Lightning Address (LNURL-pay) and BIP-353 "Human Bitcoin Addresses"** — LIVE (wallet-dependent)
- Mechanism: a Lightning Address (user@domain) is resolved via an HTTP server that returns an invoice, which requires a live server. **BIP-353** puts payment instructions in a **DNSSEC-signed DNS TXT record** (₿user@domain) pointing to Lightning (BOLT12 offer), on-chain or silent-payment destinations, with no live server needed. Authored by Matt Corallo and Bastien Teinturier and merged June 2024 — [btrust](https://blog.btrust.tech/bip-353-a-more-reliable-protocol-level-way-to-share-bitcoin-payment-details/); [Spark glossary](https://www.spark.money/glossary/bip-353); [BIP text](https://bips.xyz/353)
- Wallet support: Phoenix, Zeus, BitBanana, Misty Breez (send), CakeWallet, Sparrow; LDK 0.1. As of Aug 2026 support was uneven, and no wallet supports the full stack of unified QR + BOLT12 + silent payments + BIP-353 — [Spark glossary](https://www.spark.money/glossary/bip-353); [Spark QR research](https://www.spark.money/research/bitcoin-unified-qr-payment-standard)
- Significance: the **only cross-wallet, cross-provider human-readable handle standard in production**, the closest match to a UPI VPA (handle@provider). It is bitcoin-only, though (USDT-on-Lightning via Taproot Assets is not covered here).

**ENS / ERC-7828 interoperable names (name.eth@chain)** — standard in progress
- Mechanism: `alice.eth@base` resolves through ENS with chain identities from the `on.eth` chain registry. ENSIP-11 stores per-chain address records, and ERC-7828 adds the `@chain` syntax plus an optional checksum — [EIP-7828](https://eips.ethereum.org/EIPS/eip-7828); [ENS blog on.eth](https://ens.domains/blog/post/on-eth-chain-registry)
- Status: sources disagree on the chain-label mechanism, and there was a past dependency on ERC-7785. No 2026 evidence was found of a consumer pay app shipping `@chain` sends, or of Basenames-as-payment-handle adoption figures — [Ethereum Magicians](https://ethereum-magicians.org/t/erc-7828-chain-specific-addresses-using-ens/21930)

**India e₹ on UPI QR** — LIVE (pilot): see section G. It is the only government-rail example of a token-based digital currency payable by a standard UPI QR.

#### J. Mechanism summary (how addressing, settlement and gas actually work)

| App / protocol | Addressing → resolution | Settlement | Gas handling | Custody |
|---|---|---|---|---|
| MiniPay | Phone → Celo SocialConnect/ODIS (issuer-attested) | On-chain Celo (USDT/USDC/cUSD) | Protocol fee abstraction (CIP-64), paid in stablecoin | Self |
| World Money | Username → World App directory (in-app only) | On-chain World Chain (native USDC, CCTP V2) | App-sponsored (see Gaps) | Self |
| Wallet in Telegram | @username/phone → Telegram account | Internal ledger (free); TON on-chain for external | Ledger: none; on-chain: TON | Mostly custodial |
| StablePay | Phone/email/QR → app directory | Stable L1 | USDT is the gas token | App-managed (unverified) |
| Plasma One | App directory | Plasma chain | Protocol-sponsored zero-fee USDT | App-managed (unverified) |
| Binance/Bybit/OKX Pay | Pay ID/contacts/QR → exchange account; local QR via PayPay/Pix/AEON/MoneyBadger | Internal ledger; fiat leg via local scheme | None (off-chain) | Custodial |
| Venmo PYUSD / Cash App USDC | @handle/$cashtag → account | Internal ledger; on-chain only for external send/receive | Internal free; external pays network fee | Custodial |
| Peanut | Claim link / request link / QR; ENS or address | On-chain multi-EVM (+ Stable) | Sponsored via smart account (see Gaps) | Self |
| Phantom Cash / MetaMask Money Account | Address/SNS-ENS; app contacts | Solana (CASH) / Monad (mUSD) | Wallet-sponsored for stablecoin ops (unverified) | Self |
| MoneyGram app | App account; cash agents | Stellar (USDC, MGUSD) | Stellar fees (negligible), abstracted | Self (Crossmint) |
| Solana Pay | QR/URL with recipient + reference | Solana SPL (USDC) | Payer pays SOL (<$0.01) unless sponsored | Self |
| Lightning Address / BIP-353 | user@domain → LNURL server / DNSSEC TXT | Lightning / on-chain BTC | Routing fees (sats) | Either |
| ENS ERC-7828 | name.eth@chain → ENS resolver + on.eth | Any EVM chain | Not specified | Self |
| Card neobanks (RedotPay, KAST, ether.fi) | No P2P handle standard; card PAN for merchants | Visa/Mastercard; stablecoin debited at authorization | N/A to user | Custodial (ether.fi: Safe vault) |

### Inferences
- The "UPI-like" field has split. **Incumbents** (Venmo, Cash App, Nubank, Revolut) add stablecoins *behind* an existing handle and graph. **Chain owners** (Plasma One, StablePay, World Money, MiniPay/Celo, MetaMask-on-Monad) build consumer apps to drive their own chain's volume. **Exchanges** (Binance, Bybit, OKX) win merchant QR by bridging into national QR rails.
- Gas is effectively solved at the product layer everywhere. Exchanges do it off-chain, Plasma and Stable at protocol level, Celo through fee currencies, and smart-wallet apps through paymasters. It no longer differentiates.
- Cards (Visa/Mastercard), not crypto QR, remain the main way stablecoin apps reach merchants. MiniPay, Plasma One, KAST, RedotPay, ether.fi, Phantom, OKX Money and Bitso all lead with a card.
- Several standalone "crypto Venmo" startups have died or pivoted (Daimo, Valora team to Stripe, Yellow Card retail). This suggests distribution, not tech, is the binding constraint.

### Gaps
- No source found in this session for: KuCoin Pay 2026 status; Zar 2026 status; Plasma One users or funding; ether.fi and KAST verified funding; Strike's 2026 product changes; Nubank's crypto in Brazil (Nucoin/crypto trading); Gulf/UAE-specific apps; Airtm user numbers; Coinbase/Base Pay volume; Basenames as payment handles after the rename.
- Background knowledge NOT re-verified here (treat as unconfirmed): Celo lets users pay gas in stablecoins (fee abstraction); Base Pay launched mid-2025; Plasma raised a seed/Series A plus a large XPL token sale in 2025; KAST raised a ~$10M seed in 2024; Cash App supports Lightning send/receive for BTC; Strike was founded by Jack Mallers; Zar operates a cash-agent network in Pakistan; El Dorado runs a P2P marketplace in Venezuela/Argentina/Colombia.
- I found no on-chain analytics (Artemis/Dune) in this session to independently verify any app-level user or volume number.

---

## Q2. Existence checks: "Arbitrum Pay", "Monad Pay" and similar

### Takeaway
Neither "Arbitrum Pay" nor "Monad Pay" is a shipped consumer product from Offchain Labs or the Monad Foundation. "MonadPay" appears as a Monad Foundation-hosted Notion page (content not retrievable) and as a hackathon bounty winner. The real consumer payment presence on Monad is **MetaMask Money Account (mUSD, built on Monad)**. On Arbitrum it is **Cash App USDC (Arbitrum among supported networks)** and third-party apps such as Oobit and Bleap.

### Cited Findings
- No product named "Arbitrum Pay" found. Oobit (Tether-backed) added Arbitrum for spending at 150M+ Visa merchants — [CryptoRank](https://cryptorank.io/news/feed/10c22-tether-backed-oobit-adds-arbitrum-to-simplify-stablecoin-merchant-payments); the Arbitrum forum lists consumer apps including Bleap (fintech app plus debit card) — [Arbitrum forum](https://forum.arbitrum.foundation/t/a-list-of-arbitrum-based-consumer-apps/30132)
- Cash App's USDC support includes Arbitrum — [PYMNTS](https://www.pymnts.com/cryptocurrency/2026/cash-app-rolls-out-stablecoin-payments/)
- "Monad Pay" was a winner in the 0x Mobil3 hackathon bounty (virtual debit card for spending ERC-20s at Visa merchants) — [0x blog](https://0x.org/post/monad-mobil3-hackathon-bounty-showcase); a Monad Foundation Notion page titled "MonadPay" exists but its contents could not be fetched — [Notion](https://monad-foundation.notion.site/MonadPay-2726367594f281238bf0ef9a2f0883b0)
- Monad payments ecosystem: on-ramp ecosystem, Coinflow, Rain (cards) and WalletConnect partnership — [Monad blog](https://monad.xyz/blog/monad-onramp-ecosystem); [Monad × Rain](https://monad.xyz/blog/rain-on-monad); [WalletConnect](https://walletconnect.com/blog/monad-and-walletconnect)
- MetaMask Money Account (June 30, 2026) is built on Monad — [stablecoininsider](https://stablecoininsider.org/stablecoin-wallets-2026-2027/) **[UNVERIFIED secondary]**

### Inferences
- "MonadPay" may be a foundation-level spec or initiative (for example a payment-link/QR standard) rather than an app. That could not be confirmed.
- "Base Pay" is real, but it is a Coinbase checkout feature, not a standalone P2P app.

### Gaps
- MonadPay Notion contents (it rendered empty to the fetcher). Whether MetaMask's Monad deployment is confirmed by a primary MetaMask/Consensys source.

---

## Q3. Grouping and what no app does yet

### Takeaway
There are six clusters: (1) chain-owner super-apps, (2) exchange Pay with national-QR bridges, (3) incumbents adding stablecoins behind existing handles, (4) card-first stablecoin neobanks, (5) cross-border P2P remitters, and (6) regional dollar-savings apps. No app yet offers a **portable, interoperable payment handle** that resolves across apps and chains the way a UPI VPA resolves across banks. No app combines **self-custody + merchant QR acceptance at local-scheme scale + built-in refunds/receipts**. India has no crypto-UPI at all.

### Cited Findings
Grouping (evidence in Q1):
1. **Chain-owner consumer apps:** World Money (World Chain, usernames + World ID) — [The Block](https://www.theblock.co/news/business/2026-09-17-world-launches-world-money-super-app-stablecoins-stripe-integration-boosted-rewards-415394); MiniPay (Celo, phone number) — [minipay.to](https://minipay.to/); Plasma One (Plasma, zero-fee USDT) — [Blockworks](https://blockworks.com/news/plasma-one-stablecoin-neobank); StablePay (Stable, phone/email/QR) — [PR Newswire](https://www.prnewswire.com/news-releases/stable-launches-stablepay-instant-zero-fee-global-payments-app-built-on-stablecoin-rails-302825737.html); Coinbase Wallet/Base — [The Block](https://www.theblock.co/news/defi/2026-09-10-coinbase-rebrands-base-app-back-to-coinbase-wallet-after-just-over-a-year-as-social-experiment-falls-short-414115)
2. **Exchange Pay + local QR bridges:** Binance Pay (PayPay Japan) — [MEXC](https://www.mexc.com/news/1073009); Bybit Pay (Pix, AEON, MoneyBadger) — [PR Newswire](https://www.prnewswire.com/news-releases/bybit-pay-expands-to-south-africa-with-moneybadger-enabling-nationwide-crypto-qr-payments-302755739.html); OKX Pay (10 markets) — [OKX](https://www.okx.com/en-us/help/okx-pay-scan-to-pay-guide)
3. **Incumbents, stablecoin behind the handle:** Venmo/PayPal PYUSD — [Venmo](https://help.venmo.com/cs/articles/cryptocurrency-faq-vhel141); Cash App USDC — [PYMNTS](https://www.pymnts.com/cryptocurrency/2026/cash-app-rolls-out-stablecoin-payments/); Nubank Nu Global — [Rio Times](https://www.riotimesonline.com/nubank-us-launch-nu-global-stablecoin-account-2026/); Revolut (US announced) — [PYMNTS](https://www.pymnts.com/news/banking/2026/revolut-wants-to-give-us-banking-customers-stablecoin-access/)
4. **Self-custody wallets turned payment apps:** Phantom Cash, MetaMask Money Account, Exodus Pay, Peanut, Trust Wallet — [Blockworks](https://blockworks.com/news/phantom-unveils-phantom-cash); [StockTitan](https://www.stocktitan.net/news/EXOD/exodus-launches-exodus-pay-to-let-users-spend-send-and-earn-rewards-ja8y0ky8z0rq.html)
5. **Card-first stablecoin neobanks:** RedotPay, KAST, ether.fi Cash, MiniPay Card — [CoinDesk](https://www.coindesk.com/business/2026/08/23/crypto-card-spending-tops-usd1-billion-as-stablecoins-move-into-everyday-purchases)
6. **Cross-border / regional dollar apps:** Sling, Zar, Airtm, Bitso, Lemon, Belo, El Dorado, Chipper, Sentz; Yellow Card retail shut — [Condia](https://thecondia.com/yellow-card-shutdown-retail-consumer-app-stablecoin/)

Evidence for white space:
- World Money username sends work only **to other World Money users** — [BitcoinEthereumNews](https://bitcoinethereumnews.com/tech/world-rolls-out-money-app-as-key-features-remain-country-limited/); Binance Pay's free transfers are only **Binance-to-Binance** — [Finovate](https://finovate.com/stable-launches-stablepay-to-bring-stablecoin-payments-to-the-mainstream/); Venmo's free transfers are only **Venmo/PayPal-internal**, and external crypto sends are irreversible with network fees — [Venmo help](https://help.venmo.com/hc/en-us/articles/16145303480595-Crypto-Transfers)
- Exchange QR acceptance is custodial and KYC-gated (Bybit: verified users outside restricted jurisdictions) — [PR Newswire Bybit SEA](https://www.prnewswire.com/news-releases/bybit-pay-bridges-web3-and-retail-payment-in-southeast-asia-302481061.html); self-custodial apps reach merchants mainly through Visa cards (MiniPay Card, Peanut, MetaMask Card) — [Opera](https://press.opera.com/2026/06/23/minipay-visa-debit-card/)
- External crypto sends are irreversible, and lost if misaddressed — [Venmo help](https://help.venmo.com/hc/en-us/articles/16145303480595-Crypto-Transfers)
- India: e₹ can use UPI QR, but no stablecoin/crypto app is UPI-interoperable — [productgrowth.in](https://productgrowth.in/insights/web3/digital-rupee-e-rupee-wallet-builders/)
- Merchant terminals: Ingenico enabled stablecoin acceptance in Jan 2026, but each shop must switch it on — [Finovate roundup](https://finovate.com/stable-launches-stablepay-to-bring-stablecoin-payments-to-the-mainstream/) **[secondary]**

### Inferences (what no app does yet)
1. **An interoperable handle registry (the UPI VPA equivalent).** Every handle is a walled garden: World usernames, Venmo @, $cashtags, MiniPay phone numbers, Binance Pay IDs, Basenames/ENS. None resolves cross-app to "whatever wallet/chain the recipient prefers". ENS/Basenames come closest technically but have no phone-number binding or merchant metadata. Partial exceptions prove the gap. **BIP-353 / Lightning Address** is a genuinely cross-provider handle@domain (UPI-VPA-like), but it is bitcoin-only and has uneven wallet support ([btrust](https://blog.btrust.tech/bip-353-a-more-reliable-protocol-level-way-to-share-bitcoin-payment-details/)). **Celo SocialConnect** is an on-chain phone directory, but attestations are issuer-scoped, so a number verified by MiniPay is not automatically resolvable by every other app ([Celo Docs](https://docs.celo.org/build-on-celo/build-on-minipay/overview)). **ERC-7828** (name.eth@chain) is a standard without shipped consumer sends. No stablecoin-on-EVM equivalent of handle@provider with a shared directory, KYC'd name confirmation ("pay to: verified merchant name") and chain-agnostic routing exists.
8. **One QR across bank and stablecoin rails.** Only demonstrated (X9.150 + Solana Pay demo, Oct 2026), not shipped ([Solana Compass](https://solanacompass.com/news/x9150-qr-code-payments-demo-at-money2020-lets-one-invoice-be-paid-over-fednow-rtp-or-usdc-on-solana)). Exchange Pay products bridge into Pix and PayPay one country at a time and custodially.
2. **Self-custodial merchant QR acceptance without a card network.** Merchant reach today means either Visa/Mastercard cards (2–3% interchange) or exchange custodial QR. No self-custodial app offers a merchant-side app with dynamic QR, settlement in local stablecoin, and **protocol-level refunds/receipts/disputes**. UPI has dispute and refund flows; external crypto sends are explicitly irreversible.
3. **Collect requests / mandates (UPI "collect" + AutoPay).** Peanut has request links, but I found no app with standardized pull-payment mandates (subscriptions, bill pay) that work across wallets.
4. **Cross-chain-transparent addressing.** Cash App accepts USDC on 4 chains, but the user still picks a network. Venmo warns that wrong-network sends are lost. No app abstracts the chain behind a single handle for *inbound* external payments.
5. **Offline / feature-phone payments** (UPI 123PAY, UPI Lite). No source found for any crypto app supporting USSD or offline.
6. **India-compliant crypto-UPI.** None exists. The only regulated "digital rupee on UPI QR" is the RBI e₹ pilot.
7. **Verified-human payments as a fraud/refund layer.** World ID is used only for earn boosts, not for payee verification, payment requests or dispute gating.

### Gaps
- No primary-source survey of whether any app ships pull-payment mandates, offline mode or refund primitives; the inferences above are from absence in the searched coverage.
- No independent volume comparison (Artemis/Dune) across these apps was retrieved.
