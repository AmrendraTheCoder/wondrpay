# Merchant-side stablecoin payment gateways, converters and payment infrastructure (as of Nov 2026)

Research method note: 15 tool calls (searches plus fetches of Stripe docs and one fee-comparison page). Many figures come from secondary comparison sites (eco.com, upshift.finance, aurpay, stablecoininsider, nowpayments blog), several of which are vendors with commercial interest. Where only secondary sources exist, this is flagged. Primary sources used: Stripe docs, Coinbase blog, Visa newsroom, Adyen H1 2026 results, BVNK blog, Circle blog, Fortune, Ledger Insights.

## 1. Large PSPs, acquirers and card networks (Stripe, Coinbase/Shopify, PayPal, Checkout.com, Shift4, Worldpay, Adyen, Visa, Mastercard)

### Takeaway
Mainstream PSPs now offer stablecoin acceptance with **fiat settlement by default** at roughly 1-1.5%, and the card networks use stablecoins for back-end settlement between issuers and acquirers. Stripe is the most complete (live acceptance, Bridge, Tempo chain, financial accounts). Coinbase/Shopify is live for USDC on Base. Adyen has announced nothing merchant-facing beyond joining consortia.

### Cited Findings
**Stripe / Bridge / Tempo**
- Stripe stablecoin payments: customers pay USDC on Tempo, Ethereum, Solana, Polygon and Base; USDP (Ethereum, Solana; US only) and USDG (Ethereum; US only). Payments **settle to the Stripe balance in the merchant's local currency**. Presentment is USD (other currencies in private preview). Supports Checkout, Elements, Billing (subscriptions), Connect, Invoicing and Payment Links. Customer pays via redirect to crypto.stripe.com. — [Stripe Docs](https://docs.stripe.com/payments/stablecoin-payments)
- Stripe merchant eligibility: generally available to US businesses; **private preview** for EU, Hong Kong, Mexico, Switzerland (plus listed EEA countries, NO, LI, GI). — [Stripe Docs](https://docs.stripe.com/payments/stablecoin-payments)
- Stripe refunds: full and partial refunds supported, always returned as stablecoin to the customer's original wallet. **No disputes/chargebacks.** No manual capture. Limit of US$10,000 per transaction. Payout timing "varies by network". — [Stripe Docs](https://docs.stripe.com/payments/stablecoin-payments)
- Stripe balances support OUSD and USDC; Tempo transfers use USDC.e. — [Stripe Docs](https://docs.stripe.com/payments/stablecoin-payments)
- Fee: 1.5% of transaction (reported from Stripe pricing page as of 14 Oct 2026), said to cover conversion, AML screening and gas; one source reports an additional 0.5% FX fee where applicable (not confirmed by others). Card comparison commonly cited at ~2.9% + 30c. — [eco.com](https://eco.com/support/en/articles/15083174-stripe-stablecoin-payments-2026); [GL Insight](https://www.glinsight.com/stripes-vertical-stablecoin-stack-bridge-tempo-and-a-1-5-take-rate/); [eco.com fee comparison](https://eco.com/support/en/articles/14895614-stablecoin-payment-processor-fees-compared-2026)
- Tempo (Stripe + Paradigm payments L1) reported mainnet in March 2026 alongside the Machine Payments Protocol (MPP) for agent payments. Report that Stripe covers gas on Tempo via MPP is **unverified** (secondary post; original tweet deleted). — [Upshift](https://www.upshift.finance/blog/stripe-stablecoin-payments); [TradersUnion](https://tradersunion.com/news/market-voices/show/3595408-stripe-covers-gas-fees/)
- Stripe acquired Bridge (Feb 2025, ~US$1.1B). Stablecoin Financial Accounts launched in 101 countries (May 2025; launch date reported as 7 or 20 May), excluding major markets such as Nigeria, Ghana, South Africa. Bridge's USDB is a default balance asset with USDC. — [Ledger Insights](https://www.ledgerinsights.com/stripe-rolls-out-stablecoin-accounts-in-101-countries-as-bridge-launches-usdb/); [Mariblock](https://www.mariblock.com/stories/stablecoin-financial-accounts-how-stripe-is-marrying-crypto-and-fiat-in-one-payment-feature); [Stripe Sessions 2025](https://stripe.com/newsroom/news/sessions-2025)
- Bridge has **preliminary conditional** OCC national trust bank approval (not final); Open Issuance lets businesses issue their own stablecoins (launch date reported as Sept or Nov 2025). — [private.law wiki](https://wiki.private.law/en/bridge-stripe); [eco.com Bridge stack](https://eco.com/support/en/articles/15346533-bridge-stablecoin-stack-from-usdb-to-mgusd)

**Coinbase / Base / Shopify**
- Coinbase and Shopify: USDC on Base through Shopify Payments for eligible merchants; merchants can cash out in local currency or receive USDC on Base; Coinbase Payments executes and sponsors gas; Shopify offered customers 1% USDC cash back at no merchant cost. — [Coinbase blog](https://www.coinbase.com/blog/coinbase-and-shopify-bring-usdc-payments-on-base-to-millions-of-merchants-worldwide)
- Merchant rate for Shopify USDC is **unclear**: one source says standard Shopify Payments fees apply; a comparison site cites ~1%. — [eco.com Shopify guide](https://eco.com/support/en/articles/14895617-how-to-accept-stablecoins-on-shopify-complete-merchant-guide-2026); [aurpay](https://aurpay.net/aurspace/best-crypto-payment-gateway-shopify-2026/)
- Commerce Payments Protocol (Coinbase/Shopify on Base) reported topping US$42M volume (secondary). — [Crypto Briefing](https://cryptobriefing.com/stablecoin-payment-protocol-shopify-coinbase/)
- Coinbase Commerce: 1% flat cited; legacy self-custodial product reportedly shut 31 Mar 2026 for merchants outside US/Singapore with migration to Coinbase Business (secondary; **unverified**). Coinbase Business fee "not published". — [eco.com comparison](https://eco.com/support/en/articles/14895621-coinbase-commerce-vs-bitpay-vs-crossmint-stablecoin-checkout-compared); [eco.com fee comparison](https://eco.com/support/en/articles/14895614-stablecoin-payment-processor-fees-compared-2026)

**PayPal**
- "Pay with Crypto" (launched July 2025): US merchants only (excludes New York), 100+ cryptos accepted, auto-converted to USD or PYUSD; 0.99% promo for year one then 1.5% (promo reportedly ended 31 Jul 2026, so 1.5% likely current — **not confirmed on a current PayPal page**). PYUSD holdings rewards ~4% at launch, subject to change. — [SiliconANGLE](https://siliconangle.com/2025/07/28/paypal-expands-crypto-payments-us-merchants-lower-cross-border-fees/); [stablecoininsider](https://stablecoininsider.org/how-to-enable-paypal-pay-with-crypto/); [Yellow](https://yellow.com/news/paypal-launches-cryptocurrency-payment-service-with-90-fee-reduction-for-merchants)
- PYUSD is issued by Paxos. — [eco.com enterprise rails](https://eco.com/support/en/articles/15261552-top-stablecoin-payment-rails-for-enterprises-2026)

**Checkout.com, Shift4, Worldpay, Adyen**
- Checkout.com (June 2026): stablecoin acceptance via Coinbase Payments and US stablecoin settlement via Fireblocks, 24/7/365 to merchant wallets (secondary summary). — [Spark research](https://www.spark.money/research/payment-processor-stablecoin-integration)
- Shift4 (Dec 2025): opt-in merchant settlement in USDC, USDT, EURC, DAI across multiple chains (incl. Polygon), 24/7; pricing not disclosed. — [Investing.com](https://www.investing.com/news/company-news/shift4-launches-stablecoin-settlement-platform-for-merchants-93CH-4419273); [Polygon blog](https://polygon.technology/blog/shift4-brings-24-7-stablecoin-payments-to-global-commerce-on-polygon)
- Worldpay and Nuvei were Visa USDC settlement acquirer partners from 2023; Worldpay says it lets it bring treasury in-house and give merchants more payout options. — [Payments Dive](https://www.paymentsdive.com/news/visa-stablecoin-digital-payments-cryptocurrency-circle-ethereum-solana-worldpay-nuvei/692701/)
- Adyen: H1 2026 results say it joined the x402 Foundation and the Open Standard / OpenUSD consortium for stablecoin infrastructure; **no merchant stablecoin acceptance or settlement launch found**. — [Adyen H1 2026](https://www.adyen.com/press-and-media/adyen-publishes-h1-2026-financial-results-3wjne); [Payments Dive](https://www.paymentsdive.com/news/stablecoin-open-standard-bridge-abrams-bny-stripe-mastercard-visa-coinbase-adyen/824223/)

**Visa and Mastercard**
- Visa: stablecoin settlement pilot since 2021; US settlement launched late 2025; ~US$7B annualized run rate across nine chains (reported 29 Apr 2026); further pilot expansion announced. Run-rate figures conflict across sources (US$3.5B, US$4.6B earlier). — [Transak blog](https://transak.com/blog/visa-mastercard-stablecoin-settlement); [Visa newsroom](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.22491.html)
- Mastercard: 3 Jun 2026 announced settlement across eight chains incl. weekends/holidays (USDC, PYUSD, USDG, RLUSD, SoFiUSD cited); acquired BVNK (see section 3). — [Transak blog](https://transak.com/blog/visa-mastercard-stablecoin-settlement); [Blindpay](https://blindpay.com/resources/more/visa-mastercard-stablecoin-settlement)
- Network settlement is back-office (issuer/acquirer), not consumer checkout. — [insights4vc](https://insights4vc.substack.com/p/the-state-of-stablecoin-cards)

### Inferences
- The incumbent model is "accept stablecoin, settle fiat, merchant never touches crypto". Merchants wanting to **hold** stablecoin balances have fewer options (Stripe financial accounts, Shopify USDC-to-wallet, Shift4, Checkout.com via Fireblocks).
- 1-1.5% is the emerging incumbent price point: roughly half of card MDR, with no chargebacks.
- Geographic coverage of the big PSPs is still US-first; EU/HK/MX are in preview at Stripe; PayPal is US-only.

### Gaps
- Shopify's exact merchant rate for USDC and its country list could not be confirmed from Shopify docs.
- Checkout.com and Worldpay merchant pricing for stablecoin products not found.
- Coinbase Payments / Base Pay merchant-facing fee schedule not found from a primary source.

## 2. Crypto-native merchant gateways (BitPay, NOWPayments, CoinGate, CoinPayments, Triple-A, MoonPay Commerce/Helio, Request Finance, Whitepay)

### Takeaway
Crypto-native gateways charge 0.5-2% headline but add conversion, payout and network fees; they support many coins and chains and offer plugins, but compete on breadth rather than on regulated fiat settlement. BitPay is the most expensive for small merchants.

### Cited Findings
- BitPay: 2% + $0.25 (<$500K/month), 1.5% + $0.25 ($500K-$999,999), 1% + $0.25 ($1M+); settles USD/EUR/GBP/CAD bank, USDC or BTC; minimums $1,000 wire, $100 ACH. — [eco.com fee comparison](https://eco.com/support/en/articles/14895614-stablecoin-payment-processor-fees-compared-2026); [Upshift](https://www.upshift.finance/blog/best-crypto-payment-gateways)
- CoinGate: 1% flat (Standard plan), no setup/monthly fees, but payout fees can exceed the transaction fee at low volume. — [aurpay](https://aurpay.net/aurspace/crypto-payment-gateway-fees-compared-2026/); [stablecoininsider](https://stablecoininsider.org/bitpay-alternatives/)
- NOWPayments: 0.5% same-coin, +0.5% with auto-conversion (sources vary: 0.3-1.5%); very broad coin support. — [NOWPayments blog](https://nowpayments.io/blog/best-bitpay-alternatives); [aurpay](https://aurpay.net/aurspace/crypto-payment-gateway-fees-compared-2026/)
- CoinPayments: 0.5-1% processing plus conversion-partner, network and potential recovery fees. — [aurpay](https://aurpay.net/aurspace/crypto-payment-gateway-fees-compared-2026/)
- Triple-A: described as MAS-licensed (Singapore); customers pay stablecoin, merchants receive USD/EUR/GBP or 30+ local currencies (claims partly from Triple-A's own blog). — [Triple-A blog](https://www.triple-a.io/blog/best-crypto-payment-gateways); [stablecoininsider](https://stablecoininsider.org/best-stablecoin-payment-ap-is/)
- MoonPay Commerce (formerly Helio; acquired for reported ~US$175M): USDC/USDT on Solana and EVM; settle crypto or fiat (USD/EUR/GBP); fee reported as 2% (1% for HelioX pass holders) or "no public rate card" — **conflicting**. — [Architect Partners](https://architectpartners.com/moonpay-acquires-helio-for-a-reported-175m/); [eco.com processors](https://eco.com/support/en/articles/14797799-stablecoin-payment-processors-compared-2026); [eco.com fee comparison](https://eco.com/support/en/articles/14895614-stablecoin-payment-processor-fees-compared-2026)
- Request Finance: B2B invoicing/payables and treasury stack for stablecoins; no licensing details found. — [stablecoininsider](https://stablecoininsider.org/best-stablecoin-payment-ap-is/)
- Crossmint: custom quotes; nine chains (Solana, Ethereum, Base, Polygon, Arbitrum, Optimism, Cardano, Aptos, Sui); card-funded paths carry chargebacks and higher pricing. — [eco.com fee comparison](https://eco.com/support/en/articles/14895614-stablecoin-payment-processor-fees-compared-2026)
- Whitepay (W Group / WhiteBIT ecosystem): crypto acquiring, accept and convert across 200+ assets; listed as a W Group milestone. Fees of 0.4-1.5% cited only in a third-party GitHub comparison (**unverified**). No evidence Whitepay itself runs on Whitechain (W Group's L2); Whitechain merchant checkouts found are ETHGlobal hackathon testnet projects (chain 1874 testnet / 1875 mainnet). — [Whitepay](https://whitepay.com/news/accept-crypto-payments-with-fast-and-secure-crypto-payment-gateway-or-whitepay); [W Group](https://www.w.group/); [GitHub whiteflow](https://github.com/Vishal4742/whiteflow)
- Integrations: comparison guides list Shopify, WooCommerce and API/plugins as standard for BitPay, CoinGate, NOWPayments, CoinPayments (secondary). — [aurpay Shopify](https://aurpay.net/aurspace/best-crypto-payment-gateway-shopify-2026/); [Upshift](https://www.upshift.finance/blog/best-crypto-payment-gateways)
- MiCA is a differentiator in EU gateway comparisons. — [orsunpay](https://orsunpay.com/compare/crypto-payment-gateways/)

### Inferences
- "All-in" cost at crypto-native gateways is often above the 1-1.5% headline once conversion and payout fees are counted, so incumbents (Stripe 1.5% all-in incl. gas) are now price-competitive.
- None of these gateways shows clear refund tooling beyond manual on-chain returns (not documented in sources).

### Gaps
- Verified current pricing pages for NOWPayments, CoinGate, CoinPayments, Triple-A were not fetched directly.
- Whitepay official fee schedule, settlement currencies and licensing not found.
- Funding/scale figures for CoinGate, NOWPayments, CoinPayments, Triple-A, Request Finance not found.

## 3. B2B stablecoin infrastructure, issuers and rails (Circle CPN/Mint, Paxos, BVNK, Mesh, Conduit, Rain, Bitso Business)

### Takeaway
2026 consolidation: Mastercard bought BVNK; Stripe owns Bridge; Rain reached a US$1.95B valuation; Circle runs CPN as a bank/PSP network. These players sell to platforms and enterprises, not to small merchants directly.

### Cited Findings
- BVNK: Mastercard agreed to acquire for up to US$1.8B; one source says closed 3 Aug 2026, another (older) says pending approval — **date conflict**. BVNK reports US$30B annualized stablecoin payment volume; prior US$50M Series B (valuation US$750M **unverified**). — [eco.com BVNK alternatives](https://eco.com/support/en/articles/16300922-bvnk-alternatives-b2b-stablecoin-payment-infrastructure-compared); [BVNK blog](https://www.bvnk.com/blog/stablecoins-core-financial-infrastructure-2025); [BVNK Series B](https://www.bvnk.com/blog/series-b-fuel-next-era-of-stablecoin-payments)
- Rain: US$1.95B valuation (Jan 2026 round); added Mastercard card issuance in May 2026 after Visa-only. — [Fortune](https://fortune.com/2026/05/04/mastercard-rain-stablecoin-startup-institutional-customers-partnership/)
- Circle: IPO 5 Jun 2025 (NYSE: CRCL); CPN mainnet May 2025, operated by Circle Technology Services LLC; CPN reported US$3.4B annualized volume in 2026. Circle Mint is the institutional USDC mint/redeem service. — [Fintech Wrap Up](https://www.fintechwrapup.com/p/deep-dive-inside-circles-payments); [Circle blog](https://www.circle.com/blog/building-the-internet-financial-system-circles-product-vision-for-2026); [Frame](https://frame.xyz/insights/stablecoin-infrastructure-providers/)
- Paxos: NYDFS-regulated trust; issues USDP, PYUSD, white-label stablecoins; runs Global Dollar Network (USDG) which Mesh joined in May 2026. — [eco.com enterprise rails](https://eco.com/support/en/articles/15261552-top-stablecoin-payment-rails-for-enterprises-2026)
- Mesh: US$75M Series C at US$1B valuation per one source vs US$131M raised / US$1.8-2.0B valuation per a tracker — **conflict**; expanded USDC settlement with Circle (Apr 2026). — [newmarketpitch tracker](https://newmarketpitch.com/blogs/news/stablecoin-payments-top-startups-valuation); [eco.com enterprise rails](https://eco.com/support/en/articles/15261552-top-stablecoin-payment-rails-for-enterprises-2026)
- Conduit: cross-border B2B stablecoin payments (emerging-market corridors); US$36M Series A (Dragonfly, Altos), 2025. — [newmarketpitch deals](https://newmarketpitch.com/blogs/news/stablecoin-payments-list-deals); [Upshift payouts](https://www.upshift.finance/blog/stablecoin-payout-apis)
- Bitso: grouped in LatAm/Africa stablecoin cohort that raised ~US$621M combined (not Bitso alone). — [newmarketpitch fundraising](https://newmarketpitch.com/blogs/news/stablecoin-payments-top-startups-fundraising)

### Inferences
- Infrastructure is consolidating into card networks and large PSPs; independents (Conduit, Mesh, Rain) are acquisition targets.

### Gaps
- Bitso Business pricing, Circle CPN fees, Paxos funding in 2026 not found.

## 4. Fiat on/off-ramps and stablecoin-to-fiat converters (Transak, MoonPay, Ramp, Banxa, Alchemy Pay, Onramp.money)

### Takeaway
Ramps cost ~0.5-2% for bank rails and 2-6% total with cards; licensing is a patchwork; India coverage is thin and legally risky.

### Cited Findings
- MoonPay: ~1% bank transfer up to 4.5% offramp; offramp 1% + network fee, $3.99 minimum (sources conflict). — [Spark comparison](https://www.spark.money/tools/crypto-on-ramp-comparison); [Spritz](https://www.spritz.finance/blog/crypto-offramp-api-comparison)
- Transak: ~1% base offramp (0.99-1.99% by method); registrations EU VASP (Poland), FCA, US MSB, FINTRAC, AUSTRAC, FIU-IND. — [eco.com offramps](https://eco.com/support/en/articles/15210579-best-stablecoin-offramps-2026-cash-out-routes-compared); [Spark comparison](https://www.spark.money/tools/crypto-on-ramp-comparison)
- Ramp: 0.49-2.9% by method and region. — [Spark comparison](https://www.spark.money/tools/crypto-on-ramp-comparison)
- Banxa: card ~1.99% + spread (4-6% total); reportedly acquired by OSL Group (Jan 2026). — [cleansky](https://cleansky.io/blog/crypto-onramps-compared-moonpay-banxa-bitso-2026/); [utorg](https://utorg.com/learn/best-crypto-on-ramps-in-2026)
- Alchemy Pay: US coverage limited to 19 states with money transmitter licenses (mid-2026, per a competitor); supports XSGD, AUSD, RLUSD, USDC. — [Crossmint](https://www.crossmint.com/learn/moonpay-alternatives)
- Onramp.money (Buyhatke Internet Pvt Ltd): FIU-IND registered (company/vendor claims); 350+ tokens, 30+ countries; India desk is OTC for institutions/HNIs with INR via IMPS/NEFT/RTGS, not a merchant product. India's ED named Buyhatke in a cross-border crypto/FEMA probe (status unconfirmed). — [XFlowPay](https://www.xflowpay.com/blog/best-stablecoin-off-ramp-platforms-india); [CXOToday](https://cxotoday.com/press-release/kucoin-partners-with-onramp-money-in-india-emerging-markets-fiu-india-registered-partners/); [Cryptonewsnavigator](https://www.cryptonewsnavigator.com/news/cryptopolitan/indias-ed-targets-on-rampoff-ramp-firms-in-cross-border-crypto-probe-64290264)
- Coinbase plans India fiat on-ramp by 2026 (announced). — [Crypto Briefing](https://cryptobriefing.com/coinbase-india-relaunch-fiat-onramp/?rand=59535)

### Gaps
- Onramp.money fees; India-specific licensing for MoonPay, Ramp, Banxa not found.

## 5. Typical economics: fees vs cards, settlement times, refunds/chargebacks, FX

### Takeaway
Stablecoin acceptance costs 0.5-2% vs ~2.9% + 30c for online cards, with no chargebacks; but refunds are push-only to the original wallet, FX adds ~0.5%, and fiat settlement still rides slow bank rails.

### Cited Findings
- Stripe 1.5% vs ~2.9% card; Stripe card disputes cost $15 received + $15 countered, stablecoin payments have no disputes. — [eco.com fee comparison](https://eco.com/support/en/articles/14895614-stablecoin-payment-processor-fees-compared-2026); [Stripe Docs](https://docs.stripe.com/payments/stablecoin-payments)
- Pure stablecoin checkouts have no chargebacks as they are final at chain finality; card-funded crypto paths keep chargebacks. — [eco.com fee comparison](https://eco.com/support/en/articles/14895614-stablecoin-payment-processor-fees-compared-2026)
- Refunds at Stripe go back as stablecoin to the original wallet; partial refunds supported. — [Stripe Docs](https://docs.stripe.com/payments/stablecoin-payments)
- Fiat payout by ACH takes 2-3 business days; Shift4, Checkout.com and Mastercard advertise 24/7/weekend stablecoin settlement. — [eco.com fee comparison](https://eco.com/support/en/articles/14895614-stablecoin-payment-processor-fees-compared-2026); [Polygon blog](https://polygon.technology/blog/shift4-brings-24-7-stablecoin-payments-to-global-commerce-on-polygon); [Transak blog](https://transak.com/blog/visa-mastercard-stablecoin-settlement)
- FX: Stripe reportedly adds 0.5% (unconfirmed); NOWPayments +0.5% for auto-conversion. — [GL Insight](https://www.glinsight.com/stripes-vertical-stablecoin-stack-bridge-tempo-and-a-1-5-take-rate/); [aurpay](https://aurpay.net/aurspace/crypto-payment-gateway-fees-compared-2026/)

### Gaps
- No primary-source per-provider settlement-time table; most providers do not publish refund workflows.

## 6. Gaps a new entrant could fill

### Takeaway
Openings exist in non-US/EU merchant coverage (India, Africa, SEA), merchant-held stablecoin balances with on-chain receipts, structured refund/dispute flows, transparent all-in pricing for small merchants, and agent/machine payments outside Stripe's Tempo.

### Cited Findings
- Stripe acceptance is GA only for US businesses (EU/HK/MX in preview); PayPal is US-only, excluding NY. — [Stripe Docs](https://docs.stripe.com/payments/stablecoin-payments); [SiliconANGLE](https://siliconangle.com/2025/07/28/paypal-expands-crypto-payments-us-merchants-lower-cross-border-fees/)
- Stripe financial accounts exclude Nigeria, Ghana, South Africa. — [Mariblock](https://www.mariblock.com/stories/stablecoin-financial-accounts-how-stripe-is-marrying-crypto-and-fiat-in-one-payment-feature)
- India: no merchant-grade stablecoin product found; best-known ramp under ED probe. — [XFlowPay](https://www.xflowpay.com/blog/best-stablecoin-off-ramp-platforms-india); [Cryptonewsnavigator](https://www.cryptonewsnavigator.com/news/cryptopolitan/indias-ed-targets-on-rampoff-ramp-firms-in-cross-border-crypto-probe-64290264)
- Crypto-native gateways' hidden payout/conversion fees (CoinGate, CoinPayments). — [aurpay](https://aurpay.net/aurspace/crypto-payment-gateway-fees-compared-2026/)
- Stripe has no dispute mechanism for stablecoin payments and refunds are merchant-initiated only. — [Stripe Docs](https://docs.stripe.com/payments/stablecoin-payments)
- Agentic payment standards (x402, MPP) are being joined by Adyen and Stripe. — [Adyen H1 2026](https://www.adyen.com/press-and-media/adyen-publishes-h1-2026-financial-results-3wjne); [Upshift](https://www.upshift.finance/blog/stripe-stablecoin-payments)

### Inferences
- A buyer-protection layer (refund requests, escrow, dispute arbitration) for final on-chain payments is not offered by any incumbent found, which is a real differentiator.
- Gasless USDT checkout matters in markets where USDT dominates (most incumbents are USDC-centric: Stripe, Coinbase/Shopify, Circle).
- Incumbent coverage on newer L2s (e.g. Whitechain) is absent; the only Whitechain merchant tools are hackathon projects.
- Price pressure: entering above 1% all-in is hard given Stripe/PayPal at 1.5% with fiat settlement and Shopify reportedly ~1%.

### Gaps
- No market sizing for under-served regions; no data on merchant demand for refund protection in stablecoin checkout.
