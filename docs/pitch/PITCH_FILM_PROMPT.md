# WondrPay pitch film: production prompt (3:00)

One brief to turn everything we already have (the recorded demo, app screenshots, brand images and the Foundations script) into a 3-minute pitch film. It answers the judges' main question: **why is WondrPay better than what exists, and how will it win users?**

**How to use this file:**
1. **All-in-one AI video tool** (Hera, InVideo AI, Runway, Veo, Kling, Sora, Pika, HeyGen, Descript): upload the assets listed in section 2, then paste the **master prompt** (section 1). If the tool limits prompt length, paste the **short prompt** (section 7) instead.
2. **Generated shots**: use the shot prompts in section 4 for the few scenes we have no footage of (the "problem" scenes).
3. **Human editor** (Premiere, Final Cut, CapCut, After Effects, Remotion): sections 2–6 are the full edit list, with exact file paths and timecodes.

> **Honesty rules (non-negotiable):**
> - Label the product as **live on Whitechain testnet**.
> - The World App approval in the demo video is **simulated**. Keep its "simulated" caption.
> - Show year-one numbers as **targets**, never as traction.
> - Never show a private key, a seed phrase from a real wallet, or a real person's face.

---

## 1. Master prompt (paste first)

```
Make a 3-minute, 16:9, 1080p (4K if available), 30 fps pitch film for "WondrPay": UPI for digital
dollars. People pay shops and friends in USDT on the Whitechain blockchain by scanning a QR or typing a
name like priya.wondrpay.eth, confirming with their fingerprint or PIN. No gas, no seed phrase,
settled in about 3 seconds. Built on Whitechain, Arkiv (receipts no one can edit), ENS (names) and
World ID (one real person per account). Live on Whitechain testnet at wondrpay-app.vercel.app.

STORY. The film answers one question: "Why is this better than cards, crypto wallets and Binance
Pay?" Structure: (1) hook: today's options break on cost, safety or simplicity; (2) four quick
"problem -> our fix" beats: cards, crypto wallets, custodial apps, crypto checkouts. Each problem is
shown in a cold grey world, then cut to our real app footage in full color; (3) what's genuinely new:
one verified human behind every account, so cashback and refunds can't be abused; (4) go-to-market:
shops first, three money corridors, WhiteBIT for cash in and out; (5) the path to mainnet and a
confident close.

USE MY FOOTAGE. Most of the film is my uploaded screen recording (wondrpay-demo.mp4) and app
screenshots. Place phone screenshots (390 px wide) inside a realistic black titanium phone frame, and
laptop screenshots (1280x860) inside a thin dark laptop frame. Never redraw or invent app screens;
crop, zoom, pan and frame the real ones. Generated footage is only for the "problem" scenes and
abstract backgrounds.

LOOK. Dark, premium, calm: Stripe Sessions meets an Apple keynote. Background near-black navy #0B0D14
with a faint dot grid. Hero color electric blue #2448FF. Accent lime #DDF05A for success, money in and
key numbers. Green #3DDC97 for "received", red #FF6B6B only for problems and money out. Problem scenes
are desaturated grey-blue with a little film grain; our scenes snap to full color. Font: Manrope
(800 for headlines and numbers, 600 for labels), tight tracking, tabular figures. Big type: one idea
per screen, at most 6 words of on-screen text at a time.

MOTION. Springy ease-out (cubic-bezier .2,.9,.3,1). Cards rise 10 px and settle. Numbers count up.
Slow push-ins on phones, gentle parallax between the device and the dot grid, at most 10 degrees of 3D
tilt. On every successful payment, a lime check draws itself with two pulse rings. Transitions:
quick whip-pans or match cuts on the phone frame; no star wipes, no glitch effects.

SOUND. Minimal electronic bed around 100 BPM, soft sub bass, building gently into the go-to-market
section. Glassy UI clicks on taps and a bright two-note chime on each payment. Duck the music under
the voiceover by 12 dB.

VOICE. Warm, confident, global English, about 155 words a minute. Use the voiceover in section 3
word for word. Burn in clean subtitles (Manrope 600, white, bottom center, no box).

END CARD. The uploaded cover image (wondrpay-cover.png): logo, "UPI for digital dollars.", the four
chips, "Built on Whitechain · Arkiv · ENS v2 · World ID", URL wondrpay-app.vercel.app. Hold 4 seconds.
```

