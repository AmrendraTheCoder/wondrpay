# AI / Agentic Payments and the Funding + Regulatory Landscape for Stablecoin Payment Startups (as of 9 Nov 2026)

Method note: about 15 searches and fetches. Primary sources fetched or confirmed: the OCC release on GENIUS Act rules, Mastercard's investor release on closing BVNK, and the Linux Foundation release on the x402 Foundation. Much of the agentic-payments material comes from vendor comparison blogs (ATXP, Nevermined, Crossmint, FluxA), and those vendors have a stake in how the comparison reads. Unverified items are flagged inline. Several search results carried dates after 9 Nov 2026 or contradicted each other, and those are called out where they occur.

## 1. Agentic payment standards and products: identity, spending limits, mandates, stablecoins

### Takeaway
By late 2026 agentic payments form a layered stack:
- **Agent identity and authorization:** Visa Trusted Agent Protocol, Mastercard Agentic Tokens / Verifiable Intent, Skyfire KYA, Catena ACK-ID.
- **User mandate / proof of intent:** Google AP2, which now sits under the FIDO Alliance.
- **Checkout:** OpenAI + Stripe ACP, and Stripe/Tempo MPP.
- **Settlement:** x402 for stablecoins over HTTP, now governed by a Linux Foundation body that Visa, Mastercard, Google, Stripe, AWS and Shopify belong to.

Card networks have shipped live agent products. Stablecoin settlement goes mainly through x402. Consumer-facing "agent checkout" inside chatbots has had a rocky start.

