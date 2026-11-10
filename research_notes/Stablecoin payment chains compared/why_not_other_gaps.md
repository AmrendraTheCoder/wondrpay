# Why crypto/stablecoin payment apps still lack six things UPI and card networks provide (as of Nov 2026)

Scope: root causes (technical, legal, economic), who tried what, best current standards and research, estimated effort to close each gap, and whether it is a realistic startup opportunity. Research done 2026-11-09. Every claim has a source link. Lower-reliability (vendor blog, aggregator, press release only) claims are flagged **[secondary]** or **[unverified]**. Cost and effort estimates, and the startup verdicts, are my own inferences and sit under "Inferences".

---

## 1. Why is there no shared, cross-app name/handle directory (like UPI VPAs)?

### Takeaway
UPI and Pix directories work because a regulator-backed operator (NPCI, Banco Central do Brasil) runs one database, admits only licensed institutions, rate-limits lookups and carries legal liability. Crypto has no equivalent operator. The neutral options (ENS, Celo SocialConnect/ODIS) either expose identifiers publicly or need complex privacy machinery with quotas. Wallets and exchanges also gain from keeping their handle namespaces closed. So the gap is mostly about governance and incentives, not technology.

### Cited Findings
**How the bank-rail directories are governed (the model being compared against)**
- A UPI third-party app (TPAP) can only operate through a sponsor PSP bank under a tripartite agreement with that bank and NPCI. — [Groww UPI T&Cs](https://resources.groww.in/wp-assets/documents/upi-terms-and-conditions.pdf)
- Under NPCI's multi-bank model, PSP banks have full audit rights over the TPAP's infrastructure and must hold an agreement covering liability for data breach or fraud. — [NPCI UPI Circular 32](https://www.npci.org.in/PDF/npci/upi/circular/2017/UPI%20Circular%20no%2032_Multi-Bank%20Approach_15th%20Sept.pdf)
- TPAPs need explicit permission from NPCI and the PSP bank before sharing UPI transaction data with third parties. — [NPCI UPI Circular 15B](https://www.npci.org.in/PDF/npci/upi/circular/2017/UPI%20Circular%2015B_single%20PSP%20Model_SDK%20approach%2015%20Sept.pdf)
- Paytm's 2024 TPAP approval came with four PSP banks (Axis, HDFC, SBI, YES). — [NPCI press release](https://www.npci.org.in/PDF/npci/press-releases/2024/NPCI-Press-Release-NPCI-grants-approval-to-One97-Communications-Limited-(OCL)-to-participate-in-UPI-as-a-Third-Party-Application-Provider-(TPAP).pdf)
- A 30% per-app UPI volume cap exists, and NPCI pushed its compliance deadline to 31 Dec 2026. — [Drishti IAS](https://www.drishtiias.com/daily-updates/daily-news-analysis/npci-extends-market-cap-deadline-for-upi-apps/print_manually) **[secondary]**
- Pix's DICT directory is open only to institutions that initiate Pix transactions. Even so, it has leaked. In 2021 Banese reported "undue consultations" of 395,009 Pix keys belonging to non-customers. — [Baguete](https://www.baguete.com.br/noticias/vazam-395-mil-chaves-pix)
- A 2023 BCB disclosure covered 238 keys leaked via Phi Serviços de Pagamentos. Only registration data was exposed. — [Agência Brasil](https://agenciabrasil.ebc.com.br/economia/noticia/2023-08/bc-comunica-vazamento-de-dados-de-238-chaves-pix)
- The BCB's DICT manual includes a rate-limit policy table, which was revised to add limits on key reads. — [BCB DICT manual index (okai)](https://okai.com.br/documento/253bed58-4b92-4644-9f39-d7d271a8f9eb) **[secondary index; figures not visible]**
- Per one integrator, individuals may hold up to 5 Pix keys per account and legal entities up to 20. — [BS2 dev docs](https://devs.bs2.com/docs/dict-indirect-participant) **[secondary]**
- An academic taxonomy of Pix fraud documents how the directory and instant settlement are used in scams. — [arXiv 2511.20902](https://arxiv.org/html/2511.20902v1)

**Crypto's privacy-preserving attempt: Celo SocialConnect / ODIS**
- ODIS clients blind the phone number locally, so ODIS nodes cannot tell which number they are issuing a pepper for. — [Celo docs: phone number privacy](https://docs.celo.org/celo-codebase/protocol/identity/phone-number-privacy)
- ODIS quota depends on the requester's transaction history and attestation count/success rate. Developers may need to top up quota. — [Celo docs ODIS](https://docs.celo.org/developer/contractkit/odis); [SocialConnect docs](https://socialconnect-docs.vercel.app/guides/lookup-identifier)
- SocialConnect stores only obfuscated identifiers on-chain. Users consent to a hashed phone number being stored on the Celo blockchain. — [SocialConnect FAQ](https://socialconnect-docs.vercel.app/faq); [Celo terms](https://brave.celo.org/terms-of-use)
- cLabs operates one combiner, though anyone may run one. — [Celo docs](https://docs.celo.org/celo-codebase/protocol/identity/phone-number-privacy)
- The SocialConnect GitHub repository appears archived (seen via a mirror). — [mirror of celo-org/SocialConnect](https://gh.r-mj.com/celo-org/SocialConnect) **[unverified; check github.com/celo-org/SocialConnect]**

**Data-protection law**
- The EDPB adopted Guidelines 01/2025 on Pseudonymisation on 16 Jan 2025 (consultation draft). In context, hashed data is often still personal data, and brute-force attacks must be mitigated. — [ppc.land](https://ppc.land/european-data-regulators-release-updated-pseudonymisation-guidelines-for-2025/); [Hunton](https://www.hunton.com/insights/publications/edpb-advises-on-pseudonymisation-for-gdpr-compliance)
- Spain's AEPD and the EDPS warn that hashes of numbers from a known operator range are easy to re-identify. They recommend salting or encryption. — [Inside Privacy (Covington)](https://www.insideprivacy.com/data-privacy/spanish-supervisory-authority-and-edps-release-guidance-on-hashing-for-data-pseudonymization-and-anonymization-purposes/)

**Neutral open namespace: ENS adoption**
- A Dune-based count gives about 2.0M ENS names created and about 375k primary names. The source is undated. — [dn.org](https://dn.org/measuring-the-web3-domain-market-what-2025-reports-reveal/) **[secondary, undated]**
- Monthly .eth registrations were about 20k in June, down from about 29k in May (year unclear in excerpt). — [BeInCrypto](https://beincrypto.com/?p=539518) **[secondary]**
- ENS Labs stopped developing Namechain. ENSv2 deploys exclusively on Ethereum L1, and L2 primary names have shipped. — [ENS Labs quarterly reports](https://discuss.ens.domains/t/ens-labs-quarterly-progress-reports/20565/7)
- ENSv2 moves from a single global registry to a hierarchy of linked registries. — [ENS blog](https://ens.domains/blog/post/names-are-no-longer-single-objects)

### Inferences
- **Root causes, ranked:**
  1. **No accountable operator.** UPI and Pix work because someone licensed is liable for breaches and enumeration, and every participant is a known institution. A permissionless lookup API can be scraped by anyone. Pix leaks happened even with institution-only access.
  2. **Privacy law treats hashed phone numbers as personal data**, and the EDPB hashing guidance says so explicitly. On-chain hashes cannot be erased, which fits badly with GDPR and DPDP erasure and purpose limits. No source on DPDP specifics was found (see Gaps).
  3. **Impersonation.** Open namespaces like ENS let anyone register lookalike names, and nothing does KYC on name-to-person binding. In UPI the bank's KYC'd account name is shown before payment.
  4. **Business incentives.** Exchange and wallet handles (Binance Pay ID, Telegram Wallet usernames, Venmo usernames, World App usernames) are growth moats. Opening them to rivals gives up network effects with no regulator forcing it. No sources were found documenting any of them refusing interop (see Gaps).
  5. **ENS UX and cost barriers.** Its scale (low millions of names) is tiny next to UPI's hundreds of millions of VPAs, and it has a gas and renewal model.
- **What it would take:** a federated resolver standard where each app keeps its own users but answers lookups from approved peers. This resembles the UPI PSP model or email MX records. It needs (a) a signed "name → address + verified display name" response, (b) mutual auth with rate limits between member apps, (c) a governance body or consortium charter and (d) a DPDP/GDPR legal basis (consent at signup). ENS offchain resolvers (CCIP-read) could be the technical carrier.
- **Effort:** a technical MVP takes weeks. The real cost is BD and legal: getting 3–5 wallets with real users to federate, plus privacy counsel in each jurisdiction.
- **Startup opportunity:** **medium.** A startup can build the resolver and verified-name layer (B2B). Becoming the neutral directory itself requires either regulatory status or a consortium the startup does not control.

### Gaps
- No primary source found on how India's DPDP Act 2023 / DPDP Rules 2025 would treat a cross-app phone-to-wallet directory.
- No primary data on Telegram Wallet, Binance Pay ID, Venmo or World App username directory policies and their refusal to interoperate. These claims are left as inference.
- The current ODIS quota numbers and whether SocialConnect is still maintained in 2026 were not verified.
- No reliable 2025–2026 count of ENS primary names.

---

## 2. Why are there no refunds, disputes or chargebacks on on-chain payments?

### Takeaway
Final settlement is the design goal of public chains, and card chargebacks are a costly, cross-subsidised legal and scheme construct paid for by interchange. Stablecoin rails have no interchange to fund disputes and no Reg E/Reg Z-style mandate in the US. EU coverage of e-money tokens under PSD3/PSR is still being settled. Escrow/auth-capture contracts (Coinbase/Base Commerce Payments Protocol) and arbitration (Kleros) exist, but only merchant-voluntary refunds are standard. Stripe stablecoin payments explicitly have no disputes.

### Cited Findings
**What disputes cost on cards (who funds them)**
- Mastercard/Datos Insights estimate 261M chargebacks globally in 2025, rising to 324M by 2028. Their value grows from $33.79B (2025) to $41.69B (2028). — [Mastercard: true cost of a chargeback 2025](https://b2b.mastercard.com/news-and-insights/blog/what-s-the-true-cost-of-a-chargeback-in-2025)
- Merchants with $1B+ in revenue report $151.88 in internal cost per chargeback. Third-party fees average $46 per chargeback (Javelin). About 45% of chargeback volume is fraudulent, including "friendly fraud". — [Mastercard](https://b2b.mastercard.com/news-and-insights/blog/what-s-the-true-cost-of-a-chargeback-in-2025); [Chargeback Gurus summary](https://www.chargebackgurus.com/blog/chargeback-stats-and-insights-from-mastercards-state-of-chargebacks-report) **[secondary]**
- Nilson projects worldwide card fraud losses above $43B by end of 2025. — [Infosys BPM citing Nilson](https://www.infosysbpm.com/offerings/business-transformation-services/insights/documents/charging-up-for-chargebacks.pdf) **[secondary citation of Nilson]**
- US merchants lose $4.61 per $1 of fraud in 2025. — [chargeflow.io](https://chargeflow.io/blog/chargeback-statistics-trends-costs-solutions) **[secondary, vendor]**

**How stablecoin processors handle it today**
- Stripe Stablecoin Payments lists "Dispute support: No", so there are no disputes that turn into chargebacks. Refunds, including partial ones, are supported and always go back as stablecoins to the customer's original wallet. — [Stripe docs: stablecoin payments](https://docs.stripe.com/crypto/stablecoin-payments?locale=en-GB)
- Some blogs say Stripe stablecoin refunds are processed as new outbound transfers. — [eco.com](https://eco.com/support/en/articles/15606766-stablecoin-refunds-and-chargebacks-what-s-possible-onchain) **[unverified in Stripe's own docs]**

**On-chain escrow / auth-capture**
- The Commerce Payments Protocol (Coinbase/Shopify, on Base) puts an escrow contract between buyer and merchant. Its operations are authorize, capture, charge, void, reclaim (payer-initiated after authorization expiry) and refund. Spearbit and Coinbase Protocol Security audited it. Coinbase Commerce acts as "Operator" so checkout is gasless. — [Base blog](https://blog.base.dev/commerce-payments-protocol); [Shopify Engineering](https://shopify.engineering/commerce-payments-protocol)
- Refunds draw on the merchant's balance or the PSP's risk reserves. — [Finextra deep dive](https://www.finextra.com/blogposting/29130/deep-dive-coinbases-commerce-payments-protocol-how-to-use-it-integrate-it-and-win-with-it) **[secondary]**
- Kleros markets itself for high-volume, low-to-medium-value disputes such as e-commerce, freelance and consumer complaints. Its escrow holds funds until a ruling. — [Kleros enterprise docs](https://docs.kleros.io/products/enterprise)
- Kleros case-count claims conflict: one says "over 8,000 cases, average under $100", another "over 200,000 disputes since 2019". — [chainscorelabs](https://www.chainscorelabs.com/blog/legal-tech-smart-contracts-and-the-law/legal-tech-stacks-for-law-firms/why-decentralized-arbitration-platforms-will-disrupt-traditional-law) **[unverified, conflicting]**. A Mendoza (Argentina) court pilot used Kleros for small claims. — [WIPO presentation](https://www.wipo.org/edocs/mdocs/mdocs/en/wipo_ip_conv_ge_22/wipo_ip_conv_ge_22_p5_6.pdf)

**Legal status of consumer protection**
- **US:** In Jan 2025 the CFPB proposed an interpretive rule applying EFTA/Reg E (unauthorized transfers, error resolution) to stablecoins and other digital currencies. — [Fintech & Digital Assets (Ballard Spahr)](https://www.fintechanddigitalassets.com/2025/01/cfpb-proposes-extending-electronic-funds-transfer-act-protections-to-stablecoin-and-gaming-accounts/)
- That proposal was reportedly withdrawn on 15 May 2025. — [risktemplate blog](https://risktemplate-site.pages.dev/blog/2026-04-17-reg-e-efta-crypto-compliance-stablecoin-genius-act) **[unverified; no primary CFPB confirmation found]**
- Credit unions opposed it over liability. — [CU Times](https://cutimes.com/2025/04/01/credit-unions-warn-cfpb-on-overreach-in-regulation-e-stablecoin-rule)
- Consumer Reports says the GENIUS Act gives no protection for unauthorized use and no required error-resolution procedure, unlike card law. — [Consumer Reports](https://advocacy.consumerreports.org/press_release/house-passes-genius-act-that-fails-to-protect-consumers-in-stablecoin-market)
- Senate Banking Democrats said the bill does not clarify CFPB enforcement authority over stablecoin transactions. — [Senate Banking fact sheet](https://www.banking.senate.gov/imo/media/doc/updated_genius_act_fact_sheet_banking_committee.pdf)
- New York's proposed CRPTO Act would require reimbursement for unauthorized transfers and fraud. — [risktemplate blog](https://risktemplate-site.pages.dev/blog/2026-04-17-reg-e-efta-crypto-compliance-stablecoin-genius-act) **[secondary; bill status unverified]**
- **EU:** The EBA's June 2025 No Action Letter on the MiCA/PSD2 overlap for EMTs recommends that PSD3/PSR apply PSD2 Titles II and IV (which include consumer-protection rules) to EMT transfers. — [DLA Piper](https://www.dlapiper.com/en-cl/insights/publications/2025/07/interplay-between-mica-and-psd2-for-transfers-of-electronic-money-tokens-eba-no-action-letter)
- Council and Parliament reached a PSD3/PSR compromise (reported April 2026) that lets payment institutions offer EMT-linked crypto services under conditions. The PSR adds PSP refund obligations for some fraud and scam cases. Whether those obligations cover EMT transfers is unconfirmed. — [Chambers / WH Partners](https://chambers.com/articles/psd3-psr-eu-deal-on-harmonisation-and-consumer-transparency); [Mondaq](https://www.mondaq.com/fintech/1780650/eu-reaches-compromise-on-psd3-and-psr-tighter-harmonisation-crypto-rules-and-stronger-consumer-transparency)
- The Council proposed exempting some EMT trading and settlement payments from the PSR where the CASP is MiCA-authorised. — [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/risk-and-compliance/council-adopts-position-on-psd3-and-psr-key-take-aways-102kto2)

### Inferences
- **Root causes:**
  1. **Irreversibility by design.** No central party can claw funds back, so "chargeback" must be rebuilt as escrow (pre-settlement) or as a merchant-funded refund (post-settlement).
  2. **Funding.** Card disputes cost tens of billions a year in chargeback value plus about $50–150 in handling cost each. Interchange and scheme fees pay for this. Stablecoin acceptance is sold on low fees, so nobody has the margin to fund disputes.
  3. **No legal mandate.** US Reg E/Reg Z do not clearly reach self-custodial stablecoin transfers, the CFPB proposal stalled, and GENIUS is issuer-focused. In the EU the PSD3/PSR treatment of EMTs is still being finalised.
  4. **Adverse selection.** Offering buyer protection invites friendly fraud, which is about 45% of card chargebacks.
- **What it would take:** auth/capture escrow (CPP already exists), a standard dispute-evidence schema, a funded insurance or reserve pool, and an arbitration path (merchant first, then a third party like Kleros or a PSP desk). Payer-side "buyer protection" could be sold as an opt-in fee (e.g. 0.3–1%), which is my estimate and not sourced.
- **Effort:** contracts are cheap because they are audited and open-source. A dispute operations desk, underwriting and reserves are the expensive part, the same economics as a PSP.
- **Startup opportunity:** **high, at the merchant and PSP layer.** Packaging CPP-style escrow, refunds, a dispute UI and an optional protection fee is a credible product. Being the arbiter at scale is harder, because you need a loss reserve and possibly a licence.

### Gaps
- No primary CFPB document confirming the withdrawal date.
- No final published PSR text on whether its scam-refund rule applies to EMTs.
- No reliable Kleros 2025 case volume. Check Klerosboard on-chain data.
- No public data on CPP void/refund rates or Stripe stablecoin refund volumes.

---

## 3. Why are pull-payment mandates (collect requests, AutoPay) not standard?

### Takeaway
The only universal pull primitive on EVM chains, ERC-20 `approve` and Permit/Permit2 signatures, is also the main drainer vector. Scam Sniffer counted about $494M lost to signature phishing in 2024 and about $84M in 2025. Scoped, revocable permissions (ERC-7715/7710, session keys) do exist, but they only work on smart accounts and are still in draft. In practice they are mainly MetaMask's implementation, and the method name changed between versions. So no merchant can count on every payer's wallet supporting a safe mandate.

### Cited Findings
- Scam Sniffer's 2025 report puts signature-phishing losses at about $83.85M across 106,106 victims, down about 83% from about $494M in 2024. There were 11 cases above $1M. — [KuCoin news summary](https://www.kucoin.com/news/flash/2025-crypto-phishing-losses-drop-83-to-83-85m-drainer-ecosystem-remains-active); [NewsBTC](https://www.newsbtc.com/altcoin/crypto-users-lose-far-less-to-phishing-as-losses-drop-83-details/amp) **[secondary summaries of Scam Sniffer; primary at drops.scamsniffer.io not fetched]**
- Permit/Permit2 signatures accounted for 38% of large-case losses. The biggest single theft was $6.5M via a Permit signature in Sept 2025. Q3 2025 was the worst quarter ($31M) and Q4 the lowest ($13.09M). — same sources **[secondary]**
- The US Secret Service, UK and Canadian agencies launched "Operation Atlantic" against approval phishing. — [The Block](https://www.theblock.co/post/393746/us-secret-service-uk-and-canada-launch-operation-atlantic-targeting-crypto-approval-phishing-scams)
- MetaMask implements ERC-7715 "Advanced Permissions". It needs MetaMask v13.23.0+ and the user must be upgraded to a MetaMask Smart Account, because an ERC-7710 delegation signature is requested under the hood. — [MetaMask Smart Accounts Kit docs](https://docs.metamask.io/smart-accounts-kit/concepts/advanced-permissions/); [execute on user's behalf guide](https://docs.metamask.io/smart-accounts-kit/guides/advanced-permissions/execute-on-metamask-users-behalf/)
- Older MetaMask docs required Flask 13.5.0+ and used `wallet_grantPermissions`. Newer docs use `wallet_requestExecutionPermissions`, so the API has churned. — [MetaMask Delegation Toolkit (older)](https://docs.metamask.io/delegation-toolkit/concepts/erc7715); [newer](https://docs.metamask.io/smart-accounts-kit/concepts/advanced-permissions/)
- A session account redeeming ERC-7710 permissions can be a smart account or an EOA. — [MetaMask docs 1.7.0](https://docs.metamask.io/smart-accounts-kit/1.7.0/concepts/advanced-permissions.md)
- ERC-7715 discussion thread. — [Ethereum Magicians](https://ethereum-magicians.org/t/erc-7715-grant-permissions-from-wallets/20100)
- ERC-7715 is described as Draft status. — [eco.com](https://eco.com/support/en/articles/15254038-erc-7715-session-keys-2026-granular-permissions-explained) **[secondary; status not confirmed on eips.ethereum.org]**
- Viem supports the method natively. — [eco.com](https://eco.com/support/en/articles/11953354-what-is-erc-7715-a-complete-guide-to-wallet-permissions-in-web3) **[secondary]**

### Inferences
- **Root causes:**
  1. **The legacy primitive is unsafe.** Unlimited approvals and off-chain Permit signatures look the same to users whether they come from a merchant or a drainer. Wallets therefore warn on or block them, which trains users to distrust any pull request.
  2. **The safe primitive is fragmented.** 7715/7710 needs smart accounts and specific wallet versions, and its method names are still changing. Coinbase Smart Wallet "spend permissions", Safe modules and ZeroDev/Biconomy session keys are separate, non-interoperable stacks. (Their existence is general knowledge and not sourced here.)
  3. **No mandate registry or revocation hub.** UPI AutoPay has an NPCI-hosted mandate with a standard pause/revoke UI in every app. On-chain, revocation depends on each wallet's UI.
  4. **No liability.** A wrongly executed UPI mandate debit can be disputed. On-chain, a bad pull is final.
- **What it would take:** one cross-wallet standard (7715 finalised, plus Coinbase spend-permission parity), a public, readable mandate format (merchant, cap, period, expiry), and wallet UI showing a "mandates" list with one-tap revoke. The subscription merchant side needs a keeper or relayer to execute pulls.
- **Effort:** building on a single wallet stack takes weeks. Cross-wallet coverage depends on wallet vendors, which takes years.
- **Startup opportunity:** **medium-high.** A subscription and billing SDK that abstracts across 7715, spend permissions and permit-with-caps, plus a mandate dashboard, is buildable now. The risk is that wallets or PSPs (Coinbase, Stripe) bundle it.

### Gaps
- No primary Scam Sniffer report fetched. Figures come from secondary summaries.
- No count of wallets supporting ERC-7715 beyond MetaMask.
- No data on adoption of on-chain subscription protocols (volumes, merchants).

---

## 4. Why are there no offline / feature-phone stablecoin payments?

### Takeaway
"Offline" covers two different problems. **Feature-phone access** (USSD) is technically solved, as Kotani Pay shows, but it is a custodial service that rides on mobile operators' USSD channels, which operators price and gatekeep. **True offline value transfer**, with neither party online, needs tamper-resistant hardware and value caps to stop double-spends. Central banks still treat this as an open research problem, and on a public blockchain it cannot be done without a trusted device or issuer.

### Cited Findings
**Offline value transfer (CBDC research)**
- The BIS Innovation Hub Nordic Centre's Project Polaris handbook on offline CBDC payments (May 2023, with Consult Hyperion) lists double-spending as a key risk. It covers mitigations, tamper-resistant devices and value-transfer mechanisms. It is labelled "Part 1", and further work is ongoing. — [BIS publication](https://www.bis.org/publications/project-polaris-handbook-offline-payments-cbdc); [PDF](https://www.bis.org/publ/othp64.pdf); [BIS press](https://www.bis.org/press/p230511.htm)
- Per the BIS, offline payments "increase the possibility of digital counterfeiting and double spending". — [Mariblock](https://mariblock.com/bis-says-token-based-cbdcs-pose-counterfeiting-and-money-laundering-risks/) **[secondary quote]**
- Uruguay's offline e-peso pilot listed double-spending, lost offline wallets and offline value thresholds as unresolved concerns. A local-blockchain design has been proposed as a fix. — [arXiv 2305.02290](https://arxiv.org/pdf/2305.02290)
- RBI Governor Das said in May 2024 that RBI is "working on making the CBDC transferable in the offline mode". — [Business Standard](https://www.business-standard.com/amp/finance/news/rbi-to-make-digital-currency-available-offline-says-governor-das-124050601039_1.html)
- RBI may cap offline wallet balances and transaction values. Offline e₹ relies on secure hardware and short-range communication. — [AMLEGALS](https://amlegals.com/rbis-offline-digital-rupee-understanding-indias-cbdc-revolution/) **[secondary; current pilot status unverified]**

**Feature-phone / USSD**
- Kotani Pay's middleware links blockchains to mobile-money rails. Its USSD product targets feature-phone users without internet: users dial a short code (e.g. *384*483#) to get a menu. — [Kotani docs: USSD](https://docs.kotanipay.com/docs/kotani-pay-ussd); [UNICEF Venture Fund](https://www.unicefventurefund.org/story/kotani-pay-increasing-access-financial-instruments-using-blockchain-and-cryptocurrency)
- Kotani originally supported Celo cUSD and now USDT, USDC and cUSD. It is primarily B2B, bridging crypto platforms to mobile-money APIs. — [UNICEF](https://www.unicefventurefund.org/story/kotani-pay-increasing-access-financial-instruments-using-blockchain-and-cryptocurrency); [Solana Compass](https://solanacompass.com/projects/kotani-pay) **[directory]**
- Kotani raised a $2M pre-seed. — [The Paypers](https://thepaypers.com/crypto-web3-and-cbdc/news/kenyas-startup-kotani-pay-gets-usd-2-mln-funding)
- Tether made a strategic investment in Oct 2025, and Kotani holds an FSCA (South Africa) CASP licence. — [Solana Compass](https://solanacompass.com/projects/kotani-pay) **[unverified, single directory source; a Cardano Catalyst proposal says the licence was still being applied for]** — [Project Catalyst](https://projectcatalyst.io/funds/10/developer-ecosystem-the-evolution/stablecoin-payments-in-africa-without-an-internet-connection-or-a-bank-account-kotani-pay-integration)
- **USSD economics and gatekeeping:** Kenya's Competition Authority pushed Safaricom to cut third-party USSD charges for mobile banking. A 2017 deal cut sessions to KES 2, after Safaricom had charged KES 2–5 per three-minute session. CAK wanted non-discriminatory, cost-based USSD access. — [Business Daily Africa](https://www.businessdailyafrica.com/corporate/CAK-forces-Safaricom-cut-cost-mobile-banking/539550-3852854-2nqj5y/index.html); [Techweez](https://techweez.com/2017/03/17/cak-wants-safaricom-lower-ussd-charges-mobile-banking/)
- Safaricom publishes a USSD tariff guide. — [Safaricom USSD Tariff Guide](https://www.safaricom.co.ke/images/Downloads/USSD_Tariff_Guide.pdf)
- Aggregators such as Africa's Talking resell USSD short-code access. — [Africa's Talking](https://africastalking.com/ussd?lang=en)
- USSD-based services fail at high rates (session timeouts, network drops). — [Hover / Medium](https://medium.com/use-hover/more-than-a-billion-people-depend-on-ussd-based-services-that-fail-at-an-alarming-rate-63a992ba1a92) **[vendor blog]**
- India's TRAI commissioned a MicroSave study on USSD for financial services. — [TRAI/MicroSave PDF](https://www.trai.gov.in/sites/default/files/2024-11/201609150519308296424MicroSave.pdf)

### Inferences
- **Root causes:**
  1. **Physics and security.** Offline peer-to-peer transfer without double-spend needs a secure element and an issuer-signed value store. Public stablecoins have no such device ecosystem, and issuers like Circle and Tether have not built one.
  2. **USSD is an operator monopoly.** Short codes, per-session fees and session time limits are set by MNOs, and they often also run the competing mobile-money wallet (M-Pesa). Regulators have had to step in, as in Kenya.
  3. **Custody.** USSD wallets are custodial, because a feature phone cannot hold keys securely. The provider then needs a VASP or e-money licence in each country.
  4. **Economics.** Feature-phone users make small transfers, and per-session USSD fees plus off-ramp fees eat the margin.
- **What it would take:** (a) for feature phones, MNO or aggregator agreements, a custodial licence per market and a mobile-money off-ramp, which is Kotani's model. (b) For true offline use, hardware wallets or SIM-applet secure elements with capped balances and later on-chain reconciliation. That is CBDC-grade work needing issuer cooperation.
- **Effort:** USSD in one country takes 3–6 months plus licensing. Secure-element offline payments take years and need an issuer or telco partner.
- **Startup opportunity:** **low-medium** for India-focused apps. UPI 123PAY and UPI Lite already serve feature-phone and low-connectivity users there; this is general knowledge, not sourced here. **Medium** in African corridors, where incumbents such as Kotani have only small funding.

### Gaps
- The Polaris handbook's specific double-spend mitigations (Section 5.5.8) were not fetched.
- No primary RBI document on the offline e₹ pilot's scope or results.
- No primary source on UPI 123PAY or UPI Lite (the comparison is unsourced).
- No source found on Celo's own USSD efforts or on Grey's offline features.

---

## 5. Why is there no single QR payable by both bank rails and stablecoins?

### Takeaway
National QR standards (EMVCo-based and similar) are owned by schemes and central banks, and only licensed participants can route payments into domestic instant-payment systems. A stablecoin wallet cannot simply join. The first serious bridge is the US X9.150 standard (ANSI, July 2026). On 19 Oct 2026 it was demoed with one signed QR payable over FedNow, RTP or USDC on Solana. That was a proof of concept, not a product.

### Cited Findings
- EMVCo's Merchant-Presented QR spec defines an interoperable payload. A single QR can carry several domestic and international payment programmes, both account-based and card-based. It can coexist with proprietary QRs and has been adopted as a national standard in countries such as Singapore and South Africa. — [EMVCo: what, why and how of EMV QR codes](https://www.emvco.com/knowledge-hub/the-what-why-and-how-of-emv-qr-codes/); [EMVCo launch PDF](https://emvco.com/wp-content/uploads/news/EMVCo-QR-Code-Specification-Launch-FINAL-v1.pdf)
- National profiles such as Namibia's NAMQR v5.0 (April 2025) and Colombia's EMVCo field standard (effective 21 Nov 2025) build on EMVCo. Colombia gives implementations 2 years to update when a version is superseded. — [Bank of Namibia NAMQR v5.0](https://www.bon.com.na/getattachment/Bank/National-Payment-System/Legal-Framework/Standards/NAMQR-CODE-STANDARDS-V5-0.pdf.aspx?lang=en-ZA); [Mastercard Colombia PDF](https://www.mastercard.com/content/dam/mccom/lac/col/colombia-administradora/pdfs/otras-publicaciones/sept25-campos-qrcode-emvco-estandar-industria-easpbv-colombianas.pdf)
- Ethiopia's national interoperable QR standard is another example of a central bank owning the QR standard. — [National Bank of Ethiopia](https://nbe.gov.et/wp-content/uploads/2024/04/Interoperable-QR-Standard.pdf)
- **X9.150 (US):** ASC X9 (under ANSI) published it in July 2026 as "Merchant-Presented QR Codes for Secure Payment". It is push-based, each request is digitally signed using X9 Financial PKI, and it covers FedNow, RTP, ACH credit, Zelle "and emerging digital payment methods such as stablecoins". Pix is the cited model. — [Solana Compass](https://solanacompass.com/news/x9150-qr-code-payments-demo-at-money2020-lets-one-invoice-be-paid-over-fednow-rtp-or-usdc-on-solana); [Business Wire via FinancialContent](https://www.financialcontent.com/article/bizwire-2026-10-19-matera-payfinia-and-solana-foundation-demonstrate-new-us-qr-code-payment-standard-at-money2020)
- **The Oct 19 2026 demo (Money20/20 USA):** Matera, Payfinia and the Solana Foundation ran it, with Altitude (by Squads) for the USDC side. Star One Credit Union's app handled the bank-rail side. One invoice QR could be paid via a credit union app (FedNow/RTP) or Altitude (USDC on Solana), and the ERP marked it paid automatically. The release says it "is not a product launch". Matera open-sourced reference software. — same sources **[participant press release; no independent coverage]**
- Altitude notes that verifying a signed request "does not establish that the underlying invoice is legitimate", so a human approval step remains. — [Solana Compass](https://solanacompass.com/news/x9150-qr-code-payments-demo-at-money2020-lets-one-invoice-be-paid-over-fednow-rtp-or-usdc-on-solana)
- A separate GitHub write-up compares the X9.150 rails. — [Ricosworks1 GitHub](https://github.com/Ricosworks1/blockchain-payment-flow-analysis/releases/tag/comparative-analysis-x9150-qr-multi-rail-stablecoin-fednow-oct-2026) **[self-published]**
- Related, but not a QR standard: from 1 Oct 2026, 90+ North Dakota banks settle interbank transfers on a permissioned Solana-based setup with no public wallet access. — [KuCoin news](https://www.kucoin.com/news/flash/90-us-banks-settle-over-solana-in-400-milliseconds-boosting-network-usage) **[secondary]**
- Polygon's Open Money Stack added Solana, offering bank pay-in to stablecoin and payout to US bank accounts. — [Solana Compass](https://solanacompass.com/news/polygons-open-money-stack-adds-solana-linking-us-bank-rails-to-usdc-usdt-and-pyusd-through-one-api); [CryptoSlate](https://cryptoslate.com/polygon-brings-us-banking-access-to-solanas-15-billion-stablecoin-market/)
- In India, only NPCI-approved TPAPs with sponsor PSP banks can initiate UPI payments. — [NPCI Circular 32](https://www.npci.org.in/PDF/npci/upi/circular/2017/UPI%20Circular%20no%2032_Multi-Bank%20Approach_15th%20Sept.pdf)

### Inferences
- **Root causes:**
  1. **Standards ownership.** QR payload tags are allocated by EMVCo or the national operator. A stablecoin "payment network" tag needs that body's agreement, and national schemes have no incentive to route volume off their own rail.
  2. **Licensing.** Paying a Pix, UPI or PromptPay merchant means being a licensed participant or partnering with one, and the merchant's account sits at a bank.
  3. **Settlement mismatch.** A bank-rail QR credits the merchant's bank account in fiat. A stablecoin payment credits a wallet, so either the merchant needs both, or an intermediary converts. Conversion is what Brazilian crypto apps paying Pix QRs effectively do (inference; not sourced here).
  4. **Trust.** Signed requests (X9.150) prove who issued a QR, not whether it should be paid.
- **What it would take:** either (a) get a stablecoin rail recognised inside a national standard, as X9.150 does in the US (multi-year, consortium-led), or (b) take the "wallet pays any national QR" route: a licensed PSP that parses UPI/Pix/EMVCo QRs and settles the fiat leg from the user's stablecoins. (b) is feasible today with a local licence or partner but adds FX and off-ramp cost.
- **Effort:** (a) means years of standards work. (b) means 6–18 months per country, mostly licensing and banking partners.
- **Startup opportunity:** **medium.** "Scan any national QR, pay from stablecoins" is a real wedge for travellers and remitters, but it is a licensed-PSP business. In India, RBI's stance on crypto makes paying UPI QRs from crypto legally risky (not researched here; see Gaps).

### Gaps
- No primary EMVCo, NPCI or BCB rule text found saying explicitly whether non-bank or crypto rails may register QR tags.
- No data on Brazilian or Thai crypto apps paying Pix or PromptPay QRs.
- No independent confirmation of X9.150 adoption beyond demo participants.
- India's regulatory position on linking crypto wallets to UPI was not researched.

---

## 6. Why do merchants rarely accept stablecoins directly?

### Takeaway
Demand is thin and accounting is awkward. In the US, stablecoins are still taxed as property with no de minimis exemption. The PARITY Act fix is only a draft. Non-USD merchants take FX risk, and every payment needs an off-ramp. Surveys show interest but conditional usage: consumers want broad acceptance first, and merchants want card-like simplicity first. That chicken-and-egg problem is the central economic barrier.

### Cited Findings
- **Consumer side:** FIS surveyed 1,000 US consumers in Oct 2025. 74.8% would try stablecoins if their bank offered them, and 52.7% want at least half of merchants to accept digital currency before seriously considering using it. — [FIS press release](https://www.fisglobal.com/about-us/media-room/press-release/2025/fis-research-banks-hold-the-key-to-stablecoin-adoption)
- A BVNK/YouGov survey (4,658 crypto holders or prospects, 15 countries, Sep–Oct 2025) found 39% earn income in stablecoins and 27% use them for everyday transactions. — [PaymentsJournal](https://www.paymentsjournal.com/is-there-a-consumer-market-for-stablecoins/) **[vendor-sponsored survey]**
- An MNEE Pay/YouGov survey (July 2026) found 62% of US stablecoin holders had converted back to dollars at least once because merchants would not accept stablecoins. — [Eastern Progress](https://www.easternprogress.com/mnee-pay-survey-reveals-millions-of-americans-hold-stablecoins-most-cant-spend-them/article_3d390148-d63c-5f75-8de4-d6c9c9c22fa8.html) **[vendor-sponsored]**
- **Merchant side:** an NCA/PayPal survey by Harris Poll (619 payment decision-makers, Oct 2025) found 39% of merchants accept crypto at checkout. This is crypto generally, not stablecoins only. 90% would accept it if setup were as simple as cards. — [Chain Store Age](https://chainstoreage.com/survey-online-merchants-continue-accepting-crypto-payment-option) **[the 39% likely includes PSP-converted acceptance, not direct wallet receipt; inference]**
- **Tax and accounting (US):** stablecoins are property, so spending USDC is a disposal and triggers a gain/loss calculation. There is no de minimis exemption today. — [Stripe guide](https://stripe.com/at/resources/more/are-stablecoins-taxable); [Awaken Tax](https://awaken.tax/media/article/taxes-on-stablecoins) **[secondary]**
- The PARITY Act draft first proposed a $200 de minimis exemption. A March 2026 revision reportedly replaced it with a basis-based rule (no gain or loss unless basis is below 99% of value). Sources disagree on the exact test, and it is not enacted. — [Baker McKenzie blockchain blog](https://blockchain.bakermckenzie.com/2026/04/17/the-parity-acts-de-minimis-rewrite-and-the-bitcoin-coffee-problem-it-leaves-unsolved/); [FinanceFeeds](https://financefeeds.com/us-crypto-tax-proposal-adds-200-de-minimis-exemption-for-stablecoin-transactions/)
- Stripe settles stablecoin payments to merchants in fiat. Its docs are inconsistent on whether settlement is in USD or local currency. — [Stripe docs](https://docs.stripe.com/crypto/stablecoin-payments?locale=en-GB)
- Shopify's USDC checkout via CPP lets merchants accept stablecoins through an existing PSP. — [Shopify Engineering](https://shopify.engineering/commerce-payments-protocol)

### Inferences
- **Root causes:**
  1. **Demand chicken-and-egg.** FIS shows consumers wait for broad acceptance, and Harris shows merchants wait for card-like simplicity.
  2. **Accounting.** Each receipt and spend is a property event, and ERP and tax tooling is immature. Merchants therefore prefer PSPs that auto-convert to fiat (Stripe, Shopify/Coinbase), so "accepting stablecoins" usually means receiving fiat.
  3. **FX.** For INR, BRL or EUR merchants, USD stablecoins are FX exposure. Off-ramps add a spread, and local-currency stablecoins are illiquid.
  4. **No buyer-protection parity** (see §2) and no loyalty or rewards economics. Cards fund rewards from interchange, and stablecoin acceptance removes that.
  5. **Licensing.** Holding customer stablecoins or converting them may require a VASP or MSB licence, depending on jurisdiction.
- **What it would take:** auto-conversion with merchant-chosen settlement, accounting exports (cost-basis neutral for 1:1 stablecoins), a tax fix like PARITY, and consumer incentives. Stablecoin rails can afford rebates because they lack interchange.
- **Startup opportunity:** **medium.** Gateways are crowded (Stripe, Coinbase/Shopify, BVNK and others). The opening is in vertical niches (cross-border B2B invoices, creators and freelancers, merchants in dollarising economies) and in accounting and tax tooling, not a generic checkout.

### Gaps
- No clean survey of the share of merchants accepting stablecoins specifically, as opposed to crypto in general.
- No sourced off-ramp cost data (spreads by corridor) in this note. Other researchers' files (merchant_gateways.md, crosschain_infra.md) may cover it.
- No India- or EU-specific merchant tax treatment of stablecoin receipts researched.
- No independent (non-vendor) data on real stablecoin checkout volumes.