---

## 2. Asset manifest (upload all of these)

Paths are relative to the repo root.

### Recorded demo: `docs/video/wondrpay-demo.mp4` (3:57, 1080p)
Smaller copy for upload limits: `docs/video/wondrpay-demo-small.mp4`. Subtitles: `docs/video/wondrpay-demo.srt`.

| Clip | Time in the demo | What's on screen | Used in scene |
|---|---|---|---|
| D1 | 0:16–0:30 | Amaron demo store, developer view of the integration | 7 |
| D2 | 0:30–0:42 | Shopping, bag, QR appears on checkout | 2 |
| D3 | 0:42–0:58 | Phone scans the QR, four trust checks tick, PIN, **Paid** | 2 |
| D4 | 0:58–1:09 | Whitechain block explorer: relayer paid gas, USDT straight to the shop | 2, 4 |
| D5 | 1:09–1:33 | Subscription with Autopay, limits on-chain, cancel any time | 5 |
| D6 | 1:33–1:42 | Shopper's "My orders" and the shop's live dashboard | 7 |
| D7 | 1:42–1:54 | App: balance, Money, history | 3 |
| D8 | 1:54–2:12 | Scan Priya's QR, pay 2.50 to `priya.wondrpay.eth`, her phone pops | 3 |
| D9 | 2:12–2:27 | Payment thread, scratch card wins cashback | 6 |
| D10 | 2:27–2:45 | World ID sheet, approval (**simulated**), WBT arrives | 6 |
| D11 | 2:45–3:01 | Order page, refund request form, PIN | 5 |
| D12 | 3:01–3:08 | Refund request stored on Arkiv | 5 |
| D13 | 3:08–3:25 | Shop dashboard: refund 20 / 50 / 100 % | 5 |
| D14 | 3:25–3:37 | Refund lands: phone gets +1.65 | 5 |
| D15 | 3:37–3:46 | Order page shows "partly refunded" for both sides | 5 |

### App screenshots: `docs/screens/`
| File | Size | What it shows | Frame | Scene |
|---|---|---|---|---|
| `wondrpay-1-home.png` | 390×844 | Home: 4.50 USDT, "0 gas", `amrendravs.wondrpay.eth`, Scan / Pay anyone / Receive / Shop QR | phone | 1, 3 |
| `wondrpay-2-money.png` | 390×844 | Money: sent / received / net, monthly bars | phone | 3 |
| `wondrpay-3-transactions.png` | 390×844 | Transaction history with identicons | phone | 4 |
| `order-v2.png`, `order-v2-dark.png` | 390×1579 / 390×844 | Order page (light / dark) | phone, scroll the tall one | 5 |
| `order-request-form.png` | 390×1123 | Refund request form | phone, scroll | 5 |
| `order-refund-payer.png` | 390×1255 | Refund received, buyer's view | phone, scroll | 5 |
| `shop-payments-refunds.png` | 390×844 | Shop app: payments and refunds | phone | 5 |
| `store-dashboard.png` | 1280×860 | Amaron orders dashboard | laptop | 7 |
| `dashboard-v2-dark.png` | 1280×860 | Orders dashboard v2, dark | laptop | 7 |
| `dashboard-v2-drawer.png` | 1280×860 | Dashboard with an order drawer open | laptop | 7 |
| `store-refund-review.png` | 1280×860 | Shop reviewing a refund request | laptop | 5 |

### Brand: `docs/brand/`
| File | Use |
|---|---|
| `wondrpay-cover.png` (1280×720) | Opening logo sting (crop to the logo) and the end card |
| `wondrpay-logo-1024.png`, `wondrpay-logo-512.png` | Logo reveals, corner bug, favicon-style transitions |