### Cited Findings
**x402 (Coinbase, now Linux Foundation)**
- The Linux Foundation launched the x402 Foundation on 2 April 2026 with about 40 members. Coinbase contributed the protocol, and the foundation was initially developed by Coinbase, Cloudflare and Stripe. Coinbase and Cloudflare first announced the plan in September 2025. — [Linux Foundation press release](https://www.linuxfoundation.org/press/linux-foundation-is-launching-the-x402-foundation-and-welcoming-the-contribution-of-the-x402-protocol); [CFOtech](https://cfotech.news/story/linux-foundation-launches-x402-foundation-with-40-members)
- Coinbase docs name these premier members: AWS, American Express, Cloudflare, Coinbase, Google, Mastercard, Shopify, Solana Foundation, Stripe, Visa. Other reports also list Adyen, Circle, Fiserv, MoonPay and Ripple, so the member lists differ by source. — [Coinbase CDP docs](https://docs.cdp.coinbase.com/x402/support/x402-foundation); [KuCoin news](https://www.kucoin.com/news/flash/linux-foundation-launches-x402-foundation-with-visa-mastercard-among-founding-members)
- x402 revives HTTP 402 to gate APIs and content behind onchain micropayments. It is chain-agnostic, launched on Base with USDC, and Ripple supports it on XRPL. It has no fiat path. — [The Defiant](https://thedefiant.io/coinbase-x402-payment-protocol-moves-to-linux-foundation); [ATXP comparison](https://atxp.ai/blog/mastercard-agent-pay-stripe-acp-visa-x402-comparison-2026/)
- Usage claims are unverified and vary: "165M+ x402 transactions across 69,000 active agents by April", with market skepticism that about half of it is testing ([Applied Technology Index](https://appliedtechnologyindex.com/research/2026-comparative-analysis-agentic-commerce-payment-protocols/) / [eco.com](https://eco.com/support/en/articles/14839400-what-is-agentic-commerce-the-2026-guide)). Another blog says "over $600M volume by April 2026" ([stellagent](https://stellagent.ai/insights/stablecoin-agentic-finance)). Neither figure comes from a primary source.
- x402 is described as AP2's stablecoin/crypto extension. — [Crossmint protocol comparison](https://www.crossmint.com/learn/agentic-payments-protocols-compared) (secondary)

**Google AP2 (Agent Payments Protocol) / UCP**
- AP2 records the human's consent, or mandate, and runs on A2A authorization. ACP runs the checkout. One comparison describes AP2/UCP as "beta, partner-gated", aimed at the infrastructure layer rather than clearing. — [ATXP](https://atxp.ai/blog/mastercard-agent-pay-stripe-acp-visa-x402-comparison-2026/); [Openfort](https://www.openfort.io/blog/agentic-payments-landscape)
- AP2 v0.2 was reportedly donated to the FIDO Alliance on 28 April 2026. Only secondary sources report this. — [Crossmint](https://www.crossmint.com/learn/agentic-payments-protocols-compared)
- I could not confirm the Intent Mandate and Cart Mandate details from a primary 2026 source in this pass (see Gaps).

**Stripe + OpenAI: Agentic Commerce Protocol (ACP) / Instant Checkout; Stripe + Tempo: MPP**
- Stripe ACP issues Shared Payment Tokens scoped to one merchant, one session and one amount range, and they expire after use. It has no crypto support. Stripe's agentic commerce suite moved from preview to live in Q1 2026. — [ATXP](https://atxp.ai/blog/mastercard-agent-pay-stripe-acp-visa-x402-comparison-2026/)
- Several secondary sources say OpenAI scaled back or wound down the standalone Instant Checkout in March 2026, reportedly with fewer than about 15 Shopify merchants live, and pivoted to an app-based model. Another source cites "over 1M Shopify merchants live" from an April 2026 OpenAI index. These conflict and remain unresolved. — [Crossmint](https://www.crossmint.com/learn/agentic-payments-protocols-compared); [Vaaya](https://vaaya.ai/blog/ai-agent-payment-protocols-compared)
- Stripe and Tempo reportedly launched MPP (Machine Payments Protocol) in March 2026 alongside the Tempo mainnet. Tempo is a payments L1 with no native gas token, and MPP settles in stablecoins or cards via Stripe. I found no primary announcement. — [Openfort](https://www.openfort.io/blog/agentic-payments-landscape); [Blockleaders](https://blockleaders.io/ai-agent-payment-protocols-compared/)
- PayPal is reported to have an OpenAI agent checkout / PYUSD tie-in in April 2026. This comes from a blog only. — [BlockEden](https://blockeden.xyz/blog/2026/04/11/paypal-openai-agent-checkout-protocol-pyusd-agentic-commerce/)

**Visa Intelligent Commerce**
- Visa extends its tokenization and network to agents. The Trusted Agent Protocol, built with Cloudflare, handles agent identity and authorization. Visa reports more than 100 partners and 30 sandbox builders, with broad availability expected later in 2026. One vendor alone claims TAP is aligned with ACP and x402. — [ATXP](https://atxp.ai/blog/mastercard-agent-pay-stripe-acp-visa-x402-comparison-2026/)
- Visa's FY2026 10-K lists GenAI, stablecoins and agentic commerce as next-generation investment areas. — [Visa 10-K FY2026 (SEC)](https://www.sec.gov/Archives/edgar/data/0001403161/000140316126000134/v-20260930.htm)

**Mastercard Agent Pay**
- Agent Pay went live in Q1 2026 alongside the enterprise "Agent Suite". It uses Agentic Tokens scoped per agent and per session. Verifiable Intent requires verifiable proof of authorization, and a purchase over the user's set limit is blocked at the network without a fresh authorization. — [ATXP](https://atxp.ai/blog/mastercard-agent-pay-stripe-acp-visa-x402-comparison-2026/)
- Mastercard is described as the first network to enable all US cardholders for agent-initiated payments. Santander and Mastercard ran what is reported as Europe's first live end-to-end agent payment in March 2026, a vendor-sourced claim. — [Applied Technology Index](https://appliedtechnologyindex.com/research/2026-comparative-analysis-agentic-commerce-payment-protocols/); [ATXP](https://atxp.ai/blog/mastercard-agent-pay-stripe-acp-visa-x402-comparison-2026/)
- An "Agent Pay for Machines" early access dated 20 Oct appeared in one result. The date could not be verified, so treat it as unconfirmed. — [Applied Technology Index](https://appliedtechnologyindex.com/research/2026-comparative-analysis-agentic-commerce-payment-protocols/)

**PayPal**
- PayPal's open-source Agent Toolkit wraps its REST APIs as agent tools. It covers agents acting for PayPal account holders, but not agent-to-agent settlement or payees without a PayPal account. Secondary sources put PYUSD's market cap at about $500M in early 2026. — [eco.com PayPal explainer](https://eco.com/support/en/articles/14730447-paypal-agentic-commerce-explained)

**Agent-native startups**
- **Skyfire:** Builds "Know Your Agent" (KYA) identity plus the KYAPay protocol, reported in production since June 2025. Funding is reported as $8.5M or $9.5M seed from a16z CSX and Coinbase Ventures; sources conflict. — [gigs.sh field guide](https://gigs.sh/blog/agent-to-agent-payments); [Nevermined blog](https://nevermined.ai/blog/skyfire-alternatives)
- **Catena Labs:** Founded by Circle co-founder Sean Neville. Raised an $18M seed led by a16z crypto with Coinbase Ventures and Circle Ventures, around May 2025. Released the open-source Agent Commerce Kit, with ACK-ID for identity and ACK-Pay for payments, and ACK-Lab is in dev preview. It aims to be an "AI-native financial institution". — [stellagent](https://stellagent.ai/insights/stablecoin-agentic-finance); [useproxy](https://www.useproxy.ai/blog/ai-agent-payments-landscape-2026)
- **Crossmint:** Offers agent wallets with spending limits plus virtual Visa and Mastercard cards for traditional acceptance. No funding figures were found. — [FluxA](https://fluxapay.xyz/learning/ai-agent-wallets-2026-fluxa-skyfire-coinbase-crossmint)
- **Nevermined:** Raised $4M in January 2025, about $7M total. In April 2026 it integrated Visa Intelligent Commerce, x402 and VGS so agents can buy with delegated Visa cards. — [Inside Deep Tech](https://www.insidedeeptech.com/nevermined-review/)
- **Payman:** A developer-first agent payments API founded in 2024. No funding figures were found. — [useproxy](https://www.useproxy.ai/blog/ai-agent-payments-landscape-2026)
- **Agentic Commerce Consortium:** Formed by Basis Theory in September 2025. Skyfire, Crossmint and Nevermined are members. — [Nevermined blog](https://nevermined.ai/blog/best-platforms-agentic-payments)
- **IMF:** An IMF note (2026, Issue 004) says current agentic implementations mostly help users find and compare products, and that pilots are widening into fraud and compliance. — [IMF Notes 2026/004](https://www.elibrary.imf.org/view/journals/068/2026/004/article-A001-en.xml)

### Inferences
- The common pattern across rails for safe agent spending is: a scoped credential (per agent, per session, per merchant), a user-signed mandate with an explicit cap, step-up re-authorization above the cap, and agent identity attestation. A "UPI for stablecoins" app can copy this: an agent sub-wallet or session key with a per-tx, daily and per-merchant cap, a signed intent such as EIP-712, biometric step-up above the cap, and x402 support so agents can pay APIs.
- For stablecoin settlement, x402 is the default bet: it is Linux Foundation governed and both card networks belong to it. AP2 handles the consent record, which is complementary. Supporting x402 as payer and payee, plus AP2-style mandates, gives the widest interoperability.
- The reported problems with OpenAI Instant Checkout suggest consumer "buy inside chat" demand is unproven. Machine-to-machine and API micropayments, and B2B agent spend, have clearer early traction, though volume claims are still inflated by testing.

### Gaps
- No primary-source details on AP2 Intent and Cart Mandates or the FIDO handover. Google and FIDO pages were not fetched.
- No primary confirmation of the Tempo mainnet or MPP launch date. Tempo's Series A (Oct 2025) is covered in section 3.
- The Coinbase AgentKit / "Agentic Wallets" product status in 2026 was not confirmed. The search found nothing specific.
- No data found on Halliday, Payman funding, Crossmint funding, or any 2026 Skyfire or Catena raise.
- No reliable source on x402 transaction counts or volume. Both figures above come from secondary blogs.

## 2. Consumer AI features in payment and finance apps, and evidence of adoption

### Takeaway
The clearest large-scale consumer example found is Revolut's in-app assistant AIR. It launched to about 13M UK users in April 2026, expanded across Europe by September 2026, and requires biometric approval for sensitive actions. Fraud detection is the most widely deployed AI use, but adoption is uneven because of false-positive fears. Evidence on natural-language payments, bill negotiation, auto-savings and voice payments was thin in this pass.

### Cited Findings
- Revolut began rolling out AIR to its roughly 13M UK customers on 9 April 2026. AIR covers spending insights, card controls, investment tracking and subscriptions through chat. — [FinTech Weekly](https://www.fintechweekly.com/news/revolut-air-ai-assistant-uk-customers-launch-2026); [PYMNTS](https://www.pymnts.com/news/artificial-intelligence/2026/revolut-rolls-out-ai-assistant-for-daily-financial-tasks/)
- AIR expanded to Ireland and Europe for budgeting, investing and travel planning (reported September 2026). It cannot take sensitive actions without biometric approval and only sees data the user can already see. — [The Paypers](https://thepaypers.com/fintech/news/revolut-launches-ai-assistant-air-in-ireland-and-europe); [Finextra](https://www.finextra.com/newsarticle/47551/revolut-introduces-ai-assistant-for-money-management)
- Antom (Ant Group) has introduced Antom Copilot, an AI assistant for merchants, plus an agentic payment solution. — [Wikipedia: Antom](https://en.wikipedia.org/wiki/Antom)
- In a corporate fraud-tools survey, 57% of companies use no AI fraud tools while 42% use three or more. Among non-adopters, 89% cite fear of false positives as a barrier. — [PYMNTS](https://www.pymnts.com/cybersecurity/fraud-prevention/2026/what-fraud-data-says-about-where-payment-security-is-headed/)
- Visa uses real-time risk scoring for account-to-account payments, scoring each transaction in milliseconds. — [IMF Note 2026/004](https://www.elibrary.imf.org/view/journals/068/2026/004/article-A001-en.xml)
- Vendor claims that AI cuts fraudulent transactions by more than 50% are marketing figures, not independent data. — [AiPrise](https://www.aiprise.com/blog/ai-fraud-detection-payments-trends)

### Inferences
- The table-stakes AI pattern in 2026 has four parts: a chat assistant over the user's own transaction data (insights, subscriptions, card controls), read-only by default, with biometric step-up for any money movement, plus real-time risk scoring. For a stablecoin app, the onchain equivalents are pre-sign transaction simulation and risk scoring (address reputation, approval and drainer detection), natural-language "pay X 20 USDC", and subscription/allowance management.
- Because fraud false positives are the main adoption blocker, explaining in plain language why a payment was flagged is a differentiator.

### Gaps
- No 2026 data found for Cleo, Klarna's AI assistant, Paytm, PhonePe, or the reported NPCI/UPI conversational-payments pilots with ChatGPT or Gemini. The search returned nothing on these, and they need a targeted follow-up.
- No adoption metrics found for bill negotiation (e.g. Rocket Money), auto-savings, or voice payments.
- No usage or engagement numbers for AIR beyond the eligible user base.

## 3. Funding: 2025-2026 rounds, acquisitions, active investors, what they look for, accelerators and grants

### Takeaway
Stablecoin payments is one of the hottest areas of crypto and fintech. Strategics are buying infrastructure: Mastercard bought BVNK for up to $1.8B (closed August 2026), after Coinbase's roughly $2B BVNK talks collapsed. Growth rounds price card-issuing and stablecoin infrastructure at $0.6-2B (Rain at $1.95B, KAST at $600M), and Tempo was valued at $5B. Series A rounds of $20-80M are common for stablecoin rails in emerging markets (Latitude, Velocity, Trace, Cyclops).

### Cited Findings
**Acquisitions**
- Mastercard agreed in March 2026 to buy BVNK for up to $1.8B, including $300M contingent, and completed the deal on 3 August 2026. BVNK had about $30B in annualized volume. — [Mastercard IR](https://investor.mastercard.com/investor-news/investor-news-details/2026/Mastercard-completes-acquisition-of-BVNK-to-advance-global-stablecoin-capabilities/default.aspx); [CNBC](https://www.cnbc.com/2026/03/17/mastercard-acquiring-stablecoin-startup-bvnk-in-crypto-bet.html); [Genfinity](https://genfinity.io/2026/08/03/mastercard-completes-bvnk-acquisition-stablecoin-capabilities/)
- Coinbase's roughly $2B talks to buy BVNK fell apart in late 2025. Mastercard was in late-stage talks for Zerohash ($1.5-2B) in October 2025. No completed Zerohash acquisition was found. — [Fortune](https://fortune.com/crypto/2025/10/29/mastercard-zerohash-acquisition-bvnk-stablecoins-coinbase); [Genfinity](https://genfinity.io/2026/08/03/mastercard-completes-bvnk-acquisition-stablecoin-capabilities/)

**Rounds**
- **Tempo** (Stripe and Paradigm incubated payments L1): $500M Series A at about $5B, led by Thrive and Greenoaks with Sequoia, Ribbit and SV Angel (October 2025). Reported partners include OpenAI, Shopify, Visa, Anthropic and Deutsche Bank. This is press-reported. — [The Block](https://www.theblock.co/post/375152/stripe-tempo-500-million-series-a-thrive)
- **Rain** (stablecoin card issuing and infrastructure): $250M Series C led by ICONIQ at $1.95B (January 2026). This came less than five months after a $58M Series B and 10 months after a $24.5M Series A. — [The Block](https://www.theblock.co/post/384910/rain-valuation-nears-2-billion-usd-series-c-250-million-raise); [Crunchbase News](https://news.crunchbase.com/fintech-ecommerce/rain-series-c-funding-valuation-crypto-stablecoin/)
- **KAST** (stablecoin neobank/cards): $80M Series A at a reported $600M valuation (March 2026), with Peak XV, HSG and DST Global. — [CoinDesk](https://www.coindesk.com/business/2026/03/09/kast-raises-usd80-million-at-usd600-million-valuation-to-expand-stablecoin-payments-platform)
- **Whop:** $200M from Tether alone at $1.6B. Whop is a creator marketplace with stablecoin payments. — [Yahoo/CoinDesk roundup](https://finance.yahoo.com/markets/crypto/articles/crypto-startups-raised-5-billion-001500221.html)
- **Velocity** (London): $38M Series A co-led by Dragonfly and FirstMark (July 2026), about $50M total since its May 2025 founding. — [Fortune](https://fortune.com/2026/07/14/exclusive-payments-startup-velocity-38-million-businesses-stablecoin-growth/)
- **Latitude** (founded by Stripe and Uber alumni, stablecoins to local payments): $35M Series A led by Oak HC/FT (September 2026). — [Fortune](https://fortune.com/2026/09/09/exclusive-latitude-stripe-uber-alums-35-million-stablecoins-local-payments/)
- **Trace Finance:** $32M Series A led by CoinFund. — [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/trace-finance-raises-32m-stablecoin-182800339.html)
- **Cyclops:** $20M Series A. The lead investor conflicts between sources: Nava Ventures per one roundup, SBI Holdings USA per another. — [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/payments-focused-stablecoin-startup-cyclops-064841482.html)
- **Better Money** (stablecoin clearinghouse, founded by ex-a16z investor Sam Broner): $10M seed led by a16z crypto (March 2026). — [Fortune](https://fortune.com/2026/03/31/the-better-money-company-stablecoin-clearinghouse-a16z-crypto-seed-round/)
- **M0:** $40M Series B led by Polychain and Ribbit (August 2025). — [CoinDesk](https://www.coindesk.com/business/2025/08/28/startup-mo-raises-usd40m-series-b-as-vcs-pile-into-stablecoins-report)
- **Hifi:** $37M total funding. — [Dealroom](https://dealroom.co/news/156043-stablecoin-payments-startup-hifi-raises-37m/)
- **RedotPay:** Valuation estimated at about $2B, a third-party estimate rather than a disclosed round. — [newmarketpitch](https://newmarketpitch.com/blogs/news/stablecoin-payments-top-startups-valuation)
- **Circle Arc:** Circle sold 740M ARC tokens for $222M in a private placement led by a16z crypto ($75M), at a $3B fully diluted valuation. About 60% of tokens go to the ecosystem (developers, grants, network growth). — [Cointelegraph](https://cointelegraph.com/news/circle-raise-222-million-arc-token-presale-3-billion); [a16z crypto: Investing in Arc](https://a16zcrypto.com/posts/article/investing-in-arc/)
- **Market context:** Crypto startups raised $5B in Q1 2026, down 16% year over year. Capital is concentrating in stablecoin and payments infrastructure. — [Yahoo/CoinDesk](https://finance.yahoo.com/markets/crypto/articles/crypto-startups-raised-5-billion-001500221.html)

**Investors seen active in these rounds**: a16z crypto (Arc, Better Money, Catena, Skyfire via CSX), Paradigm (Tempo incubation), Ribbit (Tempo, M0), Sequoia, Thrive and Greenoaks (Tempo), ICONIQ (Rain), Peak XV and DST (KAST), Dragonfly and FirstMark (Velocity), Oak HC/FT (Latitude), CoinFund (Trace), Polychain (M0), Coinbase Ventures and Circle Ventures (Catena, Skyfire), and Tether as a strategic investor (Whop). Sources are the round citations above.

**What a16z says it looks for (Arc thesis)**: stablecoins are infrastructure, and a few networks will become the base layer of a new financial system. — [a16z crypto](https://a16zcrypto.com/posts/article/investing-in-arc/)

### Inferences
- The fundable pattern across these rounds has four parts: real payment volume (BVNK had about $30B annualized at exit), a licensing or compliance moat, a distribution wedge (cards, emerging-market corridors, B2B treasury), and alignment with an incumbent rail (Visa or Mastercard issuing, Stripe). Pure consumer wallets with no licensed fiat ramp or volume are not where the large checks went.
- Rain went from Series A to C in 10 months, which suggests investors pay up for fast volume growth in card issuing on stablecoin balances. The card on-ramp is the proven monetization route (interchange) for a consumer stablecoin app.
- Strategic M&A (Mastercard/BVNK, Stripe/Bridge earlier) shows exits come from incumbents buying orchestration and licensing stacks. An app that builds clean, licensable rails is a plausible acquisition target.

### Gaps
- Not covered by searches in this pass: Bridge's acquisition by Stripe (widely reported at about $1.1B in 2025), Plasma, Codex, Conduit, Mesh, Zar, Sling, and Halliday rounds. They need targeted searches.
- No explicit public "what we look for" criteria were found from a16z crypto, Paradigm, Coinbase Ventures, Founders Fund or Ribbit for stablecoin payments.
- Accelerators and grants were not found in this pass: Base Batches / Base Builder grants, Circle developer grants, Tether, Celo, Whitechain / W Group grants. Arc's roughly 60% ecosystem allocation is the only grant-pool data point found.

## 4. Regulation shaping a UPI-like stablecoin app: GENIUS Act, MiCA, India, UAE, Singapore, Brazil, and licenses needed

### Takeaway
- **US:** The OCC finalized its GENIUS Act issuer rule on 21 October 2026. The rule and the Act take effect on 18 January 2027. BSA/AML and OFAC rules are still pending with Treasury, and the OCC has not yet opened applications.
- **EU:** MiCA's stablecoin transition ended on 1 July 2026, and MiCA itself is being reopened for review.
- **Brazil:** Stablecoin trades are treated as FX operations from February 2026, with foreign-firm authorization due by 30 October 2026.
- **India:** The RBI remains hostile. It opposes both foreign- and INR-pegged private stablecoins and bank exposure. A flat 30% gains tax plus 1% TDS applies, and VDA service providers must register with FIU-IND.

A non-issuing wallet or payments app generally needs money-transmission or VASP/CASP licensing and AML registration in each market, not issuer licenses.

### Cited Findings
**United States: GENIUS Act**
- On 21 October 2026 (NR 2026-92) the OCC issued its final rule for permitted and foreign payment stablecoin issuers under its jurisdiction and for certain custody activities. The rule and the GENIUS Act take effect on 18 January 2027. The OCC will separately announce when it begins accepting applications and waiver requests. BSA/AML and OFAC rules will come in a separate rulemaking with Treasury. — [OCC release](https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-92.html)
- The final rule covers reserves, redemption and capital, with capital tailored to each issuer subject to a $5M minimum. — [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking); [Gibson Dunn](https://www.gibsondunn.com/the-genius-act-occ-finalizes-its-payment-stablecoin-framework/); [Sidley](https://www.sidley.com/en/insights/newsupdates/2026/10/occ-finalizes-regulatory-framework-for-payment-stablecoins-under-genius-act)
- The OCC's proposed rule was published in the Federal Register on 2 March 2026. — [Federal Register](https://www.federalregister.gov/documents/2026/03/02/2026-04089/implementing-the-guiding-and-establishing-national-innovation-for-us-stablecoins-act-for-the)
- Treasury's foreign-issuer rule (Section 3) is still only proposed. Treasury has not yet identified "comparable" foreign regimes. A further Treasury proposal on issuance, offers and sales with a US nexus was reportedly published on 17 August 2026. — [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking); [cryptoticker](https://cryptoticker.io/en/genius-act-stablecoin-rules-2027/)

**EU: MiCA**
- The MiCA transition for existing stablecoin issuers ended on 1 July 2026. About 17 stablecoin issuers were authorized EU-wide as of April 2026. The EU AML package does not fully apply until July 2027. Brussels reopened MiCA for review on 20 May 2026. These are secondary sources. — [BlindPay tracker](https://blindpay.com/resources/more/stablecoin-regulation-tracker-2026); [Protegra](https://protegra.io/blog/eu-is-rewriting-mica-while-brazil-builds-one-from-scratch)

**India**
- Internal RBI documents from May and June 2026, reported by Reuters via secondary outlets, say policy should be "leaning towards prohibition". The RBI recommended barring banks and financial institutions from crypto and private stablecoin exposure, opposes both foreign-currency and INR-pegged private stablecoins, and cites monetary sovereignty and tax-evasion risks. It presented this to the parliamentary finance committee on 2 July 2026. No ban had been enacted as of July 2026. — [The Coin Republic](https://www.thecoinrepublic.com/2026/07/06/crypto-regulation-news-rbi-pushes-banks-away-from-stablecoins/); [Cryptowire](https://www.cryptowire.in/blog/rbi-doubles-down-on-crypto-prohibition-as-parliamentary-panel-report-nears/); [crypto.news](https://crypto.news/indias-rbi-renews-anti-crypto-stance-as-tax-reporting-concerns-persist/)
- Reports say the government may consider a stablecoin framework that diverges from the RBI. — [Cointelegraph via TradingView](https://www.tradingview.com/news/cointelegraph:40dbdba6a094b:0-india-s-government-may-consider-stablecoin-framework-diverging-from-rbi/)
- Tax: a flat 30% on VDA gains plus 1% TDS on transfers, unchanged in Budget 2026-27. The provisions now sit under the Income Tax Act, 2025 (effective 1 April 2026). — [APAC Money](https://apacmoney.com/post/india-crypto-tax-regulation)
- VDA service providers are PMLA reporting entities and must register with FIU-IND. Counts conflict: 54 registered by March 2026 versus 49 (45 domestic, 4 offshore). Registration is an AML step, not a license, and India has no single crypto license. — [Finowings](https://www.finowings.com/Crypto-Currency/fiu-registered-crypto-apps-india); [crypto-license-asia](https://crypto-license-asia.com/crypto-licenses/india/)

**Brazil**
- BCB rules took effect on 2 February 2026. Buying, selling or exchanging stablecoins is treated as an FX operation, and foreign firms serving Brazilians had to obtain authorization by 30 October 2026. One unverified report says Resolution 561 (30 April 2026) bars crypto and stablecoins from Brazil's regulated electronic FX system from 1 October 2026. — [BlindPay](https://blindpay.com/resources/more/stablecoin-regulation-tracker-2026); [Twin Finance](https://www.twin.finance/article/stablecoins-in-latam-the-2026-regulatory-landscape); [Protegra](https://protegra.io/blog/eu-is-rewriting-mica-while-brazil-builds-one-from-scratch)

**UAE and Singapore**
- The UAE regime pairs VARA (Dubai virtual assets) with the Central Bank's Payment Token Services Regulation (PTSR). No 2026 detail was found. — [Stablecoin Insider](https://stablecoininsider.org/stablecoin-regulations-in-2026/)
- MAS's framework requires monthly attestations and par redemption within five business days. Sources conflict on whether this is final or still proposed. — [Stablecoin Insider](https://stablecoininsider.org/stablecoin-regulations-in-2026/); [cryptolicenses.net](https://cryptolicenses.net/guides/stablecoin-regulation/)

### Inferences
- A UPI-like app that does not issue its own stablecoin and uses USDC or USDT would likely need:
  - **US:** FinCEN MSB registration plus state money-transmitter licenses, or a partner (Bridge, BVNK or Mastercard, Zerohash). From 18 January 2027 it must only offer "permitted" payment stablecoins to US persons.
  - **EU:** A MiCA CASP authorization, and only MiCA-compliant e-money tokens. USDT's EU status should be checked.
  - **India:** FIU-IND VDASP registration plus PMLA KYC/AML, 1% TDS handling, and 30% tax reporting. INR on/off-ramp via banks is fragile given the RBI's stance, so an India launch should keep INR rails separate and partner-based.
  - **UAE:** VARA VASP licensing (Dubai) and/or a CBUAE payment token license.
  - **Singapore:** An MAS Payment Services Act DPT license.
  - **Brazil:** BCB VASP authorization with FX-style treatment.
  
  These are inferences; verify with counsel.
- Embedding AI agents that move money adds consent and audit requirements. Network-style mandates (AP2) and biometric step-up (as in Revolut AIR) are the emerging control pattern a regulator would expect.
- The regulatory timeline favors launching in the US and EU first (clear rules from January 2027 and July 2026 respectively). India is the riskiest market for a stablecoin-native UPI despite its UPI familiarity.

### Gaps
- The GENIUS Act's enactment date and the state-regime ($10B threshold) details were not re-confirmed from a primary source in this pass.
- No primary VARA or CBUAE text was found for 2026 payment-token licensing. MAS's final status is unclear.
- India's parliamentary committee report outcome after July 2026 is unknown, and no primary RBI or FIU-IND documents were fetched.
- The Brazil Resolution 561 claim is not verified against BCB text.
- Primary sources do not specify exact licensing requirements for a non-custodial versus custodial wallet in each jurisdiction. Custody choice strongly changes the license burden.
