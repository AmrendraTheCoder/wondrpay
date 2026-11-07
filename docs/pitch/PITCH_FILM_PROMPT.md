# WondrPay pitch film: production prompt (3:00)

One brief to turn everything we already have (the recorded demo, app screenshots, brand images and the Foundations script) into a 3-minute pitch film. It answers the judges' main question: **why is WondrPay better than what exists, and how will it win users?**

**How to use this file:**
1. **All-in-one AI video tool** (Hera, InVideo AI, Runway, Veo, Kling, Sora, Pika, HeyGen, Descript): upload the assets listed in section 2, then paste the **master prompt** (section 1). If the tool limits prompt length, paste the **short prompt** (section 8) instead.
2. **Generated shots**: use the shot prompts in section 6 for the few scenes we have no footage of (the "problem" scenes).
3. **Human editor** (Premiere, Final Cut, CapCut, After Effects, Remotion): sections 2–7 are the full edit list: file paths and timecodes, a micro-animation kit with timings (section 3) and 14 infographic specs with exact data (section 4).

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

MICRO-ANIMATIONS. Layer small, consistent UI animations over the real footage, the same way every
time: a soft tap circle wherever a finger touches; PIN dots that fill with a little overshoot; a
fingerprint whose ridges trace in and turn lime; lime QR corner brackets with a sweep line; four trust
checks that tick in one by one; balances that roll like an odometer; a shimmer across the "0 gas"
pill; toasts that slide in through a blur; names that type in letter by letter with a verified tick;
a scratch card that scratches off with metallic particles. When the footage shows something
important, freeze for 0.4 s, dim the rest to 40% and drop a numbered blue callout pin with a 3-5 word
label. No shot stays still for more than 4 seconds.

INFOGRAPHICS. Between footage, cut to clean animated infographics on the navy dot grid, one idea per
frame, built with exact numbers (never generated): fee bars per $100 (cards $2-3 vs WondrPay $0.50,
split into gas $0.04, cashback $0.23, WondrPay $0.23); a settlement timeline (days vs ~3 seconds); a
payment flow diagram (phone -> signature -> relayer pays gas -> Whitechain -> shop wallet, with an
Arkiv receipt branch and a crossed-out "WondrPay account"); "what you sign" (exact amount, one
recipient, 10 minutes) vs "approve unlimited"; wallet problems flipping into fixes; two money pipes
(custodial with a frozen middle vs wallet-to-wallet); twelve wallets collapsing into one World ID; a
dot-matrix corridor map with drawing arcs; a four-step growth flywheel; count-up target counters; a
road-to-mainnet stepper; and a final comparison matrix. Bars grow left to right, lines draw, numbers
count up, ticks pop in lime.

SOUND. Minimal electronic bed around 100 BPM, soft sub bass, building gently into the go-to-market
section. Glassy UI clicks on taps and a bright two-note chime on each payment. Duck the music under
the voiceover by 12 dB.

VOICE. Warm, confident, global English, about 155 words a minute. Use the voiceover in section 5
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

### New-feature screens (captured from the live app, dark mode, 390×844)
| File | What it shows | Frame | Scene |
|---|---|---|---|
| `wondrpay-4-payment-security.png` | You → Payment security: "Every payment" selected, World ID from $100+ | phone | 3 |
| `wondrpay-5-rewards.png` | Rewards: $0.02 won, "2 new cards to scratch", claim box, card tiles | phone | 6 |
| `wondrpay-6-portal-timeline.png` | Business portal, WooCommerce / Shopify path: 2 of 4 done, ticks, step 3 open | phone | 7 |
| `wondrpay-7-portal-choose.png` | Business portal: "How will customers pay you?" with three choices | phone | 7 |

---

## 3. Micro-animation kit (use everywhere, same timings every time)

Consistency is what makes it feel premium: the same element always moves the same way. Easing for everything unless stated: **spring out** `cubic-bezier(.2,.9,.3,1)`. Sounds are short, quiet and glassy; never stack more than two at once.

