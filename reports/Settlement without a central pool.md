# Settlement without a central pool

**Question:** In UPI, my bank and the receiver's bank talk to each other and settle. Can WondrPay move money between people, apps and chains **without the money ever passing through WondrPay** (no central pool)? Has anyone researched this?

**Short answer:** Yes. It is one of the most researched problems in crypto, and for most of what WondrPay does it is already solved. On a single chain, nothing is needed: the chain itself does the settlement. Across chains there are four proven designs, and none of them needs WondrPay to hold funds. WondrPay's job is the same as NPCI's: route the message and enforce the rules. Moving the money is the job of the "banks" (wallets) and the "RBI" (the chain or the stablecoin issuer).

---

## 1. First, a correction about UPI itself

NPCI never holds anyone's money either.

1. Your bank debits your account and sends a message through NPCI's switch.
2. The receiver's bank credits the receiver right away, trusting NPCI's rules.
3. Later in the day, banks settle the **net** amounts between themselves in their accounts at the **RBI**. NPCI only computes who owes whom.

So UPI has three roles:

| Role | UPI | Crypto equivalent |
|---|---|---|
| Holds the money | Banks | The user's own wallet (self-custody) |
| Final settlement | RBI accounts | The blockchain, or the stablecoin issuer (Circle, Tether) |
| Message routing and rules | NPCI | **WondrPay (the rule layer)** |

In crypto the "bank" and the "RBI" merge: a USDT balance on Whitechain *is* the final settlement. That is why WondrPay doesn't need a pool.

## 2. Same chain: already pool-free (what WondrPay does today)

When a user pays with WondrPay:

- The user's wallet signs an EIP-3009 `transferWithAuthorization`, which is a signed cheque saying "move X USDT from me to Y".
- Our relayer only **submits** that cheque and pays the gas. It cannot change the amount or the recipient, and the USDT goes straight from the payer's address to the receiver's address.
- At no point is the money in a WondrPay account.

This is the structure regulators call **non-custodial**. US FinCEN's 2019 guidance treats a party that "accepts and transmits" value as a money transmitter. A provider that never takes control of the funds, such as software or a relayer of user-signed transactions, generally is not. (Local legal advice is still needed before launch.)

## 3. Across chains: four ways to do it without a pool

The hard case is "I have USDT on Tron, the shop wants USDC on Base". Here are the designs, from most to least trustless.

### A. Atomic swaps (hash time-locked contracts)

**How:** Two parties lock funds on two chains with the same secret hash. When one reveals the secret to claim, the other can claim too. Either both payments happen or neither does, with no middleman.

**Limit:** You need a counterparty who has the money on the other chain, and both sides must stay online.

**Research:**
- Maurice Herlihy, *Atomic Cross-Chain Swaps*, ACM PODC 2018. https://arxiv.org/abs/1801.09515
- Herlihy, Liskov, Shrira, *Cross-chain Deals and Adversarial Commerce*, VLDB 2019. https://arxiv.org/abs/1905.09743

### B. Payment channels and multi-hop payments (Lightning and Interledger)

**How:** A payment hops through several connectors, each forwarding it on its own ledger. Hash-locks make it all-or-nothing, so nobody in the middle can steal it. This is the closest crypto version of "my bank talks to your bank".

**Interledger** was designed by Ripple engineers for exactly this: payments across different ledgers (banks, chains) through connectors, with no central party holding funds.

**Research:**
- Stefan Thomas, Evan Schwartz, *A Protocol for Interledger Payments*, 2015. https://interledger.org/interledger.pdf
- Joseph Poon, Thaddeus Dryja, *The Bitcoin Lightning Network*, 2016. https://lightning.network/lightning-network-paper.pdf
- Malavolta et al., *Anonymous Multi-Hop Locks for Blockchain Scalability and Interoperability*, NDSS 2019. https://eprint.iacr.org/2018/472
- Miller et al., *Sprites and State Channels*, 2017. https://arxiv.org/abs/1702.05812

