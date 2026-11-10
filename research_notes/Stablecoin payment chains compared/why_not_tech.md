# Why no wallet offers "one address / one QR, any chain in, any chain out": technical and standards barriers, and what it would cost (as of Nov 2026)

Research date: 2026-11-09. Where a source is a secondary or vendor page, it says so. "LIVE" means verified in production; "PLANNED" means roadmap or draft only; "UNVERIFIED" means I found no primary confirmation.

## 1. Address and identity fragmentation (formats, same-address-different-meaning, wrong-chain sends, CAIP/ERC-7930/7828/ENSIP/EIP-681/BIP-353)

### Takeaway
No address format in production carries "which chain" in a way that every wallet checks. The standards that would fix this for EVM, ERC-7930 (binary chain+address) and ERC-7828 (`name@chain`), were still in **Review, not Final** as of Nov 2026. Non-EVM chains (Tron, Bitcoin) have their own separate naming schemes. As a result, a single QR code cannot safely mean "pay me on any chain" today.

### Cited Findings
- ERC-7930 (Interoperable Addresses) has status **Review**. It was created 2025-02-02 and has about 21 co-authors, including Vitalik Buterin and Nick Johnson. It defines a versioned binary envelope: Version, ChainType (CAIP-350 namespace), ChainReference, Address. — [EIP-7930](https://eips.ethereum.org/EIPS/eip-7930)
- ERC-7930's motivation: Ethereum's ERC-55 address format is reused by many chains, yet "doesn't say which chain an address is meant for." Protocols have built their own ad hoc schemes in response, and that fragments tooling. — [EIP-7930](https://eips.ethereum.org/EIPS/eip-7930)
- ERC-7930 says CAIP-10 (a text format pairing an address with a CAIP-2 chain id) does not define address serialization and is inefficient onchain. CAIP-2 limits chain references to 32 characters, so it cannot losslessly represent some chains, such as Solana. ERC-7930 uses Solana as a worked non-EVM example. Bitcoin is not mentioned. — [EIP-7930](https://eips.ethereum.org/EIPS/eip-7930)
- ERC-7828 (Interoperable Names) has status **Review** and was created 2024-11-27. Its format is `<address>@<chain>#<checksum>`, for example `alice.eth@ethereum` or `0xFe89…@eip155:1#80B12379`. Chain labels resolve through an ENS `on.eth` registry (for example, `ethereum.on.eth` resolves to `0x00010000010100`, using ENSIP-24). — [EIP-7828](https://eips.ethereum.org/EIPS/eip-7828)
- ERC-7828's stated motivation is that address ambiguity "can result in funds being sent to an unreachable address on the wrong chain." Its security notes cover homoglyphs, address poisoning, and the fact that resolvers can change, so a previously generated checksum may stop validating for ENS names. — [EIP-7828](https://eips.ethereum.org/EIPS/eip-7828)
- Ethereum Magicians threads and L2 Interop Working Group notes describe the specs as "very close." Open questions remained on checksums and versioning between the two standards. Those notes are undated. — [ERC-7930 thread](https://ethereum-magicians.org/t/erc-7930-interoperable-addresses/23365/22); [ERC-7828 thread](https://ethereum-magicians.org/t/erc-7828-chain-specific-addresses-using-ens/21930/18); [Interop WG call notes](https://notes.ethereum.org/@rudolf/interop-17)
- Unruggable's Q2 2026 report says the team was still "advancing" ERC-7930 and ERC-7828 and does not say either was finalized. — [ENS forum, Unruggable Q2 2026](https://discuss.ens.domains/t/unruggable-quarterly-report-q2-2026/22322)
- ENSIP-19 (multichain primary names / reverse resolution for all EVM coin types) is marked **Final**. An ENS ecosystem meeting note says L2 primary names are live at the protocol level, and Base says Basenames support ENSIP-19. However, ENS's own reverse-resolution doc page still says primary names are "only supported on Ethereum Mainnet", so the docs conflict on rollout. — [ENSIP-19](https://docs.ens.domains/ensip/19); [ENS L2 primary names blog](https://ens.domains/blog/post/l2-primary-names); [Base: Basenames ENSIP-19](https://blog.base.dev/basenames-ensip-19); [ENS docs: reverse](https://docs.ens.domains/web/reverse)
- ENSIP-11 (per-coin-type address records): ENS can store a different address per chain (coinType), but resolution depends on each wallet querying the right coinType. It is a lookup, not a routing guarantee. — [ENSIP-11](https://docs.ens.domains/ensip/11) (spec URL; content summarized from my prior knowledge of the spec, not re-fetched this session)
- **Counterfactual and contract-wallet risk, real incident (June 2022):** The Optimism Foundation sent 20M OP to the address of Wintermute's Gnosis Safe. That Safe existed on Ethereum mainnet but was not deployed on Optimism. Because the mainnet Safe was created with the older `CREATE`-based ProxyFactory, an attacker replayed deployments on Optimism, took control of the address, and seized the tokens. — [Rekt: Wintermute](https://rekt.news/wintermute-rekt); [The Block](https://www.theblock.co/post/150966/attacker-snipes-20-million-op-tokens-intended-for-wintermute-loan); [Safe's analysis](https://gnosis-safe.notion.site/The-Loss-of-20M-OP-An-Analysis-36aca234f4254940b3dd995a0f04b765)
- BIP-353 (Bitcoin DNS payment instructions) stores payment instructions in a DNSSEC-signed TXT record (`₿user@domain`). Wallet adoption is early. Named implementations include Phoenix v2.3.3+, Zeus, Cake Wallet, Sparrow, Core Lightning, and the LDK and Breez SDKs, per a vendor comparison page. Bitcoin Core support is only a proof-of-concept PR (#33069, July 2025). — [BIP-353](https://bips.dev/353); [Phoenix release](https://nobsbitcoin.com/phoenix-wallet-v2-3-3-and-server-v0-3-0); [Spark comparison (vendor)](https://www.spark.money/tools/bitcoin-naming-service-comparison); [Bitcoin Core PR #33069 mirror](https://mirror.b10c.me/bitcoin-bitcoin/33069/)
- EIP-681 (`ethereum:` payment URIs) can carry `@chain_id` and an ERC-20 `transfer` call. It binds a request to **one** chain and **one** token contract, so it cannot express "any of these chains/tokens." It is also EVM-only. — [EIP-681](https://eips.ethereum.org/EIPS/eip-681) (spec URL; content from my knowledge of the spec, not re-fetched this session)

### Inferences
- Address formats are incompatible at the byte level: EVM uses 20-byte hex, Solana uses 32-byte base58 ed25519, Tron uses base58check with a `T` prefix, and Bitcoin uses bech32. A single QR code would therefore have to encode either (a) a name that resolves per chain (ENS/ENSIP-11, BIP-353), or (b) a deposit-address set or a payment-request object. Option (a) needs every payer wallet to implement resolution. Option (b) has no cross-ecosystem standard.
- The same EVM address can be controlled by different parties on different chains when it is a smart account or multisig that is not yet deployed there. This is why "send to my address on any chain" is unsafe for contract wallets unless the factory, salt, and initcode are guaranteed identical on every chain (CREATE2 plus a deterministic factory) and deployment happens first.
- Adoption is slow because these standards are still in draft or Review (7930/7828), and ENS-based naming is EVM-centric. Bitcoin (BIP-353) and Solana (SNS) each run separate naming systems. A wallet would also have to ship resolver logic for every scheme, and a payer-side wallet only benefits once recipients publish records. That is a two-sided chicken-and-egg problem.

### Gaps
- I could not confirm whether ERC-7930 or ERC-7828 reached Last Call or Final after the page fetch. Both showed "Review" on eips.ethereum.org when fetched on 2026-11-09.
- No adoption metrics, such as the number of wallets that parse ERC-7828 strings, were found.
- Tron and Solana-native chain-qualified address standards (for example, SNS multichain records) were not researched in depth.
- I did not fetch CAIP-2 and CAIP-10 directly. Their limitations are cited through ERC-7930's description of them.

## 2. Token fragmentation (native vs bridged USDC/USDT, USDT0 vs legacy Tron USDT, decimals, issuer chain choices)

### Takeaway
"USDC" or "USDT" is not one asset. It is a set of per-chain contracts, some native and some bridged or wrapped, each with different redemption and trust properties. Tron, the largest USDT rail, cannot host USDT0's native OFT model and connects only through a liquidity-based "Legacy Mesh." CCTP covers USDC only, on Circle-chosen chains.

### Cited Findings
- USDT0 is Tether's OFT (LayerZero) based multichain USDT. Per a vendor summary, Tron does not support native OFT issuance. Tron USDT therefore connects through a separate "Legacy Mesh" component, with Arbitrum as the hub linking legacy USDT on Ethereum, Tron, TON, Solana, and Celo. — [eco.com (vendor support article)](https://eco.com/support/en/articles/15291261-best-cross-chain-usdt-bridge-2026-multi-network-steps); [Tether Legacy Mesh announcement (mirror.xyz, 403 on fetch)](https://mirror.xyz/tetherzero.eth/NUSP9nxicfUulDFjEyXRC3LHUtL2c23fxRdE_3M79Es); [CryptoSlate](https://cryptoslate.com/?p=465052)
- Sources disagree on USDT0 chain count: one says "50+ chains" in 2026, another about 15 by Q2 2026. **UNVERIFIED.** — [datawallet](https://www.datawallet.com/crypto/usdt-vs-usdt0); [eco.com](https://eco.com/support/en/articles/15291264-best-usdt-bridge-by-chain-2026)
- CCTP (Circle) burns and mints native USDC across Circle-supported domains. Its supported-chains list is set by Circle. Tron is not among the CCTP Fast Transfer or Standard Transfer source chains listed in Circle's docs. — [Circle CCTP required block confirmations](https://developers.circle.com/cctp/required-block-confirmations)
- Sources conflict on the CCTP V1 deprecation timeline (phase-out starting July 31 vs August 2026). — [Circle CCTP V2 blog](https://www.circle.com/pt-br/blog/cctp-v2-the-future-of-cross-chain); [Across CCTP V2 blog](https://across.to/blog/cctpv2)

### Inferences
- Settling "any chain to any chain" therefore means converting between distinct assets, for example Tron USDT to Base USDC. That is a swap plus a bridge, not a transfer. It introduces price and depeg risk, liquidity limits, and different trust assumptions per pair (Tether mint/burn, LayerZero DVNs, Circle attesters, pool liquidity).
- Decimals differ between deployments of the "same" stablecoin. USDC and USDT are 6 decimals on most chains but 18 on BNB Chain (Binance-Peg). Integrators must normalize per contract. *(General knowledge, not sourced this session; verify against the token contracts.)*

### Gaps
- No primary Tether or USDT0 doc was successfully fetched (the mirror.xyz post returned 403). USDT0 chain list, Legacy Mesh fees, and liquidity caps remain unverified.
- No authoritative per-chain decimals table was fetched.
- Bridged-USDC (USDC.e) to native migration status per chain was not researched.

## 3. Settlement mechanics (finality, reorgs, trust models of CCTP / LayerZero / CCIP / intents, latency, failures, refunds)

### Takeaway
Cross-chain settlement time is set by the slowest link: source-chain finality. For Ethereum and its rollups, hard finality takes about 15–30 minutes, and Linea takes hours. "Fast" products (CCTP Fast Transfer, intent solvers) work by having someone take reorg risk against capped allowances or their own capital. That creates trust assumptions and failure paths a payments product must handle.

### Cited Findings
- **CCTP Fast Transfer** attests after soft confirmations: Ethereum 2 blocks (~20 s); Arbitrum, Base, OP Mainnet, Unichain, World Chain, Linea, Ink and others 1 block (~8 s); Solana 2–3 blocks (~0.5 s); Starknet ~20 s. Fast Transfers are "subject to a global allowance to mitigate reorganization risks." — [Circle docs](https://developers.circle.com/cctp/required-block-confirmations)
- **CCTP Standard Transfer** waits for hard finality: Ethereum and OP-stack/Arbitrum L2s about 65 ETH blocks (~15–19 min); Ink ~30 min; Starknet ~2–4 h; **Linea ~6–32 h**; Solana 32 blocks (~17 s); Polygon PoS ~8 s; BNB ~2 s; Avalanche ~8 s. — [Circle docs](https://developers.circle.com/cctp/required-block-confirmations)
- The Ethereum Foundation's Fast L1 Confirmation Rule (FCR) uses accumulated attester votes to give an earlier, lower-confidence signal, while full finality still arrives later. It was targeted for "Q1 2026 in all consensus clients." Later secondary reports say mid-2026, so **live status is UNVERIFIED.** — [EF Protocol Update 003 (Aug 2025)](https://blog.ethereum.org/2025/08/29/protocol-update-003); [Bitget news (secondary)](https://www.bitget.com/news/detail/12560605123001)
- The Across Solana incident (July 17, 2026) shows the trust surface of an intents/relayer design. An attacker exploited a flaw in Risk Labs' **off-chain Solana event reader** and forged deposit events that never existed onchain (reports: 1,627 fake deposits / ~$41.7M forged). The relayer advanced about $4.5M before pausing, and the net loss was under $4M, borne by relayer capital. Across said contracts were not compromised, genuine transfers were completed or refunded the same day, and a patch shipped in about 5 hours. — [Cryptonomist](https://en.cryptonomist.ch/2026/07/24/across-solana-relayer-attack/); [Startup Fortune](https://startupfortune.com/across-protocol-got-hacked-on-solana-and-no-user-lost-a-cent/); [KuCoin flash (postmortem summary)](https://www.kucoin.com/news/flash/across-protocol-relayer-attack-results-in-under-4m-net-loss)

### Inferences
- A payments app promising "receive on any chain" has two choices. It can (a) wait for source finality, which is minutes to hours and unacceptable at point of sale, or (b) front the funds with its own or a solver's capital and absorb reorg, fraud, and indexer risk. The Across case shows that risk is real even when the contracts are sound: the weak point was off-chain observation.
- Trust models differ per route. CCTP relies on Circle's attestation service. LayerZero (used by USDT0) relies on the configured DVN set. CCIP relies on Chainlink's DON plus a risk-management network. Intents rely on solver liveness plus an oracle or settlement layer. A universal receiver inherits the **union** of these risks. *(Characterization of LayerZero and CCIP from general knowledge; not fetched this session.)*
- Failure handling has to cover several cases, each needing refund UX and accounting: partial fills, an expired intent with funds locked in a source-chain escrow, a destination that is a contract that rejects or can't handle the token, and attestation delays.

### Gaps
- I did not fetch LayerZero DVN, Chainlink CCIP, or ERC-7683 docs directly in this session.
- Global CCTP Fast Transfer allowance size and fee were not in the fetched docs.
- No dataset on the frequency of stuck or refunded cross-chain transfers was found.

## 4. Security history (bridge hacks, lessons, 2025–2026 incidents, SoK and academic work, cross-chain MEV)

### Takeaway
Bridges are historically the most-exploited layer in crypto, at roughly $2.9B lost across 34 incidents from 2021 to Q3 2025. Most losses came from key or validator compromise and verification bugs rather than exotic cryptography. Any universal-settlement product either becomes a bridge or depends on several bridges.

### Cited Findings
- Ronin bridge: about $624–625M (March 2022), via compromised validator keys under a 5-of-9 threshold. Wormhole: about $326M (Feb 2022), via a signature-verification bypass, with Jump Crypto replacing 120k ETH. Nomad: about $190M (Aug 2022), a "crowd-looted" initialization bug. — [Spark research (vendor)](https://www.spark.money/research/stablecoin-bridge-hack-postmortem-lessons); [The Defiant (citing Rekt leaderboard)](https://www.thedefiant.io/nomad-crowd-looting-triggers-exodus-from-other-blockchains); [Blockworks 2022 hacks](https://blockworks.co/news/crypto-hacks-2022)
- Multichain: about $126M (July 2023). Only a single weak secondary source was found. **UNVERIFIED.** — [blockeden course page](https://blockeden.xyz/course/defi/10.2/)
- Global Ledger counts about $2.9B stolen in 34 cross-chain bridge incidents from 2021 to Q3 2025, about 66% of it in 2022. — [Global Ledger PDF](https://app.globalledger.io/hubfs/Press%20Materials/All%20Bridge%20Hacks%2C%20%242.9B%20Lost.pdf)
- Chainalysis put total 2025 crypto theft at about $3.4B, about 44% of it from the $1.5B Bybit hack. DPRK actors stole at least $2.02B and launder through cross-chain bridges and mixers. — [The Block](https://www.theblock.co/post/382477/crypto-hack-2025-chainalysis); [Whale Alert summary](https://whale-alert.io/stories/cf6e926a27b7/Chainalysis-DPRK-linked-hackers-stole-202B-in-crypto-in-2025-using-crosschain-bridges-mixers-and-45day-laundering-waves)
- Across Solana relayer exploit (July 2026): about $4.5M gross, under $4M net, from a forged off-chain event reader. See Section 3. — [Cryptonomist](https://en.cryptonomist.ch/2026/07/24/across-solana-relayer-attack/)
- Academic work:
  - Zhang et al., "SoK: Security of Cross-chain Bridges" (arXiv:2312.12573): 12 attack surfaces plus a taxonomy of attacks. — [arXiv](https://arxiv.org/abs/2312.12573)
  - Belenkov et al. (Quantstamp), "SoK: A Review of Cross-Chain Bridge Hacks in 2023" (arXiv:2501.03423, Jan 2025). — [arXiv](https://arxiv.org/abs/2501.03423v1)
  - Notland & Li, "SoK: Cross-Chain Bridging Architectural Design Flaws and Mitigations" (*Blockchain: Research and Applications*, 2025). — [arXiv](https://arxiv.org/pdf/2403.00405.pdf)
  - "Hedge Funds on a Swamp" (arXiv:2507.06156, July 2025): formalizes 13 bridges, 23 attack vectors, 43 scenarios. — [arXiv](https://arxiv.org/abs/2507.06156)
- Cross-chain MEV:
  - Öz et al., "Cross-Chain Arbitrage: The Next Frontier of MEV in DeFi" (arXiv:2501.17335; ACM POMACS 9(3)): over $9.4M profit across 260k non-atomic arbitrages on 9 chains. — [arXiv](https://arxiv.org/html/2501.17335v2)
  - "Bunny Hops and Blockchain Stops" (arXiv:2511.17527): multihop cross-chain arbitrage opportunities are rare. — [arXiv](https://arxiv.org/html/2511.17527)

### Inferences
- The lessons that recur across the SoKs and postmortems are: small validator/multisig sets, verification bugs in the message-checking path, unsafe upgrades or initialization, and, in 2026, off-chain watchers and indexers. A payments company running its own relayer or solver takes on exactly this attack surface.
- Cross-chain MEV means any payment visible on one chain before it settles on another can be front-run or arbitraged. This mostly matters for swap legs (for example, USDT to USDC conversions).

### Gaps
- No primary Rekt leaderboard page was fetched, so figures come through secondary citations.
- No 2025–2026 bridge-only loss total from Chainalysis or Immunefi was found.
- Summaries of the SoK papers are based on abstracts and snippets, not full-text reads.

## 5. Ethereum interop roadmap (EF: OIF, EIL, fast confirmation; Superchain; AggLayer; Arbitrum/ZKsync) — live vs planned

### Takeaway
As of Nov 2026, only pieces are LIVE: OIF contracts with LI.FI in production, AggLayer pessimistic proofs, ENSIP-19, and CCTP V2. The parts that would make "one chain" UX real are still PLANNED or unconfirmed: EIL, the L1 Fast Confirmation Rule, and Superchain native interop on mainnet. All of this covers the Ethereum family only. Tron, Solana, and Bitcoin are out of scope.

### Cited Findings
- **Open Intents Framework (OIF):** Launched Feb 2025 by the EF with partners. It is a modular toolkit (contracts, solver, UI) built on ERC-7683 cross-chain intents. Coinbase Payments joined as a core contributor. In May 2026, LI.FI went into **production** on OIF. **LIVE (early).** — [The Block (OIF launch)](https://www.theblock.co/news/business/2025-02-19-ethereum-foundation-collaborates-on-new-framework-to-standardize-buzzy-intents-transactions-342194); [The Block (Coinbase joins)](https://www.theblock.co/amp/post/371185/coinbase-joins-open-intents-framework); [EtherWorld (LI.FI production)](https://www.etherworld.co/ethereum-foundation-advances-cross-chain-intents-with-li-fi-launch/)
- **Ethereum Interop Layer (EIL):** Its aim is to make L2s "feel like one chain" while preserving CROPS values (censorship resistance, open source, privacy, security). A design doc was scheduled for Oct 2025. **PLANNED / UNVERIFIED as production.** — [EF Protocol Update 003](https://blog.ethereum.org/2025/08/29/protocol-update-003); [The Block](https://www.theblock.co/post/368769/ethereum-foundation-aims-to-make-layer-2s-feel-like-one-chain-with-interoperability-framework)
- **Fast L1 Confirmation Rule, shorter slots (12 s to 6 s), shorter L2 settlement:** These are EF "Improve UX / Acceleration" projects. FCR was targeted for Q1 2026, but timelines conflict across reports. **UNVERIFIED.** — [EF Protocol Update 003](https://blog.ethereum.org/2025/08/29/protocol-update-003); [CoinDesk](https://www.coindesk.com/tech/2025/08/29/ethereum-foundation-targets-interoperability-as-top-ux-priority)
- **Superchain native interop (OP Stack):** Rolled out in stages (devnet, testnet, mainnet) with a target of under 2 s cross-chain within the interop set. 2026 secondary sources say devnet/testnet only, with mainnet targeted "late 2026." **PLANNED.** Reports also say Base announced in Feb 2026 that it would move to in-house tech, which would shrink the interop set. **UNVERIFIED** (low-reliability secondary sources). — [OP Labs blog](https://blog.oplabs.co/solving-interoperability-for-the-superchain-and-beyond); [kolonell.com (low reliability)](https://kolonell.com/en/blog/optimism-superchain-2026-en)
- **Polygon AggLayer:** Pessimistic proofs went live on mainnet Feb 2025 (v0.2). v0.3 (June 2025) extended them to non-CDK chains (Polygon PoS first, plus a hybrid OP Stack option). **LIVE**, but for a limited chain set. I found no current list of connected chains. — [Polygon blog](https://polygon.technology/blog/major-development-upgrade-for-a-multistack-future-pessimistic-proofs-live-on-agglayer-mainnet); [Agglayer v0.3](https://www.agglayer.dev/blogs/agglayer-v0-3-is-live)

### Inferences
- Even when EF and L2 interop matures, it addresses the Ethereum rollup family. The largest stablecoin payment volumes on Tron, plus Solana and BNB, sit outside it. So "any chain" will keep needing third-party bridges or issuer-specific rails (CCTP, USDT0) for the foreseeable future.

### Gaps
- No primary 2026 EF blog post confirming EIL or FCR shipping status was found.
- Arbitrum and ZKsync (Elastic Network / ZK Stack shared bridge) 2026 interop status was not researched within the tool budget.
- L2BEAT was not consulted for current bridge risk ratings.

## 6. Engineering cost of building it anyway (per-chain integration, solver/liquidity capital, gas sponsorship)

### Takeaway
I found no rigorous public cost estimates. The figures below are reasoned inferences from the mechanics above and should be treated as order-of-magnitude assumptions, not sourced facts.

### Cited Findings
- Fast settlement requires someone's capital. CCTP Fast Transfer is capped by a global allowance against reorg risk ([Circle docs](https://developers.circle.com/cctp/required-block-confirmations)). The Across incident shows relayer capital is directly at risk, with about $4.5M advanced against forged deposits before pausing ([Cryptonomist](https://en.cryptonomist.ch/2026/07/24/across-solana-relayer-attack/)).
- Hard finality on some supported chains (Linea ~6–32 h, Starknet ~2–4 h) means capital fronted for those routes is tied up for hours per payment. — [Circle docs](https://developers.circle.com/cctp/required-block-confirmations)

### Inferences
- **Per-chain integration:** Each chain family (EVM, Solana/SVM, Tron/TVM, Bitcoin/UTXO) needs its own key management and signing, address derivation, RPC providers (with redundancy), indexer or webhook ingestion, reorg-aware confirmation logic, token registry, and fee estimation. EVM chains share most of this, so the marginal cost is mainly RPC, monitoring, and token-list upkeep. Each new non-EVM family is a separate engineering track. The Across case shows that indexers and event readers are security-critical, not plumbing.
- **Liquidity and solver capital:** To credit a merchant instantly on chain B for a payment made on chain A, the operator must pre-fund inventory on every destination chain, sized to peak flow multiplied by the finality and rebalance window, plus rebalancing costs (bridge fees) and reorg/fraud loss reserves. Outsourcing to solvers (OIF/ERC-7683, Across, LI.FI) shifts the capital need to them but adds fees and counterparty/liveness dependence.
- **Gas sponsorship:** Gasless UX means the operator holds native gas tokens on every chain (ETH on each L2, SOL, TRX energy/bandwidth, BNB), with top-up automation and anti-drain controls. On Tron in particular, sponsoring USDT transfers requires staking or renting energy.
- **Risk and compliance:** Each bridge or route adds its trust model and its exploit history (Section 4). Each stablecoin variant adds issuer-specific freeze and blacklist behaviour and redemption differences.

### Gaps
- No public, sourced figures were found for per-chain integration engineer-months, RPC/indexer monthly costs at payment-app scale, solver inventory sizing, or gas-sponsorship spend per transaction. These would require vendor pricing pages (for example Alchemy, QuickNode, Helius, TronGrid), Tron energy-rental rates, and solver economics disclosures (Across, LI.FI), none of which were fetched within the tool budget.