| Code | Element | Animation | Timing | Sound |
|---|---|---|---|---|
| **M1** | Tap indicator | A soft white circle (36 px, 30% opacity) appears where the finger lands, scales 0.6→1.2 and fades | 280 ms | tiny click |
| **M2** | Button press | Button scales to 0.96 and back with a light inner glow | 160 ms | none |
| **M3** | PIN entry | Each of the 6 dots fills blue with a 1.25× overshoot, 90 ms apart; on the 6th, all dots pulse once | 6 × 90 ms + 200 ms | soft tick per dot |
| **M4** | Fingerprint | The ridge lines trace in from the center outward, then the glyph turns lime | 600 ms | rising "shimmer" |
| **M5** | QR scan | Lime corner brackets snap in (4 corners staggered 40 ms), a lime sweep line passes top→bottom twice | 900 ms | low "whoosh" |
| **M6** | Trust checks | The four checks ("Created by WondrPay", "Amount untampered", "Signed by the shop", "Still valid") tick in one by one: grey ring → lime fill → white check draws | 4 × 140 ms stagger | tick ×4, rising pitch |
| **M7** | Paid | A lime circle draws clockwise, the check draws inside, two pulse rings expand and fade, the amount counts up | 700 ms | bright two-note chime |
| **M8** | Balance odometer | Each digit rolls vertically like an odometer to the new value, lowest digit last | 500 ms | soft rattle |
| **M9** | "0 gas" pill | A diagonal shimmer passes across the lime pill every few seconds | 900 ms | none |
| **M10** | Toast | Slides down from the top with a 20 px blur that clears, holds, slides back up | 250 in / 1.6 s / 200 out | "pop" |
| **M11** | Name chip | `priya.wondrpay.eth` types in letter by letter, then a verified tick pops beside it | 35 ms per letter + 200 ms | soft keys |
| **M12** | Scratch card | Silver layer scratches away in 3 strokes with tiny metallic particles; the prize scales 0.9→1 | 1.1 s | scratchy then chime |
| **M13** | Identicon | The 5×5 pixel avatar assembles pixel by pixel from the center | 400 ms | none |
| **M14** | Timeline step | The connector line fills downward in lime, then the next dot pops from grey to a lime tick | 350 ms | tick |
| **M15** | Counter | Numbers count up with tabular figures, easing out; units fade in after | 1.2 s | none |
| **M16** | Bar / line chart | Bars grow from the baseline left to right, 60 ms apart; the value label fades in at the top | 700 ms total | none |
| **M17** | Map arc | A lime arc draws between two dots with a bright comet head; the destination dot ripples | 1.0 s | soft "zip" |
| **M18** | Chip state | A chip's border fills grey→lime clockwise, then a tick appears inside | 450 ms | tick |
| **M19** | Problem → fix | The grey problem frame desaturates further, cracks once (thin white line), then shatters into a quick blur that reveals the full-color fix underneath | 500 ms | glass crack |
| **M20** | Callout pin | A numbered blue pin drops onto real footage, a thin leader line draws to a label card | 300 ms | none |

**Callouts on real footage.** Whenever a clip shows something important, freeze for 0.4 s, dim the rest of the frame to 40%, and drop an M20 pin with a 3–5 word label. Then release the freeze. Use these:
- D3: pins on the four trust checks: ① "Who made the order" ② "Amount not changed" ③ "Shop's signature" ④ "Expires in 5 min".
- D4: one pin on the gas payer, "Gas paid by WondrPay", and one on the recipient, "Straight to the shop".
- D8: one pin on the name, "A name, not an address".
- D13: one pin on the 20 / 50 / 100 % buttons, "Shop decides, on-chain".

---

## 4. Animated infographics (exact data, build them; don't generate)

Every infographic uses the same grid: 1920×1080, 120 px margins, Manrope, navy background with the dot grid, one idea per frame. Grey `#5A6178` is "today's way", blue `#2448FF` is WondrPay, lime `#DDF05A` highlights the key number. Each holds at least 2 s after it finishes animating.

**I1 · The three breaks** (scene 1). Three columns, an icon on top of each: a coin (Cost), a shield (Safety), a hand tapping (Simplicity). Under each, the offenders fade in as small grey labels: Cost: "Cards", Safety: "Wallets · Custodial apps", Simplicity: "Crypto checkouts". All three icons crack (M19), then re-form in blue with lime ticks (M18) as the WondrPay logo lands in the middle.

**I2 · What $100 costs a shop** (scene 2). Horizontal bars, M16:
| Bar | Value | Color |
|---|---|---|
| Card payment | $2.00–$3.00 (draw to $3.00, label "$2–3") | grey |
| WondrPay | $0.50 | blue |
Then the WondrPay bar zooms in and splits into three segments, each labelled with M15: **gas $0.04** · **your cashback $0.23** · **WondrPay $0.23**. Caption: "per $100 at a shop".

**I3 · When the shop gets paid** (scene 2). A horizontal timeline from "Sale" to "7 days". A grey dot slides slowly across to a 2–7 day bracket labelled "Cards". A lime dot pings at the very start with the label "WondrPay · ~3 seconds" and an M7 check. Caption: "Money in the shop's own wallet".

