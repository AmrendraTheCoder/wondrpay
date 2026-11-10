# Why no one offers a universal cross-chain stablecoin address/QR: compliance, legal and economic reasons (as of 9 Nov 2026)

> Not legal advice. Many of the points below are where a licensed lawyer in each jurisdiction has to give an opinion, especially custody/control analysis of solver/relayer designs. Sources are tagged: **[primary]** = regulator, statute or issuer text; **[secondary]** = law firm or press; **[vendor/aggregator]** = lower confidence. Research budget: ~17 tool calls. Several primary texts were reached only through secondary summaries; these are flagged.

## Q1. Licensing: does routing, swapping or bridging a user's stablecoins across chains make an app a money transmitter / VASP / CASP?

### Takeaway
In every major jurisdiction checked, the deciding test is **custody or control of the user's value plus transmission or exchange on their behalf**. A "receive on any chain, settle on any chain" address almost always means the operator (or a solver it selects) takes in funds on chain A and pays out on chain B. That is the textbook pattern of money transmission (US), a crypto-asset transfer or exchange service (EU MiCA), and a VASP activity (FATF, Singapore, UAE, India). From mid-2026 the EU has no grace period left, and Singapore treats offshore-only operators as criminal if unlicensed. So a universal address means licences in many places, or a design that can be defended as truly non-custodial, which needs a legal opinion.