### Capture three more screens before editing (new features, no screenshots yet)
Open https://wondrpay-app.vercel.app on a phone-sized window (390×844) and screenshot:
1. **`/portal`** after picking "WooCommerce / Shopify": the setup timeline with ticks. Used in scene 7.
2. **`/you` → Payment security**: "Every payment" and the World ID limit. Used in scene 3.
3. **`/rewards`**: the cards grid and "How rewards work". Used in scene 6.

---

## 3. Storyboard and voiceover (3:00)

The voiceover is the Foundations script (`docs/pitch/foundations.md`), about 460 words. **Bold** words in the on-screen column are the only text on screen.

| # | Time | Picture | On-screen text | Voiceover |
|---|---|---|---|---|
| 1 | 0:00–0:15 | Black → three grey glass tiles labelled Cost, Safety, Simplicity crack one by one (generated, shot G1). Hard cut: the logo from `wondrpay-cover.png` snaps in on blue, then the home screen (`wondrpay-1-home.png`) rises in a phone. | **Cost. Safety. Simplicity.** → **WondrPay** | "Everyone asks us the same thing: why WondrPay, when cards, crypto wallets and Binance Pay already exist? Here's the honest answer. Each of them breaks in one of three places: cost, safety or simplicity. We fixed all three at once." |
| 2 | 0:15–0:35 | **Problem:** grey card terminal, receipt printing "2.9% + fee", a calendar flipping 3 days, a "chargeback" stamp (shot G2). **Fix:** full color, D2 → D3 (scan, checks, PIN, Paid, lime check) → 3 s of D4 explorer. | **2–3% · 3 days · chargebacks** → **0.5% · seconds · proof** | "Cards and Stripe. A shop pays 2 to 3 percent, waits days for its money, and loses to chargeback fraud. With WondrPay it pays half a percent, the money lands in its own wallet in seconds, and a refund needs proof from a verified human, stored on Arkiv where no one can edit it." |
| 3 | 0:35–1:05 | **Problem:** a 12-word seed phrase on paper burning (G3), a red "Insufficient ETH for gas" toast, two addresses that differ by one character (G4), a red "Approve unlimited" button (G5). **Fix:** phone with `wondrpay-1-home.png` → fingerprint glyph → D8 (paying `priya.wondrpay.eth`, her phone pops) → Payment security screen (capture 2). | **Seed phrase · gas · lookalike addresses · unlimited approvals** → **Fingerprint · 0 gas · names · one exact amount** | "Crypto wallets like MetaMask. A seed phrase you'll lose. Gas you have to buy first. Forty-two-character addresses that scammers copy with lookalikes: that's address poisoning. And 'approve' buttons that can drain a wallet years later. WondrPay has no seed phrase: the key is locked by your fingerprint, on your phone. No gas: we pay it. You pay names, like priya.wondrpay.eth, and shops carry a verified badge. And there are no approvals at all. You sign one exact amount, to one recipient, valid for ten minutes. Even our own relayer can't change where it goes." |
| 4 | 1:05–1:15 | **Problem:** grey app screen "Account restricted" with a padlock (G6). **Fix:** simple animated line from a wallet icon straight to a shop icon, no box in between, then 3 s of D4 with the "to" address highlighted in lime. | **Not your money** → **Wallet → shop. Nothing in between.** | "Custodial apps like Binance Pay. Easy, but the money isn't yours. Accounts get frozen, and platforms can fail. WondrPay never holds your money. It goes straight from your wallet to the shop's." |
| 5 | 1:15–1:25 | Fast montage, about 2 s each: D5 (Autopay on) → D11 (refund form) → `store-refund-review.png` in a laptop → D14 (+1.65 lands, lime chime). | **Refunds · subscriptions · no gas** | "Crypto checkouts like Coinbase Commerce stop at 'paid'. Refunds are manual, there are no subscriptions, and the customer still needs gas. We ship all three." |
| 6 | 1:25–1:50 | D10 (World ID sheet, keep the "simulated" caption) → a ring of 12 identical bot avatars collapsing into one glowing human silhouette (G7) → D9 scratch card reveal → rewards screen (capture 3). | **One real human per account** | "What's new isn't one feature. It's the combination: UPI's two-tap experience, on digital dollars, with one real human behind every account, through World ID. That one rule makes everything else safe. Cashback can't be farmed by bots. Refunds can't be abused by fake accounts. And every reward is paid from fees we've already earned, never from a token we printed." |
| 7 | 1:50–2:40 | Portal timeline (capture 1) ticking through steps → D1 (Amaron integration) → `store-dashboard.png` / `dashboard-v2-drawer.png` in a laptop → dark world map, three glowing lime arcs: UAE→India, Ukraine→EU, and dots on Turkey, Nigeria, Argentina (G8) → WhiteBIT-style "USDT ⇄ ₹ / ₴" exchange chip (no third-party logos unless licensed) → counters count up. | **Shops first** → **Plugin · Shopify · payment link** → **Gulf → India · Ukraine → EU · dollar savers** → **5,000 shops · 100,000 people (year-one target)** | "We go shops first, because shops bring shoppers. A shop joins in minutes with our WooCommerce plugin, a Shopify guide, or just a payment link. No code, no setup fee. We start where people already hold dollars and W Group already has users: Gulf workers paying family in India, Ukrainian freelancers paid in USDT, and savers in Turkey, Nigeria and Argentina. Shoppers come for zero gas and cashback, and stay because it's faster than their bank. Ten free transfers a month to friends pulls in the next user. WhiteBIT is the way in and out: dollars in, rupees and hryvnias out. Year one: 5,000 shops and 100,000 verified people." |
| 8 | 2:40–2:52 | Three chips rise in a row, each ticking from grey to lime: **Audit**, **Fee split on-chain**, **Key recovery**. Small caption under them: "Everything else: live on testnet". | **Audit · On-chain fee · Key recovery** | "For mainnet we have three steps: an audit of our three contracts, the fee split on-chain, and key recovery, so a lost phone isn't lost money. Everything else runs today on Whitechain testnet." |
| 9 | 2:52–3:00 | Three lines stack, one per beat, then the end card (`wondrpay-cover.png`) holds 4 s. | **Cheaper than cards. Safer than wallets. Yours, unlike exchanges.** | "Cheaper than cards. Safer than wallets. Yours, unlike exchanges. That's WondrPay. Thank you." |

