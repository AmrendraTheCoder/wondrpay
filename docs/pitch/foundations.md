# WondrPay: 3-minute pitch for the Foundations track

**The question this pitch answers:** why is WondrPay better than what already exists, and why will people pick it once it's on mainnet?

**Timing:** about 470 spoken words. Speak at a steady ~160 words a minute and rehearse with a timer. Section times are targets.

Lines in *italics* are actions, not spoken.

---

## 0:00 to 0:15. Hook: the elephant in the room

> "Everyone asks us the same thing: why WondrPay, when cards, crypto wallets and Binance Pay already exist?
>
> Here's the honest answer. Each of them breaks in one of three places: **cost, safety or simplicity.** We fixed all three at once."

## 0:15 to 1:25. What's broken today, and what we do instead

> "**Cards and Stripe.** A shop pays 2 to 3 percent, waits days for its money, and loses to chargeback fraud.
> With WondrPay it pays **half a percent**, the money lands in its own wallet **in seconds**, and a refund needs proof from a **verified human**, stored on Arkiv where no one can edit it.
>
> **Crypto wallets like MetaMask.** A seed phrase you'll lose. Gas you have to buy first. Forty-two-character addresses that scammers copy with lookalikes: that's **address poisoning**. And 'approve' buttons that can **drain a wallet** years later.
> WondrPay has **no seed phrase**: the key is locked by your fingerprint, on your phone. **No gas**: we pay it. You pay **names**, like `priya.wondrpay.eth`, and shops carry a **verified badge**. And there are **no approvals at all**. You sign one exact amount, to one recipient, valid for ten minutes. Even our own relayer can't change where it goes.
>
> **Custodial apps like Binance Pay.** Easy, but the money isn't yours. Accounts get frozen, and platforms can fail.
> WondrPay **never holds your money**. It goes straight from your wallet to the shop's.
>
> **Crypto checkouts like Coinbase Commerce** stop at 'paid'. Refunds are manual, there are no subscriptions, and the customer still needs gas. We ship all three."

## 1:25 to 1:50. What's actually new

> "What's new isn't one feature. It's the combination: **UPI's two-tap experience, on digital dollars, with one real human behind every account**, through World ID.
>
> That one rule makes everything else safe. Cashback **can't be farmed by bots**. Refunds **can't be abused** by fake accounts. And every reward is paid **from fees we've already earned**, never from a token we printed."

## 1:50 to 2:40. Go-to-market

> "We go **shops first**, because shops bring shoppers.
>
> - A shop joins in minutes with our **WooCommerce plugin**, a **Shopify guide**, or just a **payment link**. No code, no setup fee.
> - We start where people **already hold dollars** and W Group **already has users**: Gulf workers paying family in India, Ukrainian freelancers paid in USDT, and savers in Turkey, Nigeria and Argentina.
> - Shoppers come for **zero gas and cashback**, and stay because it's faster than their bank. **Ten free transfers a month** to friends pulls in the next user.
> - **WhiteBIT** is the way in and out: dollars in, rupees and hryvnias out.
>
> Year one: **5,000 shops and 100,000 verified people.**"

## 2:40 to 3:00. Mainnet and close

> "For mainnet we have three steps: an **audit** of our three contracts, the **fee split on-chain**, and **key recovery**, so a lost phone isn't lost money. Everything else runs today on Whitechain testnet.
>
> **Cheaper than cards. Safer than wallets. Yours, unlike exchanges.** That's WondrPay. Thank you."

---

## One-slide comparison (for the deck or the judges' sheet)