### C. Burn-and-mint by the issuer (Circle CCTP, Tether USDT0)

**How:** The USDC is burned on chain A, and Circle's attestation lets the same amount be minted on chain B. No pool and no bridge vault exist. The issuer plays the role of the RBI.

**Limit:** It only works for that issuer's own token on chains the issuer supports.

**Reference:** Circle, *Cross-Chain Transfer Protocol docs*. https://developers.circle.com/cctp

### D. Intents and solvers (ERC-7683, Across, UniswapX)

**How:** The user signs "I want 10 USDC to arrive on Base and I'll pay 10.01 USDT on Tron". A solver, a competing market maker, pays the receiver **from its own money** within seconds. A settlement contract then releases the user's locked funds to that solver. The money in the middle is the solver's, and the solver takes the risk, not WondrPay.

This is the practical answer for WondrPay: we route the intent and enforce the rules, and solvers provide the liquidity.

**Reference:** ERC-7683, *Cross Chain Intents*. https://eips.ethereum.org/EIPS/eip-7683

### What to avoid: lock-and-mint bridge pools

A bridge that keeps a big vault of tokens on one chain is exactly the "central pool". It is the most hacked part of crypto (Ronin, Wormhole, Nomad). Academic surveys treat these vaults as the main weak point.

**Research:**
- Zamyatin et al., *SoK: Communication Across Distributed Ledgers*, Financial Cryptography 2021. https://eprint.iacr.org/2019/1128
- Zamyatin et al., *XCLAIM: Trustless, Interoperable, Cryptocurrency-Backed Assets*, IEEE S&P 2019. https://eprint.iacr.org/2018/643
- Belchior et al., *A Survey on Blockchain Interoperability: Past, Present, and Future Trends*, ACM Computing Surveys 2021. https://arxiv.org/abs/2005.14282
- Augusto et al., *SoK: Security and Privacy of Blockchain Interoperability*, IEEE S&P 2024. https://arxiv.org/abs/2302.09443

## 4. Central-bank research on the same idea

Central banks are working on "connect the systems, don't pool the money" too. These are useful for the pitch because they make the same argument:

- **BIS Project Nexus:** links domestic instant-payment systems (UPI-style) through one shared rulebook and gateway instead of bilateral links. India's RBI joined the Nexus Global Payments organisation with Malaysia, the Philippines, Singapore and Thailand. **This is the closest real-world model for WondrPay: a rule layer that connects payment systems without holding money.** https://www.bis.org/about/bisih/topics/fmis/nexus.htm
- **BIS Project Agorá:** tokenised bank deposits and central-bank money on one shared ledger, so settlement is atomic. https://www.bis.org/about/bisih/topics/fmis/agora.htm
- **Project mBridge:** a multi-central-bank cross-border ledger (the BIS stepped back from it in 2024). https://www.bis.org/about/bisih/topics/cbdc/mcbdc_bridge.htm

## 5. What this means for WondrPay

1. **Keep the rule we already follow:** WondrPay never holds user money. Users sign, the chain settles, and the relayer only submits.
2. **Same chain:** done today with EIP-3009 and the gasless relayer.
3. **Cross-chain, USDC:** use CCTP (burn-and-mint), so no pool.
4. **Cross-chain, any token:** accept ERC-7683 intents and let solvers fill them, so the liquidity is theirs.
5. **Refunds without a pool:** the merchant's own escrow contract holds the payment until the refund window closes, rather than a WondrPay account.
6. **Pitch line:** *"WondrPay is to stablecoins what NPCI is to UPI: we route and enforce the rules, and we never touch the money. Settlement happens on-chain or through the issuer, the way banks settle at the RBI."* That pitch has central-bank research behind it (BIS Nexus).

**Caveats:**
- Links and paper titles are from known publications; confirm any you quote in a deck.
- Regulatory status depends on the country, so get local advice before launch.