---

## 4. Generated shot prompts (problem scenes only)

Style for all of them: desaturated grey-blue, soft film grain, shallow depth of field, slow dolly-in, no readable brand names, no faces, 3–5 s each, 16:9.

- **G1 (cracks):** "Three frosted glass tiles floating on a dark navy dot grid, labelled 'Cost', 'Safety', 'Simplicity' in a clean geometric sans-serif. One after another, a hairline crack runs across each tile with a soft glass sound. Macro lens, cold rim light."
- **G2 (card fees):** "Close-up of a generic grey card payment terminal on a shop counter. A paper receipt prints slowly showing '2.9% + fee'. A desk calendar beside it flips three days. A red rubber stamp lands on a paper reading 'CHARGEBACK'. Muted colors, cold light."
- **G3 (seed phrase):** "A paper card with twelve random English words in two columns (use generic words, not a real phrase) lying on a desk. The edges begin to curl and burn into ash. Overhead shot, grey tones, a few embers."
- **G4 (address poisoning):** "Two long hexadecimal wallet addresses stacked on a dark screen, identical except one character in the middle, which glows red after a beat. Slow zoom onto the differing character. Monospace font."
- **G5 (unlimited approval):** "A generic crypto wallet pop-up on a phone screen with a large button 'Approve unlimited'. A thumb hovers over it; the button pulses red. Grey UI, no brand logos."
- **G6 (frozen account):** "A generic finance app screen showing a large padlock icon and the text 'Account restricted'. Frost spreads across the phone glass from the corners. Cold blue-grey."
- **G7 (one human):** "On a dark navy background, twelve identical faceless grey avatar silhouettes in a ring. They flicker and collapse into a single warm glowing human silhouette in the center, outlined in lime #DDF05A. Clean, abstract, no faces."
- **G8 (corridors):** "A dark minimalist world map made of small dots. Glowing lime arcs draw from the UAE to India and from Ukraine to Western Europe, then small pulsing dots appear on Turkey, Nigeria and Argentina. Slow camera drift. No country labels."

