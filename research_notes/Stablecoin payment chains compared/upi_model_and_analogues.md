# The UPI model and its crypto/stablecoin analogues (as of 9 Nov 2026)

Source note: figures marked [verified 2026-11] were confirmed through web search or fetch in this session. Items marked [background, not re-fetched] come from well-established primary docs (NPCI product pages, EIPs, protocol specs). Their URLs are canonical, but I did not re-open them in this session, so a writer should spot-check them before quoting exact numbers. Anything unverified is flagged inline.

## 1. UPI architecture: layers and rules

### Takeaway
UPI is a central, neutral switch (NPCI) that routes push and pull messages between bank accounts. Apps are only front ends (PSPs and TPAPs), and money never leaves banks. Addresses are portable aliases (VPAs) that resolve through a central mapper. Security comes from device binding plus a bank-issued PIN. The rulebook covering limits, disputes, QR formats and market-share caps is set centrally and binds every participant. The design rule that matters most: the app does not hold funds, and the bank does not own the user.

### Cited Findings
**Actors and the switch** [background, not re-fetched]
- NPCI runs the UPI switch. It routes requests between the payer's PSP, the payee's PSP, the issuer (remitter) bank and the beneficiary bank. Banks settle net positions through RBI settlement accounts in multiple settlement cycles per day, so final settlement is deferred net settlement even though the user sees the credit in real time. — [NPCI UPI product overview](https://www.npci.org.in/what-we-do/upi/product-overview)
- PSP banks sponsor the apps. Third-party app providers (TPAPs) such as PhonePe, Google Pay and Paytm are non-banks that connect through one or more PSP banks (the multi-bank model). They never hold customer funds. — [NPCI UPI ecosystem / TPAP list](https://www.npci.org.in/what-we-do/upi/3rd-party-apps)
- VPAs/UPI IDs (e.g. `name@okhdfcbank`) are aliases. The handle suffix identifies the PSP. NPCI's UPI Number / mapper service lets a mobile number resolve to a VPA across apps (portability), so a user can be paid by phone number from any app. — [NPCI UPI Numeric ID / mapper](https://www.npci.org.in/what-we-do/upi/upi-numeric-id)
- Authentication: (1) device binding, where the app verifies the SIM by sending an SMS from the registered mobile number, and (2) the UPI PIN, which is set with debit card or Aadhaar OTP and entered in an NPCI-supplied common library so the app never sees it. Each transaction is "possession + knowledge" 2FA. — [NPCI UPI product overview](https://www.npci.org.in/what-we-do/upi/product-overview)
- Biometric UPI authentication: one secondary source reports a ₹10,000 limit for biometric-authenticated UPI payments effective 7 Aug 2026, with biometrics deactivated after a PIN change. Unverified, single secondary source. — [IndiaObservers](https://indiaobservers.com/npci-upi-daily-limits-security-features-2026/)

**Push vs pull**
- Push ("pay") is the default. Pull ("collect") lets the payee raise a request that the payer approves with their PIN. NPCI's circular of 29 Jul 2025 said "By October 1, 2025, UPI P2P Collect shall not be allowed to be processed in UPI", citing fraud. Merchant collect continues. [verified 2026-11] — [Outlook Money](https://www.outlookmoney.com/banking/npci-to-end-upi-p2p-collect-requests-from-october-1-to-reduce-fraud); [MediaNama](https://www.medianama.com/2025/08/223-npci-p2p-collect-payments-oct-1-what-it-means/)
- Inc42 reports NPCI also intends to phase out collect for merchant payments. Treat this as announced or under discussion, since the current status is unclear. — [Inc42](https://inc42.com/buzz/npci-to-phase-out-collect-request-for-merchant-payments-to-curb-upi-fraud)

**QR** [background, not re-fetched]
- UPI QR encodes a `upi://pay?pa=<vpa>&pn=<name>&am=<amount>&tr=<ref>...` intent URI. Static QR carries only the VPA. Dynamic QR adds amount and reference per transaction. Bharat QR is the EMVCo-based interoperable QR, jointly developed by NPCI, Visa, Mastercard and AmEx. — [NPCI BharatQR](https://www.npci.org.in/what-we-do/bharat-qr/product-overview)

**Mandates / AutoPay** [background, not re-fetched]
- UPI AutoPay registers a recurring mandate (PIN once) and then debits without a PIN up to an NPCI-set threshold, with a pre-debit notification. The UPI One-Time Mandate (block funds now, debit later, as used in ASBA/IPO flows) uses the same rails. — [NPCI UPI AutoPay](https://www.npci.org.in/what-we-do/autopay/product-overview)

**UPI Lite / 123PAY / credit** [background, not re-fetched; limits change often]
- UPI Lite is an on-device wallet balance funded from the bank account. Small payments run PIN-less and debit the Lite balance without hitting the core banking system in real time. NPCI has raised the Lite caps over time; current per-transaction and balance caps need a check against the latest NPCI circular. UPI Lite X was announced for offline/NFC payments. — [NPCI UPI Lite](https://www.npci.org.in/what-we-do/upi-lite/product-overview)
- UPI 123PAY serves feature phones through IVR numbers, missed call, an app on the feature phone, and sound-based proximity payments. — [NPCI UPI 123PAY](https://www.npci.org.in/what-we-do/upi-123pay/product-overview)
- Credit on UPI: RuPay credit cards linked to UPI (since 2022), and pre-sanctioned credit lines on UPI (RBI 2023). These turn UPI from "bank account rail" into a "funding-source-agnostic rail". — [NPCI RuPay credit card on UPI](https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics) (URL is approximate; my search found no current data on credit-line volume)

**UPI Circle (delegation)** [verified 2026-11]
- A primary user can delegate to a secondary user (for example a dependant without a bank account). Under partial delegation the secondary initiates and the primary approves with the PIN. Under full delegation the secondary pays within caps: ₹5,000 per transaction and ₹15,000 per month per delegation, with a ₹5,000 limit in the first 24 hours. Some copies of the circular say "₹215,000/month", which is probably a typo. — [Business Today](https://businesstoday.in/personal-finance/news/story/upi-circle-launched-for-designated-secondary-users-know-features-monthly-cap-guidelines-for-usage-rbi-shaktikanta-das-443493-2024-08-29); [PhonePe Business](https://business.phonepe.com/articles/upi-circle-what-it-is-how-it-works-and-who-can-use-it); [Outlook Money – BHIM full delegation](https://www.outlookmoney.com/banking/bhim-rolls-out-delegated-upi-payments-with-spending-caps-and-long-validity)

**Limits** [verified 2026-11]
- Person-to-person: ₹1 lakh per day. From 15 Sep 2025, verified merchants in capital markets, insurance, GeM (the government e-marketplace) and travel get ₹5 lakh per transaction and ₹10 lakh per day. Credit-card bill payments get ₹5 lakh per transaction and ₹6 lakh per day. Banks may set lower internal limits. — [Business Today](https://www.businesstoday.in/personal-finance/banking/story/npci-to-increase-upi-transaction-limits-for-high-value-payments-from-sept-15-check-updated-limits-493278-2025-09-09); [Paytm blog](https://paytm.com/blog/news/upi-higher-transaction-limits-sep-2025)

**Disputes / ODR** [background, not re-fetched]
- UPI has an in-app complaint flow through the UPI Help / UDIR (Unified Dispute and Issue Resolution) framework. RBI's TAT (turnaround time) harmonisation circular requires auto-reversal of failed transactions within T+1 and pays compensation to the customer for delays. The escalation path is PSP → bank → NPCI → RBI Ombudsman. Online dispute resolution (ODR) for failed transactions is mandated by RBI. — [NPCI UPI dispute redressal](https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism); [RBI TAT circular 2019](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11693)

**International** [verified 2026-11, secondary sources]
- NIPL (NPCI International Payments Ltd) runs the linkages. Core live set: Bhutan, Nepal, Singapore (UPI–PayNow, a real-time P2P remittance link), UAE, France, Sri Lanka and Mauritius. Cyprus was added in 2025 and Cambodia (ACLEDA Bank, QR acceptance) in June 2026. Counts vary from 9 to 11 countries depending on whether remittance and merchant acceptance are counted together. NIPL signed with Uzbekistan's NIPC on 30 Aug 2026 (announced; launch not confirmed). — [Vajiram & Ravi](https://vajiramandravi.com/current-affairs/countries-accepting-upi-payment/); [Upstox](https://upstox.com/news/trending/latest-updates/10-countries-that-accept-upi-payments/webstory-196380/); [SuperKalam (PIB)](https://superkalam.com/current-affairs/01-09-2026/npci-international-and-uzbekistan-s-nipc-partner-to-enable-upi-payments-across-uzbekistan-via-uzqr-e471806e-11ff-4057-9923-8ae36c9d10d2)
- Project Nexus (BIS → Nexus Global Payments, Singapore) links domestic instant payment systems (IPSs) multilaterally, with members India, Malaysia, the Philippines, Singapore and Thailand. Indonesia's status is unclear. A 2026 go-live was targeted, but I found no confirmation that it is live as of Nov 2026. — [MAS](https://www.mas.gov.sg/news/media-releases/2024/project-nexus-completes-comprehensive-blueprint-for-connecting-domestic-ipses-globally); [Asian Banker](https://www.theasianbanker.com/updates-and-articles/project-nexus-to-transform-global-payments-going-live-in-2026); [RBI](https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=58197)

### Inferences
- UPI can be described as five layers: (1) **identity/addressing** (VPA plus mapper), (2) **request formats** (intent URI, QR, collect, mandate), (3) **authorisation** (device binding plus PIN in a common library, delegation, Lite), (4) **switching and settlement** (NPCI switch, bank netting via RBI), and (5) **governance** (limits, TAT, disputes, market caps). Its moat is that layers 1, 4 and 5 are shared, not owned by any app.
- NPCI removed P2P collect, so even UPI found pull payments a fraud vector. A crypto clone should default to push and gate pull behind pre-authorised mandates.

### Gaps
- The exact current UPI Lite caps, the AutoPay no-PIN threshold, and credit-line on UPI volumes were not verified this session.
- No primary NPCI circular was fetched. Every 2025–26 rule change rests on news reports of the circulars.

## 2. Why UPI succeeded: interoperability, zero MDR, DPI, market caps, scale

### Takeaway
UPI won through mandated interoperability (any app ↔ any bank ↔ any VPA), a common rulebook, IndiaStack identity (Aadhaar e-KYC, Jan Dhan accounts), and, above all, a zero-MDR mandate since 2020 that made acceptance free. The cost is that the economics never closed. The government subsidy (₹2,000 cr in FY27) covers a fraction of an estimated ~₹20,700 cr annual cost. A 0.4% MDR on P2M payments above ₹2,000 was approved and then deferred past Diwali 2026. The 30% per-app cap is due on 31 Dec 2026, but PhonePe (45.6%) and Google Pay (32.2%) still exceed it.

### Cited Findings
- **Volume:** October 2026 had 25.47B transactions (+5.8% MoM, +23% YoY) worth ₹31.53 lakh crore, an average of 822M per day and above ₹1 lakh crore per day in value. September 2026: 24.07B. [verified 2026-11, single press report of NPCI data] — [Entrepreneur India, 3 Nov 2026](https://india.entrepreneur.com/business-news/upi-hits-record-25-47-bn-transactions-in-october-daily-value-crosses-inr-1-l-cr)
- **FY26 total:** 218.6B transactions worth ₹284.7 lakh crore. — [Angel One](https://oga-prod.angelone.in/news/market-updates/upi-records-218-6-billion-transactions-valued-at-284-7-lakh-crore-in-fy26); [Business Today](https://www.businesstoday.in/india/story/upi-processes-21860-crore-transactions-in-fy26-peak-growth-seen-in-dec-jan-months-523412-2026-03-31)
- **App shares, Sep 2026:** PhonePe 45.57%, Google Pay 32.23%, Paytm 8.1%. PhonePe and Google Pay combined are at 77.8%, down from 81.9% a year earlier. October breakdown not yet published. — [Entrepreneur India](https://india.entrepreneur.com/business-news/upi-hits-record-25-47-bn-transactions-in-october-daily-value-crosses-inr-1-l-cr); [ProductGrowth](https://productgrowth.in/insights/fintech/phonepe-google-pay-upi-share-september-2026/); [Outlook Business](https://www.outlookbusiness.com/economy-and-policy/phonepe-google-pay-combined-upi-market-share-drops-below-80-for-first-time)
- **30% cap:** Introduced in Nov 2020, it applies to TPAPs only (bank apps are exempt). The deadline was extended three times; the latest (Dec 2024) set compliance at 31 Dec 2026. Reports conflict on whether over-cap players then get a further 2-year glide path. I found no 2026 announcement of a further extension (unverified either way). — [Business Today](https://www.businesstoday.in/tech-today/news/story/npci-extends-30-upi-market-share-cap-deadline-on-3rd-party-apps-to-december-2026-459171-2024-12-31); [MediaNama](https://www.medianama.com/2025/01/223-npci-extends-upi-market-share-cap-deadline-to-2026-google-phonepe-relief/)
- **Zero MDR and subsidy:** The FY27 Budget allocates ₹2,000 cr for the RuPay-debit and low-value BHIM-UPI P2M incentive, against a FY26 revised estimate of ₹2,196 cr. — [YourStory](https://yourstory.com/2026/02/government-allocates-rs-2000-cr-upi-rupay-incentives-budget-2026); [Business Standard](https://www.business-standard.com/budget/news/upi-rupay-subsidy-fy27-rs-2000-crore-mdr-126020100741_1.html)
- **Cost gap:** Outlook Business puts the industry's annual operating cost at about ₹20,700 cr. A parliamentary panel called for MDR to make UPI sustainable. — [Outlook Business](https://www.outlookbusiness.com/economy-and-policy/20700-crore-upi-problem-why-govt-is-considering-merchant-charges-again); [Inc42](https://inc42.com/buzz/parliamentary-panel-calls-for-mdr-on-upi-to-ensure-sustainability/)
- **MDR returning (announced, deferred):** 0.4% on specified P2M transactions above ₹2,000, capped at ₹300 for transactions of ₹75,000 and above. P2P and payments of ₹2,000 or less stay exempt. It was due 15 Oct 2026; the UPI Steering Committee deferred it on 13 Oct to after Diwali, with a new date to be notified. **Not live as of early Nov 2026.** — [Entrepreneur India](https://india.entrepreneur.com/business-news/upi-hits-record-25-47-bn-transactions-in-october-daily-value-crosses-inr-1-l-cr); [Angel One – DFS tiered incentives](https://www.angelone.in/news/economy/dfs-considers-phased-withdrawal-of-upi-support-through-tiered-incentives)
- **Statutory change (unverified):** One blog claims "Bill No. 150 of 2026" replaces the statutory zero-MDR guarantee with notification-based MDR. — [AllAboutFintech](https://allaboutfintech.beehiiv.com/p/upi-mdr-2026-what-bill-no-150-actually-changes)
- **App business models under zero MDR** [background]: TPAPs monetise through lending distribution, insurance and mutual-fund distribution, soundbox device rentals, bill-payment and recharge fees, ads/rewards, and payment-gateway (PG) fees on cards. UPI itself is a loss-leading acquisition funnel. Examples: Paytm soundbox subscriptions and PhonePe lending and insurance. A specific primary source was not fetched this session.
- **DPI framing** [background, not re-fetched]: BIS and the IMF describe UPI as public-good infrastructure layered on Aadhaar (identity) and Jan Dhan (accounts), with competition at the app layer. — [BIS Working Paper 1196 "Lessons from UPI"](https://www.bis.org/publ/work1196.htm); [IMF WP/23/078 "Stacking up the benefits: India's DPI"](https://www.imf.org/en/Publications/WP/Issues/2023/04/07/Stacking-up-the-Benefits-Lessons-from-Indias-Digital-Journey-531692)

### Inferences
- Zero MDR drove merchant adoption but concentrated the market in two Big Tech-backed apps that could afford to lose money on payments. The 30% cap is the regulator's attempt to correct the market structure it created, and it has been deferred three times because enforcing it would break service.
- For a crypto "UPI": zero-fee acceptance is a growth weapon, but someone must pay for the switch, the relayers and the dispute handling. Stablecoin float yield, which UPI apps can't capture because banks hold deposits, is the obvious funding source that UPI never had.

### Gaps
- Primary NPCI monthly statistics for October 2026 were not fetched; the figures rest on one press report.
- No confirmed 2026 decision on extending the 30% cap again.

## 3. Crypto analogues per UPI layer

### Takeaway
Every UPI layer has at least one crypto analogue, but each is chain- or wallet-specific. No neutral body binds them into one rulebook. The closest functional matches: ENS/Basenames/SNS and Celo SocialConnect for VPA plus mapper, EIP-681/Solana Pay/LNURL for UPI QR, CCTP/USDT0 plus intent solvers for the switch, passkey smart accounts for device binding plus PIN, ERC-7715/ERC-4337 session keys for AutoPay and UPI Circle, and escrow/Kleros for ODR. Mojaloop and Nexus are the closest open-network analogues, but both are fiat.

### Cited Findings
**Naming / mapper (VPA + UPI Number)**
- Celo SocialConnect plus ODIS: phone numbers are blinded, ODIS returns a pepper, and an obfuscated identifier is stored on-chain. Attestation issuers are federated (anyone can issue mappings). MiniPay (Opera) uses phone-number-to-address payments for USD stablecoins. Live. [verified 2026-11] — [Celo ODIS docs](https://docs.celo.org/developer/contractkit/odis); [SocialConnect lookup guide](https://socialconnect-docs.vercel.app/guides/lookup-identifier); [MiniPay docs](https://minipay-docs.web.app/getting-started/why-minipay.html)
- This is the closest crypto analogue to the NPCI mobile-number mapper, including the "many issuers, shared registry" federation, though it is Celo-scoped. (Inference)
- ENS (`.eth`, multi-chain address records under ENSIP-9/11), Basenames (ENS subdomains on Base), SNS (`.sol`) and Lightning Address (LUD-16, `user@domain` → LNURL-pay) are all live. [background, not re-fetched] — [ENSIP-11](https://docs.ens.domains/ensip/11); [Basenames](https://www.base.org/names); [SNS docs](https://docs.sns.id/); [LUD-16](https://github.com/lnurl/luds/blob/luds/16.md)

**QR / URI standards (UPI intent / Bharat QR)** [background, not re-fetched]
- EIP-681 (`ethereum:<addr>@<chainId>/transfer?address=..&uint256=..`) is the EVM equivalent of `upi://pay`. Solana Pay has a transfer request (static/dynamic-like) and a transaction request, where the server builds the transaction: the analogue of dynamic QR. Lightning has BOLT11 (one-time invoice, like dynamic QR), BOLT12 offers (reusable, like static QR) and LNURL-pay. — [EIP-681](https://eips.ethereum.org/EIPS/eip-681); [Solana Pay spec](https://docs.solanapay.com/spec); [BOLT11](https://github.com/lightning/bolts/blob/master/11-payment-encoding.md)
- No EMVCo-style cross-chain QR exists that any wallet must accept the way Bharat QR is accepted. (Inference / gap)

**Switch (NPCI)** [background, not re-fetched]
- Circle CCTP burn-and-mint for native USDC across chains; USDT0 (LayerZero OFT) for USDT; intent networks such as Across, UniswapX, ERC-7683 and NEAR Intents, where solvers fill cross-chain orders. These route value but are not neutral: each is operated by an issuer or a protocol and has no rulebook on refunds, TAT (turnaround time) or limits. — [Circle CCTP](https://developers.circle.com/stablecoins/cctp-getting-started); [USDT0](https://docs.usdt0.to/); [ERC-7683](https://eips.ethereum.org/EIPS/eip-7683)

**PIN + device binding** [background]
- Passkeys (WebAuthn P-256, verified on-chain through RIP-7212/EIP-7951 precompiles) in smart accounts (ERC-4337 / EIP-7702) give the same "device possession + biometric/PIN" model. The key lives in the secure enclave, matching UPI's device binding. — [EIP-7951](https://eips.ethereum.org/EIPS/eip-7951); [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337)

**Collect / mandates / delegation (AutoPay, UPI Circle)**
- ERC-7715: a dapp requests scoped permissions (ERC-20 / native-token periodic or streaming allowances) from a smart-account wallet. In MetaMask, the Smart Accounts Kit docs now require MetaMask ≥13.23.0 (earlier this needed Flask). The method name changed from `wallet_grantPermissions` to `wallet_requestExecutionPermissions` across doc versions, and the user must be upgraded to a MetaMask smart account. The EIP is still a draft and defines only the request/response, not enforcement. [verified 2026-11] — [MetaMask Advanced Permissions](https://docs.metamask.io/smart-accounts-kit/concepts/advanced-permissions/); [Eco guide](https://eco.com/support/en/articles/11953354-erc-7715-explained-wallet-permissions-sessions-and-subscriptions)
- This maps directly to AutoPay (recurring cap) and to UPI Circle full delegation (a secondary spender with per-transaction and monthly caps). (Inference)
- EIP-2612 permit and EIP-3009 transferWithAuthorization are one-time signed pulls, like a UPI one-time mandate or a merchant collect request approved by signature. [background] — [EIP-2612](https://eips.ethereum.org/EIPS/eip-2612); [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009)
- Stable and Tempo subscription/recurring primitives: not verified this session (see Gaps).

**Disputes / ODR** [background, not re-fetched]
- Escrow contracts with refund windows, Kleros (decentralised arbitration courts) and merchant refund protocols exist, but none gives the TAT-plus-auto-reversal-plus-compensation guarantee that RBI imposes. — [Kleros](https://kleros.io/)

**Offline / low-end (UPI Lite, 123PAY)** [background, not re-fetched]
- Kotani Pay offers USSD stablecoin on/off-ramp in Africa, and MiniPay targets light Android phones. A Lite-style on-device balance maps to a session key with a small spending cap. — [Kotani Pay](https://kotanipay.com/)

**Open payment networks (fiat)** [verified 2026-11]
- Mojaloop is open-source IIPS software (DPI). It is live in Rwanda, Liberia (the CBL IIPS) and The Gambia, with 8–12 countries said to be in implementation for 2026. Mastercard, Mojaloop and AfricaNenda announced a partnership in Sep 2026. — [Mojaloop – Celebrating growth 2026](https://mojaloop.io/celebrating-growth-2026/); [FF News – Liberia IIPS](https://ffnews.com/newsarticle/paytech/central-bank-of-liberia-launches-transformational-inclusive-instant-payments-system-iips-powered-by-mojaloop); [TechAfrica News](https://techafricanews.com/2026/09/30/mastercard-partners-with-mojaloop-and-africanenda-to-strengthen-instant-payments-in-africa/)
- Mojaloop's design includes the switch, an account lookup service (ALS, the analogue of the UPI mapper), quotes and a settlement layer. This is the closest open-source blueprint of UPI's architecture. [background] — [Mojaloop docs](https://docs.mojaloop.io/)
- Project Nexus is the "switch of switches" for IPS interlinking (see §1). Beckn/ONDC is an open-network protocol for commerce discovery, not payments, but is a governance analogue: an open protocol plus neutral network operator plus competing apps. [background] — [Beckn](https://becknprotocol.io/)

### Inferences
| UPI layer | Best crypto analogue (live) | Missing vs UPI |
|---|---|---|
| VPA + mapper | ENS/Basenames, SNS, Lightning Address; SocialConnect for phone numbers | No shared cross-chain registry with mandated resolution by every wallet |
| Intent URI / QR | EIP-681, Solana Pay, BOLT11/12, LNURL | No single multi-chain QR standard that all wallets must scan |
| NPCI switch | CCTP, USDT0, intent/solver networks | No neutral operator; no TAT/refund rulebook |
| Device + PIN | Passkey smart accounts (4337/7702) | Wallet-specific; no common PIN library |
| Collect / AutoPay / Circle | EIP-3009/2612, ERC-7715 permissions, session keys | 7715 is still a draft; inconsistent wallet support |
| Lite / 123PAY | Capped session keys; USSD (Kotani Pay) | No standard offline protocol |
| Disputes / ODR | Escrow, Kleros, app-level refunds | No mandatory auto-reversal or compensation |
| Governance / caps | none | No membership rules, limits or market-share caps |

### Gaps
- Stable and Tempo subscription/recurring-payment primitives were not researched this session (budget). Their status (live vs announced) needs a separate check.
- No source was found on any crypto project claiming a multi-wallet dispute rulebook.

## 4. Who comes closest to the full UPI model, and what no one has built

### Takeaway
No crypto project replicates all of UPI. The closest stacks are: (a) Celo + MiniPay + SocialConnect (phone mapper, light-phone wallet, stablecoins), though on a single chain, with a single dominant wallet and no switch rulebook; (b) Lightning (LNURL / Lightning Address / BOLT12 give interoperable addressing and invoices across many wallets, closest to "any app ↔ any app"), though BTC-only, with no mandates and no disputes; and (c) EVM smart-account stacks (passkeys + ERC-7715 + CCTP), which have the pieces but not the neutral glue. The missing layer is a neutral, multi-wallet, multi-chain switch with shared naming, a shared request/QR format, mandatory refund and turnaround rules, and membership governance: the NPCI role itself.

### Cited Findings
- SocialConnect's federated issuer model and MiniPay's phone-number stablecoin payments are live on Celo. — [SocialConnect docs](https://socialconnect-docs.vercel.app/guides/lookup-identifier); [MiniPay docs](https://minipay-docs.web.app/getting-started/why-minipay.html)
- Lightning Address and LNURL are open specs implemented across independent wallets. [background] — [LUD-16](https://github.com/lnurl/luds/blob/luds/16.md)
- ERC-7715 does not specify enforcement, only request shapes, so wallets will diverge. — [Eco guide](https://eco.com/support/en/articles/11953354-erc-7715-explained-wallet-permissions-sessions-and-subscriptions)
- Fiat open networks (Mojaloop, Nexus) show the governance pattern (scheme rules plus a central hub operator) that crypto lacks. — [Mojaloop](https://mojaloop.io/celebrating-growth-2026/); [MAS – Nexus](https://www.mas.gov.sg/news/media-releases/2024/project-nexus-completes-comprehensive-blueprint-for-connecting-domestic-ipses-globally)

### Inferences
- Design implications for a universal "UPI-like" multi-chain app such as WondrPay:
  1. Separate the app from the rails. Be one front end on a published, open request format (a multi-chain `pay` URI that wraps EIP-681, Solana Pay and others) that any wallet can implement.
  2. Run a resolver like the NPCI mapper: handle → (chain, token, address) preferences, built on ENS/Basenames text records plus an optional phone-hash lookup like SocialConnect.
  3. Default to push. Allow pull only through signed mandates (EIP-3009 for one-time, ERC-7715 or session keys for recurring and delegated), with UPI-style caps: per transaction, monthly, and a 24h cooling limit for new delegations.
  4. Publish a rulebook that plays NPCI's role: refund TAT, auto-reversal of failed cross-chain legs, and dispute escalation (merchant → app → arbiter such as Kleros). This is the actual unbuilt layer.
  5. Plan economics on the assumption that zero MDR is unsustainable without a payer. UPI is already moving to 0.4% MDR above ₹2,000. Float yield or small merchant fees above a threshold mirror the direction India itself is taking.
- UPI's own history warns that zero fees plus a free app layer produces a duopoly. A neutral switch should consider per-app share limits or at least open membership from day one.

### Gaps
- I found no evidence of any crypto consortium (wallets plus issuers) drafting a shared payment-scheme rulebook. This may exist outside what search surfaced.
- Live/announced status of Stable and Tempo payment-chain features was not verified.
