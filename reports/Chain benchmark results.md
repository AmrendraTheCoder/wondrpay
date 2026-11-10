# Chain benchmark results

Live mainnet measurement of what a plain stablecoin transfer costs on each chain, and how fast blocks are, taken on **9 Nov 2026 at 07:38 UTC** with [`scripts/chain-bench/bench.mjs`](../scripts/chain-bench/bench.mjs). Read-only: no keys, no funds, nothing sent.

**How it works.**
- **Block time:** the average over the last 300 blocks.
- **Fee:** the median gas actually paid by recent direct `transfer()` calls on USDC or USDT (gas used × effective gas price, plus the Ethereum data fee on OP-stack chains), converted to USD with CoinGecko prices.
- **Fallback:** where no live transfer was found in the last ~2,000 blocks, it simulates a real one (`estimateGas` from an address that just received the token) × the current gas price. If that isn't possible, it assumes 65k gas.

| Chain | Block time | Fee for one stablecoin transfer | Gas units | How measured |
|---|---|---|---|---|
| Plasma | 1 s | $0.000002 | 43,824 | Median of 12 real transfers (paid path; plain USDT sends through Plasma's protocol paymaster cost the user $0) |
| OP Mainnet | 2 s | $0.000004 | 45,071 | Median of 12 real transfers |
| Stable | 0.70 s | $0.00007 | 65,000 | Estimate (no USDT0 transfer sampled) |
| World Chain | 2 s | $0.00014 | 45,413 | Simulated transfer |
| Tempo | 0.54 s | $0.00018 | 297,603 | Simulated `pathUSD` transfer; ⚠ fee units assumed to be 18-decimal dollars |
| Monad | 0.31 s | $0.00024 | 147,283 | Median of 12 real transfers (some carry extra logic) |
| Celo | 1 s | $0.00056 | 43,801 | 2 real transfers, some with the fee paid in USDT |
| Arc | 0.51 s | $0.00098 | 49,097 | Simulated USDC transfer, gas paid in USDC |
| Polygon PoS | 1.5 s | $0.0016 | 71,972 | Median of 12 real transfers |
| Avalanche C | 0.91 s | $0.0017 | 55,000 | Median of 12 real transfers |
| Arbitrum One | 0.26 s | $0.0021 | 40,271 | Median of 12 real transfers |
| BNB Chain | 0.45 s | $0.0022 | 65,000 | Estimate |
| Base | 0.2 s | $0.0036 | 86,242 | 2 real transfers |
| Whitechain | 1 s | $0.023 | 65,000 | Estimate; **no stablecoin activity yet on the new mainnet** (official USDT not live) |
| Ethereum | 12 s | $0.21 | 62,260 | Median of 12 real transfers |

Gas-token prices used: ETH $2,094.50, POL $0.087, CELO $0.063, AVAX $7.85, BNB $675.97, MON $0.0157, XPL $0.051, WBT $71.40. Arc, Tempo and Stable charge gas in a dollar stablecoin.

**Not measured here (from the research report):** Tron, about $2–4.50 per USDT transfer in burned TRX, or about 1.5 USDT through GasFree; Solana, fractions of a cent, paid in SOL.

## What this tells a universal app

- **On every modern chain the fee is not the problem.** All are under half a cent except Ethereum mainnet ($0.21). Tron is the only expensive rail people actually use for USDT.
- **The real differences are elsewhere:**
  - **Who pays gas:** dollars on Arc, Tempo and Stable; free USDT on Plasma; the native token everywhere else.
  - **Finality:** sub-second blocks on Monad, Base, Arbitrum and Tempo.
  - **Where users and liquidity are:** Tron, Base and Arbitrum.
- **Whitechain:** a transfer costs about 2 cents at today's WBT price, and the chain has no stablecoin flow yet. Its value is WhiteBIT's user base, not cost.
- **Trust in the numbers:** fees on Tempo, Stable and BNB are estimates; treat them as rough.

## Rerun

```bash
node scripts/chain-bench/bench.mjs --json bench.json
```

Public RPC endpoints are rate-limited, so a chain occasionally returns no sample. Rerunning fixes it.