**I4 · Anatomy of one payment** (scene 3 or 4). A left-to-right flow diagram that builds node by node (M14 connectors):
`Your phone (fingerprint / PIN)` → `signs: 2.50 USDT · to Priya · 10 min` → `WondrPay relayer (pays the gas)` → `Whitechain` → `Priya's wallet`.
A dashed branch below Whitechain goes to `Arkiv receipt (no one can edit)`. A grey "WondrPay's bank account" box appears above the flow, then gets crossed out with a red line: "We never hold it".

**I5 · What you actually sign** (scene 3). Split screen. Left, grey, a generic "Approve unlimited" pop-up with a red infinity sign and the label "Can be drained later". Right, blue, a WondrPay signature card with three lines that tick in (M6): **Amount: 2.50 USDT exactly** · **To: priya.wondrpay.eth only** · **Valid: 10 minutes**. Bottom caption: "Even our relayer can't change it".

**I6 · Wallet problems → fixes** (scene 3, end). A 4-row checklist. Each row starts as a grey problem and flips (card-flip, 300 ms, 120 ms stagger) to a blue fix:
| Problem | Fix |
|---|---|
| 12-word seed phrase | Fingerprint or PIN |
| Buy gas first | 0 gas: we pay it |
| 42-character address | `name.wondrpay.eth` + verified badge |
| Unlimited approvals | One exact amount, one recipient |

**I7 · Where the money sits** (scene 4). Two horizontal pipes. Top, grey: `You → Platform's account → Shop`, and the middle box frosts over with a padlock: "Frozen", "Withdrawals paused". Bottom, blue: `Your wallet → Shop's wallet`, a lime pulse travels straight through in ~0.5 s.

**I8 · What a checkout gives you** (scene 5). A 3-column tick table built column by column (M18):
| | Typical crypto checkout | WondrPay |
|---|---|---|
| Customer pays gas | yes | **no** |
| Refunds | manual | **built in, on-chain** |
| Subscriptions | no | **yes, cancel any time** |
| WooCommerce / Shopify / links | partly | **yes** |

**I9 · One human, not a hundred wallets** (scene 6). Twelve grey wallet icons in a ring. They pull inward into one World ID orb (lime outline). Out of the orb come three facts as chips (M18): **5 claims a day** · **$5 a month** · **across all your wallets**. Second beat: a bar "Reward budget" fills from **50% of (fee − gas)** with the caption "Paid from fees we've earned. Never from printed tokens."

**I10 · The money corridors** (scene 7). Dot-matrix world map (G8 style, but built so the numbers are exact). Arcs draw with M17, labels count up with M15:
- **UAE → India**: "The Gulf sends 38% of India's remittances" **[verify: RBI, FY24]**
- **Ukraine → EU**: "Freelancers paid in USDT"
- Pulsing dots on **Turkey · Nigeria · Argentina**: "People saving in dollars"
Header counter: **$685B** sent home to developing countries a year, **~6%** average cost **[verify: World Bank]**.

**I11 · The flywheel** (scene 7). A circle of four nodes with arrows rotating clockwise, each lighting up in turn: **Shops join free** (plugin, link) → **Shoppers pay, 0 gas** → **Cashback from the fee** → **More shoppers ask shops for WondrPay** → back to the start. The middle shows "WhiteBIT: dollars in, rupees and hryvnias out".

**I12 · Year-one target** (scene 7, end). Two big counters side by side (M15): **5,000 shops** · **100,000 verified people**. A small grey label stays visible the whole time: "Year-one target". Optional third line: "Year 3: 50,000 shops · 1,000,000 people" (also a target).

**I13 · Road to mainnet** (scene 8). A horizontal stepper with three chips. Behind them, a faint "Built and live on testnet" row of small icons ticks fully lime first: pay · names · refunds · subscriptions · rewards · business portal. Then the three mainnet chips light one by one (M18): **Audit 3 contracts** → **Fee split on-chain** → **Key recovery**.

**I14 · The comparison** (scene 9 lead-in, 4 s). The matrix builds row by row, with the WondrPay column last and highlighted:
| | Cards | Crypto wallets | Custodial apps | Crypto checkouts | **WondrPay** |
|---|---|---|---|---|---|
| Shop fee | 2–3% | n/a | low | ~1% | **0.5%** |
| Money arrives | 2–7 days | seconds | inside the app | seconds | **seconds, own wallet** |
| Who holds it | bank | you | platform | you | **you** |
| Seed phrase / gas | no / n/a | yes / yes | no / no | yes / yes | **no / no** |
| Refunds | chargebacks | manual | in-app | manual | **with proof, on-chain** |
| Bot-proof rewards | no | no | KYC | no | **one human (World ID)** |

