# Protected Pay: Week 1 progress report

**Date:** 10 Nov 2026
**Plan:** [BUILD_PLAN.md](BUILD_PLAN.md)
**Status:** Plan ke Day 1–5 complete, aur Week 2 ke Days 6–10 ka zyada tar kaam bhi ho gaya. Contract testnet pe live hai, aur real deals chal chuki hain.

---

## Ek line mein

**Protected Pay ka smart contract ban gaya hai, test ho gaya hai, aur Whitechain testnet pe live hai.** Humne real USDT se do real deals chalayi. Buyer aur seller dono ne **zero gas** diya, aur har ek paisa sahi jagah pahuncha.

---

## Kya bana (simple bhasha mein)

**Protected Pay** ek "safe locker" hai. Buyer ka paisa seedha seller ko nahi jaata. Woh ek smart contract mein rukta hai, aur rules ke hisaab se aage jaata hai:

| Kya hua | Paisa kahan gaya |
|---|---|
| Buyer ne bola "mil gaya, sab theek" | Seller ko |
| Seller ne time pe deliver nahi kiya | Buyer ko wapas (fee bhi wapas) |
| Buyer chup raha (inspection time khatam) | Seller ko automatically |
| Buyer ne complaint ki, seller ne maan liya | Buyer ko wapas |
| Seller ne partial refund offer kiya, buyer ne accept kiya | Dono mein baant diya |
| Seller ne complaint ka jawab nahi diya | Buyer ko wapas, automatically |
| Seller ne mana kiya (contest) | WondrPay dispute desk (arbiter) decide karega |
| Arbiter ne 7 din mein decide nahi kiya | Buyer ko wapas |

**Sabse important baatein:**
- **WondrPay paisa chhu nahi sakta.** Admin na paisa nikaal sakta hai, na deal badal sakta hai, na refund rok sakta hai.
- **"Pause" sirf nayi deals rokta hai.** Purani deals ke refund aur release kabhi nahi rukte.
- **Deadline nikal gayi toh koi bhi `poke` button daba ke rule enforce kar sakta hai.** Agar WondrPay band bhi ho jaaye, rules phir bhi chalte rahenge.
- **Fee (0.5%) sirf us hisse pe lagti hai jo seller ko milta hai.** Deal fail hui toh buyer ki fee bhi wapas. Fee kabhi 2% se upar nahi ja sakti.
- **USDT kisi address ko block kar de toh bhi deal atakti nahi.** Us bande ka paisa side mein rakha jaata hai aur woh baad mein `withdraw` kar sakta hai.

---

## Plan ke hisaab se kya complete hua

| Plan ka din | Kaam | Status |
|---|---|---|
| Day 1 | Contract ka base: types, storage, admin (2-din ka timelock), `hashOffer`, `fund` | ✅ |
| Day 2 | Paisa baantna (`_settle`), blocked address ka fallback, `withdraw`, release, refund, cancel | ✅ |
| Day 3 | Deliver, dispute, partial offer, accept, contest, escalate, arbiter ka `rule`, `poke` | ✅ |
| Day 4 | Gasless signatures (`actWithSig`), permit se funding, direct funding, events, errors | ✅ |
| Day 5 | Normal flow ke tests | ✅ |
| Days 6–7 | Attack tests (hacker wale cases) | ✅ |
| Day 8 | Fuzz aur invariant tests, coverage | ✅ |
| Day 9 | Real Whitechain USDT pe fork test, Slither, audit notes, gas snapshot | ✅ (Aderyn baaki) |
| Day 10 | Testnet deploy aur verify, ABI sync, shared TypeScript types, hash-match test | ✅ |

---

## Proof: numbers aur links

### Tests

| Test | Result |
|---|---|
| Escrow unit aur attack tests | **69 pass** |
| Fuzz test (random amount, fee aur split, 256 baar) | Pass. Har baar paisa exact match hua. |
| Invariant test (128,000 random actions) | 4 rules kabhi nahi toote |
| Real Whitechain USDT pe fork test | Pass |
| App (TypeScript) aur contract ke hash same hain? | Pass, dono same |
| Poore project ke contract tests | **99/99 pass** (purane `PaymentRouter` aur `Autopay` bhi theek) |
| Code coverage | **99.55% lines, 100% functions** |

**Invariant test ke 4 rules jo kabhi nahi toote:**
1. Contract mein jitna USDT hai, woh exactly utna hai jitna open deals ka banta hai.
2. Jitna paisa aaya, utna hi gaya ya abhi pada hai. Ek paisa bhi gayab nahi hua.
3. Band ho chuki deal dobara kabhi nahi badli.
4. Treasury ko kabhi 2% se zyada nahi mila.

### Attack tests: yeh sab block hue
- Seller ka offer badal ke kam paisa dena
- Buyer ka signature kisi aur deal pe use karna
- Relayer ka paisa kisi aur ko bhejna
- Ek hi deal ko do baar fund karna
- Purana signature dobara bhejna (replay)
- Galat banda action kare: buyer "delivered" daba de, ya stranger ruling de de
- Deadline ke baad complaint karna
- Admin ka fee 2% se zyada karna
- Pause ke time purani deals rok dena
- Arbiter turant badal dena (2 din ka wait zaroori hai)
- Kisi ka purana "unlimited approval" use karke uske paise kheench lena

### Live on Whitechain Sepolia (testnet)