### Cited Findings
**United States: FinCEN / BSA**
- FinCEN's 2019 consolidated CVC guidance (FIN-2019-G001, 9 May 2019) treats **hosted** wallet providers as money transmitters. **Unhosted** wallet providers generally are not MSBs, because the account holder keeps independent control of the value. [Primary PDF](https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf); summarised in [Jones Day](https://www.jonesday.com/en/insights/2019/06/fincen-consolidates-guidance) and [Debevoise](https://www.debevoise.com/insights/publications/2019/05/applying-the-bank-secrecy-act-framework) [secondary].
- The same guidance makes a provider that "accepts CVCs and retransmits them" a money transmitter, even when the business is only "secured transmission". The software-only "tools" exemption covers suppliers who are "in trade rather than in transmission". [Katten](https://katten.com/fincen-publishes-guidance-pertaining-to-certain-business-models-involving-convertible-virtual-currencies); [O'Melveny](https://omm.com/insights/alerts-publications/fincen-speaks-crypto-extensive-new-guidance-for-icos-digital-wallets-dapps-trading-platforms-decentralized-exchanges-and-others-in-the-blockchain-and-crypto-space) [secondary].
- **Relevance to solvers and relayers:** a solver that receives USDC on chain A and pays it out on chain B "accepts and retransmits" value. The brief custody window does not appear in the guidance as an exemption. A secondary profile says the guidance was still active as of June 2026. [CryptoSlate profile](https://cryptoslate.com/crypto-laws/fincen-2019-convertible-virtual-currency-guidance-usa/) [secondary]. I did not confirm with FinCEN whether it has since been superseded.

**United States: state MTLs**
- 49 states plus DC require some form of money transmitter licence. Montana is the only state without an MTL statute. [Spark comparison](https://www.spark.money/tools/stablecoin-money-transmitter-license-comparison) [vendor]. Costs and timelines are in Q4.

**United States: GENIUS Act (signed 18 July 2025) and OCC rule (Oct 2026)**
- The OCC issued its GENIUS Act final rule on **21 Oct 2026** (Bulletin 2026-50). The rule and the Act take effect **18 Jan 2027**. It covers permitted issuers, foreign issuers and bank custody, with a reported $5M capital floor and a restated ban on paying yield. [Decrypt](https://decrypt.co/381502/occ-finalizes-genius-act-stablecoin-rules-ahead-of-january-deadline); [Crypto Briefing](https://cryptobriefing.com/occ-final-rule-genius-act-stablecoins/) [secondary]. One source gives 23 Oct instead of 21 Oct ([Digital Policy Alert](https://digitalpolicyalert.org/event/44965-office-of-the-comptroller-of-the-currency-adopted-final-rule-implementing-the-guiding-and-establishing-national-innovation-for-us-stablecoins-act-for-the-issuance-of-stablecoins-by-entities-subject-to-the-jurisdiction-of-the-office-of-the-comptrolle)). Not verified against the Federal Register.
- From **3 years after enactment (≈18 July 2028)**, digital asset service providers (exchanges, custodians, wallet providers) may offer or sell to US persons only payment stablecoins from permitted or registered foreign issuers. A foreign issuer's coin also requires that issuer to have the **technical capability to comply with lawful orders to seize, freeze, burn or block transfers**. Reported penalties are up to $100k/day for providers. [Orrick](https://www.orrick.com/en/insights/2025/07/stablecoin-framework-signed-into-law); [A&O Shearman](https://www.aoshearman.com/en/insights/ao-shearman-on-fintech-and-digital-assets/the-genius-act-transforming-us-stablecoin-regulation); [12 U.S.C. §5902 text mirror](https://policyrisk.com/us-code/title/12/section/5902) [secondary]. Statute wording not checked directly.
- **Relevance:** a "settle on any chain / any stablecoin" router that also swaps into non-permitted coins (or bridged or wrapped variants) for US users could become an offering that is off-limits after July 2028. Whether a bridged representation counts as the "same" permitted stablecoin is an open legal question.

**European Union: MiCA CASP authorisation**
- The MiCA transitional (grandfathering) period ended **1 July 2026** at the latest, and some member states ended it earlier. Only CASPs authorised under Art. 63 may serve EU/EEA clients. ESMA expected unauthorised firms to have run their wind-down plans by then. [ESMA statement ESMA75-113276571-1679 (Apr 2026)](https://www.esma.europa.eu/sites/default/files/2026-04/ESMA75-113276571-1679_Statement_on_the_end_of_transitional_periods_under_MiCA.pdf) [primary]; [AMF](https://www.amf-france.org/en/news-publications/news/end-mica-transitional-period-esma-sets-out-its-expectations-professionals-and-warns-retail-investors) [primary]; [Elliptic](https://www.elliptic.co/blog/the-end-of-micas-transitional-period) [vendor].
- Elliptic cited ESMA's interim register as showing **213 authorised CASPs across 23 jurisdictions** around late June 2026. Belgium's FSMA said no CASP held an FSMA authorisation. [Elliptic](https://www.elliptic.co/blog/the-end-of-micas-transitional-period); [FSMA](https://www.fsma.be/en/news/crypto-assets-service-providers-end-transitional-period).
- **EMT plus PSD2 double licence:** MiCA treats e-money tokens (USDC/EURC in the EU) as e-money, which makes them "funds" under PSD2. Under the EBA's No-Action Letter (June 2025), a CASP that transfers EMTs on clients' behalf also needs a **PSD2 payment-institution authorisation (or a PSP partner)** once the transition ended on **2 March 2026**. Firms that had not even applied had to stop EMT payment services. [EBA press release](https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-no-action-letter-interplay-between-payment-services-directive-psd23-and-markets-crypto) [primary]; [Elvinger Hoss](https://elvingerhoss.lu/insights/publications/end-transition-period-under-ebas-no-action-letter-interplay-between-psd2-and) (gives 1 Mar); [Bird & Bird on EBA/OP/2026/01](https://cm.twobirds.com/en/insights/2026/eba-clarifies-supervisory-expectations-as-no-action-letter-transition-period-ends) [secondary].
- **Relevance:** in the EU a cross-chain USDC transfer service can need **two authorisations** (MiCA CASP for transfer services plus PSD2 PI) for one product.

**Singapore: MAS**
- From **30 June 2025**, digital token service providers in Singapore that serve **only overseas customers** must hold a licence or stop. MAS said it will "generally" not grant such licences, and no grace period was given. Breach is a criminal offence. A reported minimum capital is S$250k. [CMS](https://cms.law/en/sgp/legal-updates/singapore-s-june-30-hard-deadline-for-crypto-firms-serving-overseas-customers); [Singapore Law Watch](https://www.singaporelawwatch.sg/Headlines/MAS-clarifies-position-on-regulation-of-digital-token-service-providers); [Cointelegraph](https://cointelegraph.com/explained/break-singapores-new-crypto-rules-and-you-could-face-200k-fine-or-jail) [secondary]. Capital and fee figures not verified with MAS.

**UAE: VARA (Dubai)**
- Any entity doing virtual asset activities in or from Dubai needs a VARA licence **per activity**. Rulebook v2.0 took effect 19 June 2025. Federal Decree-Law No. 10 of 2025 (effective 14 Oct 2025) made unlicensed VASP activity a criminal offence, and physical presence is required. [Farahat & Co](https://farahatco.com/blog/vara-virtual-assets-and-related-activities-regulations); [UpperSetup](https://uppersetup.com/en/article/crypto-business-in-the-uae-in-2026-vara-fsra-dfsa-vasp) [secondary]. Not verified against vara.ae.

**India: FIU-IND**
- Offshore VDA service providers serving Indian users are PMLA reporting entities and must register with FIU-IND. In Oct 2025 FIU-IND sent notices to 25 offshore platforms and ordered URL/app blocking. Registration now requires ownership details, tax filings and CERT-In cyber-audit certificates. [Medianama](https://www.medianama.com/2025/10/223-fiu-ind-notices-25-offshore-crypto-platforms-pmla-violation/); [Inc42](https://inc42.com/buzz/fiu-issues-notices-to-15-crypto-platforms-initiates-takedown/); [K&S](https://ksandk.com/newsletter/offshore-vda-service-providers-register-with-fiu-india/) [secondary].

### Inferences
- A universal address needs **one entity (or one solver network) that touches funds across many chains and many users' jurisdictions**. That puts it inside the hosted/custodial branch of FinCEN's guidance and the "transfer/exchange on behalf of clients" branch of MiCA. To avoid this, the product has to be built so the **user's own key signs every leg** (e.g. intent signed by the payer, atomic settlement, no operator discretion), and even then a legal opinion is needed.
- Multi-jurisdiction exposure compounds: US (49 states + FinCEN), EU (CASP + PSD2 for EMTs), Singapore (closed to offshore-only), UAE (per-activity licence), India (FIU registration). A universal QR is by definition reachable from all of them.
- GENIUS Act July 2028: routing that settles into a different, non-permitted or bridged stablecoin could become a regulated "offer or sale" in the US.

### Gaps
- **UK:** not researched in this budget. The FCA cryptoasset regime (FSMA 2023 secondary legislation, expected 2026–27 go-live) still needs checking.
- **No primary guidance found** that explicitly addresses intent-based **solvers or relayers** holding funds for seconds or minutes. FinCEN's 2019 text has no time-based exemption, and how brief custody is treated is a legal-opinion question.
- **Not confirmed:** whether FinCEN issued new 2025–26 guidance on DeFi or cross-chain bridges, and the final status of the 2020 FinCEN unhosted-wallet NPRM. Neither was checked.

## Q2. Travel Rule, sanctions screening and frozen addresses across chains

### Takeaway
The Travel Rule (FATF R.15 for VASPs; revised R.16 for other payments) requires originator and beneficiary data to move with each transfer between obliged entities. Each chain hop through a different intermediary multiplies data-exchange and screening obligations, and Travel Rule networks are still unevenly adopted. Each stablecoin issuer applies its own freeze policy per chain. Tether freezes proactively; Circle mostly acts on legal orders. A cross-chain router can therefore land funds in a frozen address, or have its own pool or bridge contract blacklisted. US sanctions liability is strict.

### Cited Findings
- **FATF R.16 revised June 2025:** the recommendation is retitled "Payment transparency", extended to domestic transfers, and adds fraud and error protections. Implementation is targeted for **end-2030**. Note: **R.16 does not apply to VASPs; their Travel Rule sits under R.15.** [FATF](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html) [primary]; [A&O Shearman](https://finreg.aoshearman.com/FATF-updates-standards-on-payment-transparency); [JFSA](https://www.fsa.go.jp/inter/fatf/20250619/20250619.html).
- **FATF 6th targeted update on VAs (26 June 2025):** **85 of 117** jurisdictions had passed Travel Rule legislation, but only **29%** were largely compliant with R.15. Stablecoins are flagged as increasingly used by illicit actors (DPRK, terrorist financiers, drug traffickers). Jurisdictions are urged to apply risk-based measures to **unhosted-wallet** transactions. [FATF](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/targeted-update-virtual-assets-vasps-2025.html) [primary]; [21 Analytics](https://www.21analytics.ch/blog/2025-fatf-targeted-update-summarised); [Notabene](https://notabene.id/post/2025-fatf-targeted-update) [vendor].
- **Unverified:** a March 2026 FATF targeted report on stablecoins and unhosted wallets, said to state that stablecoins were **84% of illicit VA volume in 2025**, appears only in secondary results. [CryptoSlate](https://cryptoslate.com/?p=487244). Treat as unverified.
- **Travel Rule interoperability:** TRM's Travel Rule product (KYV) is separate from KYT, and Travel Rule is often delivered via partners such as Notabene, which needs extra middleware. [rfp.wiki comparison](https://www.rfp.wiki/crypto/compliance-analytics/aml-kyc-transaction-monitoring/trm-labs/chainalysis) [aggregator].
- **Tornado Cash history:** in *Van Loon v. Treasury*, 122 F.4th 549 (5th Cir., 26 Nov 2024), the court held that immutable smart contracts are not "property" blockable under IEEPA. OFAC **delisted Tornado Cash on 21 Mar 2025** but left open whether mutable contracts or entities can be designated. Developer Roman Semenov stayed sanctioned. [Steptoe](https://www.steptoe.com/en/news-publications/international-compliance-blog/treasury-department-delists-tornado-cash-following-the-fifth-circuits-decision.html); [Paul Hastings](https://www.paulhastings.com/insights/crypto-policy-tracker/a-whirlwind-of-change-the-delisting-of-tornado-cash); [Venable](https://www.venable.com/insights/publications/2025/04/a-legal-whirlwind-settles-treasury-lifts-sanctions) [secondary].
- **OFAC liability is strict:** a party need not know an address is sanctioned to be liable. [Spark research](https://www.spark.money/research/stablecoin-blacklisting-sanctions-mechanics) [vendor]. This is a well-established OFAC principle, but the source here is a vendor.
- **Freeze policies differ by issuer:**
  - Tether freezes on authority notification or sanctions-list matches, and its terms allow freezes when "prudent".
  - Circle's written policy ties freezes mainly to legal orders. Circle reportedly did **not** freeze ≈$232M of stolen USDC bridged via its own CCTP without a legal directive.
  - [Gizmodo](https://gizmodo.com/circle-ceo-addresses-lack-of-stablecoin-freezes-during-crypto-thefts-2000745968); [AMLBot analysis](https://blog.amlbot.com/stablecoin-freezes-2023-2025-a-data-backed-analysis-of-usdt-usdc-by-amlbot/) [vendor].
- **Freeze totals (approximate, sources conflict):** Tether ≈$3.3B–$4.2B across ~7,200 addresses; Circle ≈$109M across ~372 addresses. [AMLBot](https://blog.amlbot.com/stablecoin-freezes-2023-2025-a-data-backed-analysis-of-usdt-usdc-by-amlbot/); [Yellow research](https://yellow.com/research/can-usdt-usdc-be-frozen-stablecoin-freeze-power) [secondary/vendor].
- **Bridge infrastructure gets frozen too:** in March 2026 Circle blacklisted 16 business hot wallets at once, including a **bridge smart contract** (DFINITY ckBridge). Users then saw USDC withdrawals fail. [AMLBot](https://blog.amlbot.com/circle-froze-16-business-hot-wallets-including-a-blockchain-bridge-smart-contract/); [DFINITY forum](https://forum.dfinity.org/t/ckbridge-ethereum-address-blacklisted-by-circle-usdc-withdrawals-failing/65773).
- **GENIUS Act** requires (at least foreign) issuers offered in the US to be technically able to freeze, seize or burn under lawful order. [Orrick](https://www.orrick.com/en/insights/2025/07/stablecoin-framework-signed-into-law) [secondary].

### Inferences
- A universal router has to screen **both ends on every chain**, plus every intermediate pool. It must also track **two issuers' blacklists per chain**, which differ in policy and timing. One freeze of the router's shared pool or bridge contract (as with ckBridge) strands **all** users' in-flight funds. That is a concentrated tail risk no incumbent wants.
- Each hop adds a Travel Rule obligation if an obliged entity sits there. Unhosted-wallet endpoints add extra risk-based checks. Many jurisdictions are still non-compliant, so counterparty data exchange is unreliable.

### Gaps
- No authority found that allocates **who bears the loss** when a router delivers to a later-frozen or sanctioned address. Contract terms and a legal opinion are needed.
- The FATF 2026 stablecoin/unhosted-wallet report was not retrieved from fatf-gafi.org.

## Q3. Liability and consumer protection (misdirected payments, wrong-chain sends, bridge failure)

### Takeaway
Little was found in this pass. In the EU, the EBA's EMT-is-funds position pulls EMT transfers under PSD2. That likely brings PSD2 conduct rules (execution, liability for unauthorised or defective transactions) on top of MiCA. Self-custodial crypto transfers generally lack the chargeback and error-resolution protections of card or bank payments. That leaves any operator who promises "any chain works" as the natural party to blame when a send goes wrong.

### Cited Findings
- EMTs are "funds" under PSD2, so EMT transfer services by CASPs are payment services needing PSD2 authorisation. [EBA](https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-no-action-letter-interplay-between-payment-services-directive-psd23-and-markets-crypto) [primary].
- FATF's revised R.16 explicitly adds **fraud and error protection** (e.g. payee-name checks) for payment chains. [FATF](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html) [primary].
- The ckBridge freeze shows bridge-contract blacklisting can make user withdrawals fail with no protocol-level remedy. [DFINITY forum](https://forum.dfinity.org/t/ckbridge-ethereum-address-blacklisted-by-circle-usdc-withdrawals-failing/65773).

### Inferences
- A universal address removes the user's own choice of chain. Legally and reputationally, the operator then "owns" correct routing. That creates a de-facto duty to make good on mis-routes, bridge exploits and freezes, which is unpriced liability.

### Gaps
- Not researched (budget): US EFTA/Regulation E applicability to stablecoin wallets; CFPB stance in 2025–26; UK FCA consumer duty for crypto; quantified bridge-hack loss data (e.g. Chainalysis or DeFiLlama bridge exploit totals). All need follow-up sources.

## Q4. Economics: liquidity, fees, compliance tooling, licensing, walled gardens

### Takeaway
Protocol fees are no longer the main cost. CCTP v2 Standard is free and Fast is ~1–14 bps. The real costs are **fixed**: multi-jurisdiction licences (roughly $0.5M–$1.5M+ and 1–3 years for US MTLs alone, plus surety bonds), blockchain-analytics and Travel Rule tooling (~$60k–$500k/yr), and prefunded inventory on every chain. Those costs only pay off at scale, while the revenue per transfer (a few bps) is small. Incumbents therefore keep transfers internal, where they cost nothing and are not "transmission" to an outside party.

### Cited Findings
- **CCTP fees [primary]:** Standard Transfer has **no protocol fee** (gas on both chains only). Fast Transfer costs **0–14 bps** by source chain: ~1 bps for Ethereum, Arbitrum, Base and Solana; 13–14 bps for Linea. It is deducted from the minted amount and quoted via `GET /v2/burn/USDC/fees`. [Circle docs](https://developers.circle.com/cctp/concepts/fees); [Circle finality & fees](https://developers.circle.com/cctp/cctp-finality-and-fees).
- Across (intent bridge) says the speed gap between CCTP and intent bridges has "narrowed significantly". [Across blog](https://across.to/blog/cctpv2) [vendor]. Solver margin data was not found.
- **US 50-state MTL cost:** estimates vary widely and come mostly from licensing consultants.
  - One consultant: ~$572.5k for 51 jurisdictions excluding surety bonds (bond principal ~$8.455M), or $1.0–1.5M all-in. [Faisal Khan pricing](https://faisalkhan.com/pricing/us-state-money-transmitter-license-pricing); [Faisal Khan cost page](https://faisalkhan.com/solutions/licensing/money-transmitter-license/money-transmitter-license-cost) [vendor].
  - Other estimates: legal $200–500k; state application fees $50–150k; bonds ~$120–160k/yr.
  - Unverified, promotional claim of **$10M+ and 2–3 years** for a Coinbase-scale firm. [Chainscore](https://www.chainscorelabs.com/blog/crypto-regulation-global-landscape-and-trends/global-regulatory-frameworks/the-cost-of-navigating-50-us-state-level-regulations) [vendor].
  - Timeline: 12–36 months. [Buckingham Capital](https://www.buckinghamcapitalconsulting.com/post/money-transmitter-licence-by-state-cost-timeline-and-requirements-compared-2026) [vendor].
- **Compliance tooling (no list prices are published; aggregator estimates only):**
  - Chainalysis KYT: ~$60–120k/yr for small exchanges (<$1B volume), $150–500k mid-size, and enterprise $50k to $1M+. [Costbench](https://www.costbench.com/software/crypto-compliance/chainalysis/) [aggregator].
  - TRM Labs: buyer-reported median ~$112k/yr, range $33k to $500k+. [Costbench TRM](https://costbench.com/software/crypto-compliance/trm-labs) [aggregator].
  - Implementation and tuning for MiCA and Travel Rule add services cost. [Spark](https://www.spark.money/tools/crypto-aml-tool-comparison) [vendor].
- **MiCA/MAS capital:** OCC GENIUS issuer capital floor reportedly $5M ([Crypto Briefing](https://cryptobriefing.com/occ-final-rule-genius-act-stablecoins/)). Singapore DTSP reportedly S$250k minimum capital and S$10k annual fee ([fintechnews.sg](https://fintechnews.sg/112308/regtech/singapore-dtsp-licensing-2025/)) [secondary].

### Inferences
- **Fixed-cost wall.** Licensing (≥$1M US), tooling (≥~$100k/yr), plus EU CASP + PSI, VARA, FIU-IND and so on. Against that, a few bps per transfer means a universal router needs billions in annual volume to break even.
- **Liquidity cost.** A solver-style "settle on any chain" product needs prefunded inventory on N chains for each of M stablecoins, with rebalancing via CCTP (free but slow) or Fast (bps). Capital locked across chains has an opportunity cost, roughly T-bill yield × inventory, which issuers keep and wallets cannot share under the GENIUS yield ban. *(Inference; no source quantified solver inventory.)*
- **Walled gardens are rational.** Internal ledger transfers at exchanges or wallets cost no gas, no bridge fee and no added Travel Rule hop. They keep float and users in-house. Issuers favour their own rails (Circle CCTP / own chain; Tether on TRON). A neutral universal address would commoditise them. *(Inference: no primary source in this pass documents incumbents' stated reasons.)*

### Gaps
- No found data on: solver margins on intent bridges, MiCA CASP authorisation all-in costs (legal plus capital), Travel Rule vendor (Notabene / Sumsub / 21 Analytics) pricing, or rebalancing costs. Elliptic pricing was not found.

## Q5. Official and academic research on stablecoin fragmentation and interoperability

### Takeaway
The BIS states plainly that stablecoins fail its singleness, elasticity and integrity tests. It also argues that fragmentation across blockchains "cannot be easily solved with interoperability". The IMF (2026) names platform fragmentation as a central risk. Official research gives the policy rationale for why a private "universal stablecoin address" is not something regulators are pushing toward. They prefer tokenised central-bank and commercial-bank money on unified ledgers.

### Cited Findings
- **BIS Annual Economic Report 2025, Ch. III [primary]:**
  - "Stablecoins also fail the elasticity test."
  - On unhosted wallets, users "transact without identification".
  - "This fragmentation cannot be easily solved with interoperability of different blockchains."
  - The absence of KYC standards "exacerbates" illicit-use risk.
  - [BIS AER 2025 Ch. III](https://www.bis.org/publ/arpdf/ar2025e3.htm).
- Counter-view: HSBC argues the BIS singleness definition is too narrow. [HSBC](https://www.business.hsbc.com/en-gb/insights/bis-and-stablecoins) [secondary].
- **IMF (April 2026)** report on tokenisation and stablecoins: fragmentation across competing platforms is a central concern, and interoperability and global coordination are a policy priority. [PYMNTS summary](https://www.pymnts.com/?p=3631881) [secondary, primary not retrieved].
- BIS 2026 AER and CGFS workshop material on cross-chain "liquidity silos" appear only in low-quality secondary posts (e.g. [MEXC news](https://www.mexc.com/news/1183824)). **Unverified.**

### Inferences
- Regulators frame multi-chain stablecoin fragmentation as structural (each chain is its own settlement ledger), not as something bridges fix. A bridge or router is treated as an additional integrity and operational risk point, not as a fix.

### Gaps
- Not retrieved: BIS Project Agorá and Nexus documents, FSB Oct 2025 thematic review on crypto/stablecoin implementation, ECB/Fed notes, World Bank, and SSRN/arXiv papers on cross-chain compliance. All are high-value follow-ups.