---

## 5. Storyboard and voiceover (3:00)

The voiceover is the Foundations script (`docs/pitch/foundations.md`), about 460 words. Codes: **D** = demo clip, **G** = generated shot, **I** = infographic, **M** = micro-animation. On-screen text is kept to the bold words.

| # | Time | Picture (in order) | On-screen text | Voiceover |
|---|---|---|---|---|
| 1 | 0:00–0:15 | G1 cracks (3 s) → **I1** the three breaks (6 s) → logo from `wondrpay-cover.png` lands with a soft bloom → `wondrpay-1-home.png` rises in a phone; balance odometer (M8), "0 gas" shimmer (M9). | **Cost. Safety. Simplicity.** → **WondrPay** | "Everyone asks us the same thing: why WondrPay, when cards, crypto wallets and Binance Pay already exist? Here's the honest answer. Each of them breaks in one of three places: cost, safety or simplicity. We fixed all three at once." |
| 2 | 0:15–0:35 | G2 card terminal (3 s) → M19 shatter → **I2** fee bars and the $0.50 split (5 s) → D2 → D3 with QR scan (M5), trust-check callouts (M6 + M20), PIN (M3), Paid (M7) → **I3** settlement timeline (3 s). | **2–3% · days · chargebacks** → **0.5% · seconds · proof** | "Cards and Stripe. A shop pays 2 to 3 percent, waits days for its money, and loses to chargeback fraud. With WondrPay it pays half a percent, the money lands in its own wallet in seconds, and a refund needs proof from a verified human, stored on Arkiv where no one can edit it." |
| 3 | 0:35–1:05 | G3 seed phrase burns → G4 lookalike address (red character) → G5 "Approve unlimited" → M19 shatter → `wondrpay-1-home.png` with fingerprint (M4) → D8 paying `priya.wondrpay.eth` (M11 name chip, callout "A name, not an address") → **I5** what you sign (4 s) → **I6** problems flip to fixes (4 s) → `wondrpay-4-payment-security.png` with a tap (M1) on "Every payment". | **Seed phrase · gas · lookalikes · approvals** → **Fingerprint · 0 gas · names · one exact amount** | "Crypto wallets like MetaMask. A seed phrase you'll lose. Gas you have to buy first. Forty-two-character addresses that scammers copy with lookalikes: that's address poisoning. And 'approve' buttons that can drain a wallet years later. WondrPay has no seed phrase: the key is locked by your fingerprint, on your phone. No gas: we pay it. You pay names, like priya.wondrpay.eth, and shops carry a verified badge. And there are no approvals at all. You sign one exact amount, to one recipient, valid for ten minutes. Even our own relayer can't change where it goes." |
| 4 | 1:05–1:15 | G6 frozen account (2 s) → **I7** two pipes (4 s) → **I4** anatomy of a payment, fast build (3 s) → D4 explorer with callouts "Gas paid by WondrPay" / "Straight to the shop". | **Not your money** → **Wallet → shop. Nothing in between.** | "Custodial apps like Binance Pay. Easy, but the money isn't yours. Accounts get frozen, and platforms can fail. WondrPay never holds your money. It goes straight from your wallet to the shop's." |
| 5 | 1:15–1:25 | **I8** checkout table (3 s) → montage, ~1.5 s each, with M2 taps: D5 Autopay toggles on → D11 refund form, PIN (M3) → D13 with callout "Shop decides, on-chain" → D14 +1.65 lands: toast (M10) + odometer (M8). | **Refunds · subscriptions · no gas** | "Crypto checkouts like Coinbase Commerce stop at 'paid'. Refunds are manual, there are no subscriptions, and the customer still needs gas. We ship all three." |
| 6 | 1:25–1:50 | D10 World ID sheet ("simulated" caption kept) → **I9** wallets collapse into one World ID orb, limit chips, reward budget bar (7 s) → D9 scratch card (M12) → `wondrpay-5-rewards.png`, card tiles stagger in. | **One real human per account** | "What's new isn't one feature. It's the combination: UPI's two-tap experience, on digital dollars, with one real human behind every account, through World ID. That one rule makes everything else safe. Cashback can't be farmed by bots. Refunds can't be abused by fake accounts. And every reward is paid from fees we've already earned, never from a token we printed." |
| 7 | 1:50–2:40 | `wondrpay-7-portal-choose.png` with a tap (M1) on "WooCommerce / Shopify" → `wondrpay-6-portal-timeline.png` with M14 ticks down the steps → D1 Amaron integration → `dashboard-v2-drawer.png` in a laptop, drawer slides in → **I10** corridor map with arcs and counters (8 s) → **I11** flywheel, one full turn (6 s) → **I12** year-one counters (4 s). | **Shops first** → **Plugin · Shopify · link** → **Gulf → India · Ukraine → EU · dollar savers** → **5,000 shops · 100,000 people · year-one target** | "We go shops first, because shops bring shoppers. A shop joins in minutes with our WooCommerce plugin, a Shopify guide, or just a payment link. No code, no setup fee. We start where people already hold dollars and W Group already has users: Gulf workers paying family in India, Ukrainian freelancers paid in USDT, and savers in Turkey, Nigeria and Argentina. Shoppers come for zero gas and cashback, and stay because it's faster than their bank. Ten free transfers a month to friends pulls in the next user. WhiteBIT is the way in and out: dollars in, rupees and hryvnias out. Year one: 5,000 shops and 100,000 verified people." |
| 8 | 2:40–2:52 | **I13** road to mainnet: the "live on testnet" row ticks lime, then the three mainnet chips light (M18). | **Audit · On-chain fee · Key recovery** | "For mainnet we have three steps: an audit of our three contracts, the fee split on-chain, and key recovery, so a lost phone isn't lost money. Everything else runs today on Whitechain testnet." |
| 9 | 2:52–3:00 | **I14** comparison matrix flashes complete (2 s) → three lines stack, one per beat, each underlined in lime → end card `wondrpay-cover.png` (hold 4 s, "0 gas" pill shimmers once). | **Cheaper than cards. Safer than wallets. Yours, unlike exchanges.** | "Cheaper than cards. Safer than wallets. Yours, unlike exchanges. That's WondrPay. Thank you." |