**Contract:** [`0xBbE402F5c137AEc229c801d7F89ba3dD384fB649`](https://explorer.testnet.whitechain.io/address/0xBbE402F5c137AEc229c801d7F89ba3dD384fB649). Explorer pe verified hai.

**Deal A** (0.5 USDT): fund, seller ne delivered mark kiya, buyer ne release kiya. Result: **Released** ✅
- [Fund](https://explorer.testnet.whitechain.io/tx/0xee41fb007b638fedeee29afdebdc81063c37342e115a8a2c2c0b56c14e5f2ac2)
- [Delivered](https://explorer.testnet.whitechain.io/tx/0x02f943bc8206307d8b718a9d1e7048b77241e49f5a44e214dad599ccd3f25d0d)
- [Release](https://explorer.testnet.whitechain.io/tx/0xc323dd443e6a0c64b12ab3fa008ff62e639bc1681e8896d5ea8ad3364e65e3cb)

**Deal B** (0.5 USDT): fund, delivered, buyer ki complaint, seller ka 40% refund offer, buyer ne accept kiya. Result: **Settled** ✅
- [Fund](https://explorer.testnet.whitechain.io/tx/0x6a28eb0f73ffb77dbbde08f735fa164c3c3f6acb1358066fb3a614d3e6275c44)
- [Delivered](https://explorer.testnet.whitechain.io/tx/0xd351e64eadf05e4c0e874560b33c789057c0ca3b3cc791695d59303108dbb53f)
- [Dispute](https://explorer.testnet.whitechain.io/tx/0x16f40fe6b75718a7c48c5338ce61e6e775011634c73754cf793c033103e17ee6)
- [Offer](https://explorer.testnet.whitechain.io/tx/0x5cc72e8e5a9f2e1dea4bbfccb32c40b224ca69279a9a47e86b4cc3e1c2b9c397)
- [Accept](https://explorer.testnet.whitechain.io/tx/0x884992d97344747e61210d9cd4c09187952fa2d60a0214047108bdc6cd1ebb8f)

**Attack:** buyer ka purana signature dobara bheja. Result: **reject** (`AlreadyFunded`) ✅

**Balance check:**
- Buyer: 1.78 → 0.976 USDT, jo expected tha bilkul wahi.
- Seller: 24.89 → 25.69 USDT, expected ke barabar.
- **Gas: buyer ne 0, seller ne 0.** Dono ne sirf sign kiya.

### Gas (Whitechain pe kitna kharcha)

| Action | Gas |
|---|---|
| Fund | ~219k |
| Deliver ya dispute (signature se) | ~53–70k |
| Release ya accept | ~100–123k |

Fund ka gas plan ke target (150k) se zyada hai. Whitechain pe yeh bahut sasta hai, phir bhi audit se pehle kam karne ki koshish karenge.

---

## Kaunsi files bani ya badli

**Naye contracts aur tests**
- `contracts/src/ProtectedEscrow.sol`: main contract
- `contracts/test/ProtectedEscrow.t.sol`: 69 tests
- `contracts/test/ProtectedEscrow.invariant.t.sol`: random-action invariant tests
- `contracts/test/ProtectedEscrow.fork.t.sol`: real Whitechain USDT test
- `contracts/test/ProtectedEscrow.parity.t.sol`: app aur contract ke hash match
- `contracts/test/mocks/BlocklistUSDT3009.sol` aur `Smart1271Wallet.sol`
- `contracts/script/DeployEscrow.s.sol`: deploy script
- `contracts/AUDIT_NOTES.md`: auditor ke liye notes
- `contracts/.gas-snapshot-escrow`

**App ke liye shared code**
- `packages/shared/src/escrow.ts`: types, signature formats, fee aur split ka hisaab, plain-language messages
- `packages/shared/src/abi/ProtectedEscrow.ts`: auto-generated ABI
- `packages/shared/package.json`: naya `@whitepay/shared/escrow` export

**Scripts**
- `scripts/abi-sync.ts`: contract build se ABI copy karta hai
- `scripts/escrow-parity.ts`: TypeScript wale hash print karta hai
- `scripts/protected-demo.ts`: live testnet demo (upar wali deals)

**Record:** `deployments/1874.json` mein contract aur demo ke saare tx

**Kuch bhi commit nahi hua hai abhi.**

---

## Kya baaki hai

**Is hafte ke chhote kaam**
- [ ] Aderyn (doosra security scanner) chalana
- [ ] `fund` ka gas kam karna
- [ ] Whitechain team se poochna: mainnet USDT ka address kya hoga, aur kya woh gasless signature (EIP-3009) support karega?

**Week 3: server aur API**
- [ ] `deals.ts`: deal banana aur padhna, Arkiv pe terms save karna
- [ ] Relayer se fund aur actions bhejna (pehle simulate, phir bhejna, limits ke saath)
- [ ] Deal indexer aur reputation (verified payee card ke liye)
- [ ] `/api/deals/*` routes aur deadline wala cron

**Week 4: app ki screens.** Deal banana, deal page, countdown, dispute thread, verified payee card.

**Week 5: Telegram bot aur arbiter desk.**

**Week 6: audit aur beta.**

**Mainnet se pehle zaroori**
- Teen alag Safe multisig (owner, treasury, arbiter). Abhi testnet pe teeno deployer hi hain.
- External audit
- Purani keys rotate karna, khaas kar `CUSTOMER_PK`
- Legal opinion

---

## Ek important note

Testnet pe owner, treasury aur arbiter teeno ek hi wallet (deployer) hain, sirf testing ke liye. **Mainnet pe yeh teen alag-alag 2-of-3 Safe hone chahiye.** Yeh deploy script aur audit notes dono mein likha hai.