| | Cards / Stripe | Crypto wallets (MetaMask) | Custodial apps (Binance Pay) | Crypto checkouts (Coinbase Commerce) | **WondrPay** |
|---|---|---|---|---|---|
| Shop fee | 2–3% | n/a | low | ~1% | **0.5%** |
| Shop gets the money | 2–7 days | seconds | inside the app | seconds | **seconds, own wallet** |
| Who holds the money | bank | you | the platform | you | **you** |
| Seed phrase | no | **yes** | no | yes (customer) | **no: fingerprint / PIN** |
| Gas for the customer | n/a | **yes** | no | **yes** | **no: we pay it** |
| Pay by name, not address | n/a | rarely | in-app only | no | **yes: `name.wondrpay.eth`** |
| Approval-drain risk | n/a | **yes** | n/a | depends | **none: one exact amount, one recipient** |
| Refunds | chargebacks (fraud-prone) | manual | in-app | manual | **request with proof, verified human, on-chain** |
| Subscriptions | yes | no | limited | no | **yes, cancel any time** |
| Bot-proof rewards | no | no | KYC | no | **one human, World ID** |

## Claims and where they come from

Every line in the script maps to something built. Check these before you go on stage.

| Claim | What backs it |
|---|---|
| "Half a percent" | Our pricing, `ECON.feeBps = 50` in `packages/shared/src/rewards.ts`. **Not deducted on-chain yet**: that's the "fee split on-chain" mainnet step. |
| "In seconds", "straight to the shop's wallet" | `PaymentRouter` forwards USDT from payer to the shop's payout address in one transaction; WondrPay never holds it. |
| "No seed phrase", "locked by your fingerprint" | Device wallet key encrypted by a passkey (fingerprint / Face ID) or a 6-digit PIN; payments ask for it every time by default. |
| "No approvals", "can't change where it goes" | USDT `receiveWithAuthorization` for the exact amount. The nonce binds the recipient and memo, and only the router can execute it (`contracts/src/PaymentRouter.sol`). |
| "Valid for ten minutes" | Transfers to people: `validBefore` is 10 minutes. Shop QR orders expire after 5 minutes. |
| "Verified badge", "one real human" | World ID: one person, up to 5 wallets; shops verify once. |
| "Refund needs proof … on Arkiv" | Refund requests need World ID, are stored on Arkiv, and the contract only refunds the original buyer, never more than they paid. |
| "Cashback can't be farmed" | Rewards claimed with a fresh World ID check; per-person limits of 5 claims a day and $5 a month across all wallets. |
| "From fees we've already earned" | Reward budget = 50% × (fee − gas); public ledger on the Rewards page. |
| "WooCommerce plugin, Shopify guide, payment link" | Business portal; plugin download and guides on `/developers`. |
| "5,000 shops, 100,000 people" | Year-one model in `docs/pitch/whitechain.md`. These are targets, not traction. |

## Hard questions to expect

**"Your relayer is a central point. What if it goes down or turns bad?"**
It can't steal or redirect money: each signature is for one amount to one recipient. If it goes down, payments pause; nothing is lost. The router has a switch (`relayerGated`) that can open submission to anyone, and on mainnet we'd run several relayers.

**"What if WondrPay shuts down?"**
The money is in the user's own wallet on Whitechain, not with us. Honest gap today: the key lives on one phone and there's no export or recovery yet. That's the "key recovery" step in the mainnet plan.

**"Why not just use UPI?"**
UPI is rupees, inside India. It can't hold dollars or cross a border. We copy its experience, not its rails.

**"Who pays for gas at scale?"**
The shop fee. About 4 cents of every 50-cent fee on $100 goes to gas, measured on Whitechain. Payments too small to cover their gas earn no cashback, so rewards never run at a loss.

**"Regulation and KYC?"**
WondrPay is non-custodial: it never holds customer funds. Converting dollars to local money happens at a licensed exchange (WhiteBIT), which does the KYC.

**"Why would a shop switch from cards?"**
A fifth of the fee, the money the same day, and fewer fake chargebacks. And it can start with a payment link, with no integration at all.

**"Is this live?"**
Yes, on Whitechain testnet: https://wondrpay-app.vercel.app. Paying a shop, sending money to people, subscriptions, refunds, rewards and the business portal all work end to end.