**Pacing rule:** no shot longer than 4 s without movement. If a clip runs long, push in slowly or add a callout. If a scene runs over, cut the generated shot first, never the infographic or the real footage. Demo clips may be sped up to 1.5× (UI footage still reads fine) and trimmed to their key moment; the infographic and callout timings stay fixed.

---

## 6. Generated shot prompts (problem scenes only)

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

## 7. Facts you may show (and what backs them)

| On screen | Source / status |
|---|---|
| 0 gas for the payer | Relayer pays gas; shown in D3 and D4 |
| ~3 s settlement | Measured on Whitechain testnet |
| One exact amount, one recipient, 10 min | USDT `receiveWithAuthorization`; nonce binds recipient + memo |
| 0.5% shop fee | Our pricing model. **Not yet deducted on-chain** (mainnet step 2) |
| $0.04 gas / $0.23 cashback / $0.23 margin per $100 | `economicsPer100()` at 5 gwei, WBT ~$73 |
| One human per account, up to 5 wallets | World ID; the approval in D10 is simulated |
| 5,000 shops, 100,000 people | **Year-one target**, label it so |
| 5 reward claims a day, $5 a month per person | `ECON.humanClaimsPerDay`, `ECON.humanMonthlyCapMicro` |
| Reward budget = 50% of (fee − gas) | `rewardBudgetMicro()` in `packages/shared/src/rewards.ts` |
| $685B sent home a year, ~6% average cost | **Verify**: World Bank (2024 figure, cost a little over 6%) |
| Gulf sends 38% of India's remittances | **Verify**: RBI remittances survey, March 2025 bulletin (FY24) |
| UPI 25.5 billion payments in a month | **Verify** on NPCI's monthly statistics before publishing |

---

## 8. Short prompt (for tools with a character limit)

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
springy motion, minimal electronic music, warm confident voiceover from my script. Add micro-animations
on the real footage (tap circles, PIN dots, fingerprint trace, QR sweep, trust checks ticking, balance
odometer, callout pins) and animated infographics between scenes (fee bars per $100, days vs seconds,
payment flow diagram, wallets collapsing into one World ID, corridor map, growth flywheel, comparison
matrix). Label it "live on Whitechain testnet".
```

---

## 9. Delivery checklist

- [ ] Runs 3:00 ±5 s; voiceover matches section 5 word for word.
- [ ] Every product shot is real footage or a real screenshot (no generated UI).
- [ ] "Simulated" caption kept on the World App approval (D10).
- [ ] "Live on Whitechain testnet" appears at least once; "year-one target" is on the 5,000 / 100,000 frame.
- [ ] No private keys, no real seed phrase, no faces, no third-party logos you don't have rights to.
- [ ] Subtitles burned in; music ducked under voice; a chime on every successful payment.
- [ ] Exports: 1080p MP4 (H.264, under 100 MB for upload), plus a 60-second cut (scenes 1, 3, 6, 9).