---

## 5. Graphics to build (not generated: exact numbers)

**Comparison card** (use in scene 9's lead-in, or as a full-screen frame between scenes 5 and 6 if time allows). Five columns, WondrPay highlighted in a blue column with lime ticks:

| | Cards | Crypto wallets | Custodial apps | Crypto checkouts | **WondrPay** |
|---|---|---|---|---|---|
| Shop fee | 2–3% | n/a | low | ~1% | **0.5%** |
| Money arrives | 2–7 days | seconds | inside the app | seconds | **seconds, own wallet** |
| Who holds it | bank | you | platform | you | **you** |
| Seed phrase / gas | no / n/a | yes / yes | no / no | yes / yes | **no / no** |
| Refunds | chargebacks | manual | in-app | manual | **with proof, on-chain** |
| Bot-proof rewards | no | no | KYC | no | **one human (World ID)** |

**Fee bar** ($100 shop payment, horizontal bars growing left to right): Cards **$2–3** (grey) · WondrPay **$0.50** (blue) split into gas **$0.04**, shopper cashback **$0.23**, WondrPay **$0.23**.

---

## 6. Facts you may show (and what backs them)

| On screen | Source / status |
|---|---|
| 0 gas for the payer | Relayer pays gas; shown in D3 and D4 |
| ~3 s settlement | Measured on Whitechain testnet |
| One exact amount, one recipient, 10 min | USDT `receiveWithAuthorization`; nonce binds recipient + memo |
| 0.5% shop fee | Our pricing model. **Not yet deducted on-chain** (mainnet step 2) |
| $0.04 gas / $0.23 cashback / $0.23 margin per $100 | `economicsPer100()` at 5 gwei, WBT ~$73 |
| One human per account, up to 5 wallets | World ID; the approval in D10 is simulated |
| 5,000 shops, 100,000 people | **Year-one target**, label it so |
| UPI 25.5 billion payments in a month | **Verify** on NPCI's monthly statistics before publishing |

---

## 7. Short prompt (for tools with a character limit)

```
3-minute 16:9 pitch film for WondrPay, "UPI for digital dollars": pay shops and friends in USDT on
Whitechain by QR or name (priya.wondrpay.eth) with a fingerprint or PIN; no gas, no seed phrase, ~3 s.
Use my uploaded demo video and screenshots for every product shot (phones in black frames, dashboards
in laptop frames); never invent app screens. Story: cards, crypto wallets, custodial apps and crypto
checkouts each break on cost, safety or simplicity. Show each problem in grey, then cut to our real app
in color. Then: one real human per account (World ID) stops bot cashback and fake refunds. Then
go-to-market: shops first, WooCommerce plugin and payment links, corridors Gulf→India, Ukraine→EU,
dollar savers; year-one target 5,000 shops, 100,000 people. Close: "Cheaper than cards. Safer than
wallets. Yours, unlike exchanges." Look: navy #0B0D14, blue #2448FF, lime #DDF05A accents, Manrope,
springy motion, minimal electronic music, warm confident voiceover from my script. Label it "live on
Whitechain testnet".
```

---

## 8. Delivery checklist

- [ ] Runs 3:00 ±5 s; voiceover matches section 3 word for word.
- [ ] Every product shot is real footage or a real screenshot (no generated UI).
- [ ] "Simulated" caption kept on the World App approval (D10).
- [ ] "Live on Whitechain testnet" appears at least once; "year-one target" is on the 5,000 / 100,000 frame.
- [ ] No private keys, no real seed phrase, no faces, no third-party logos you don't have rights to.
- [ ] Subtitles burned in; music ducked under voice; a chime on every successful payment.
- [ ] Exports: 1080p MP4 (H.264, under 100 MB for upload), plus a 60-second cut (scenes 1, 3, 6, 9).
