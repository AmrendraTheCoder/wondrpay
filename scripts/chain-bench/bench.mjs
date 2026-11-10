// Chain benchmark for a "UPI for stablecoins" app — read-only, mainnet, no keys, no funds.
// For each chain it measures from live data:
//   - block time: average over the last N blocks
//   - RPC round trip from this machine (median of 5)
//   - real cost of a plain stablecoin transfer: finds recent USDC/USDT-like ERC-20 `transfer()` transactions
//     in the latest blocks and reads their receipts (gas used × effective gas price), priced in USD
// Run: node scripts/chain-bench/bench.mjs [--blocks 6] [--json out.json]
import { createRequire } from "node:module"
import { writeFileSync } from "node:fs"
const require = createRequire(new URL("../../apps/web/package.json", import.meta.url))
const { createPublicClient, http, parseAbiItem, formatUnits } = require("viem")

// gasToken: CoinGecko id for the token gas is paid in ("usd" = a dollar stablecoin)
const CHAINS = [
  { name: "Ethereum", id: 1, rpc: "https://ethereum-rpc.publicnode.com", gas: "ethereum" },
  { name: "Base", id: 8453, rpc: "https://mainnet.base.org", gas: "ethereum" },
  { name: "Arbitrum One", id: 42161, rpc: "https://arb1.arbitrum.io/rpc", gas: "ethereum" },
  { name: "OP Mainnet", id: 10, rpc: "https://mainnet.optimism.io", gas: "ethereum" },
  { name: "Polygon PoS", id: 137, rpc: "https://polygon-bor-rpc.publicnode.com", gas: "polygon-ecosystem-token" },
  { name: "Celo", id: 42220, rpc: "https://forno.celo.org", gas: "celo" },
  { name: "World Chain", id: 480, rpc: "https://worldchain-mainnet.g.alchemy.com/public", gas: "ethereum" },
  { name: "Avalanche C", id: 43114, rpc: "https://api.avax.network/ext/bc/C/rpc", gas: "avalanche-2" },
  { name: "BNB Chain", id: 56, rpc: "https://bsc-dataseed1.bnbchain.org", gas: "binancecoin" },
  { name: "Monad", id: 143, rpc: "https://rpc.monad.xyz", gas: "monad" },
  { name: "Arc", id: 5042, rpc: "https://rpc.mainnet.arc.io", gas: "usd" },
  { name: "Tempo", id: 4217, rpc: "https://rpc.mainnet.tempo.xyz", gas: "usd" },
  { name: "Stable", id: 988, rpc: "https://rpc.stable.xyz", gas: "usd" },
  { name: "Plasma", id: 9745, rpc: "https://rpc.plasma.to", gas: "plasma" },
  { name: "Whitechain", id: 1875, rpc: "https://rpc.whitechain.io", gas: "whitebit" },
]
// well-known stablecoin contracts (issuer docs); more are discovered by symbol in recent blocks
const KNOWN = {
  1: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0xdAC17F958D2ee523a2206206994597C13D831ec7"],
  8453: ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
  42161: ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831", "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"],
  10: ["0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"],
  137: ["0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"],
  42220: ["0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", "0xcebA9300f2b948710d2653dD7B07f33A8B32118C"],
  480: ["0x79A02482A880bCE3F13e09Da970dC34db4CD24d1"],
  43114: ["0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"],
  56: ["0x55d398326f99059fF775485246999027B3197955", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"],
}
const args = process.argv.slice(2)
const SCAN = Number(args[args.indexOf("--blocks") + 1]) || 6
const JSON_OUT = args.includes("--json") ? args[args.indexOf("--json") + 1] : null
const TRANSFER = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)")
const SYMBOL_ABI = [{ type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] }]
const STABLE_RE = /^(USDC(\.e)?|USDT0?|USD₮0?|USDT\.e|PYUSD|USDG|AUSD|cUSD|USDe|pathUSD|alphaUSD|.*USD)$/i
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null }
const timed = async (f) => { const t = performance.now(); await f(); return performance.now() - t }

async function prices() {
  const ids = [...new Set(CHAINS.map((c) => c.gas).filter((g) => g !== "usd"))].join(",")
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, { signal: AbortSignal.timeout(15000) })
    const d = await r.json()
    return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.usd]))
  } catch { return {} }
}

async function bench(c, px) {
  const pub = createPublicClient({ transport: http(c.rpc, { timeout: 20_000, retryCount: 1 }) })
  const out = { chain: c.name, chainId: c.id }
  try {
    const id = await pub.getChainId()
    if (id !== c.id) out.note = `RPC reports chain ${id}`
    out.rpcMs = Math.round(median(await Promise.all([0, 1, 2, 3, 4].map(() => timed(() => pub.getBlockNumber())))))
    const head = await pub.getBlock()
    const span = 300n
    const old = await pub.getBlock({ blockNumber: head.number > span ? head.number - span : 0n })
    out.blockTimeS = +((Number(head.timestamp - old.timestamp)) / Number(head.number - old.number)).toFixed(3)
    // recent Transfer logs → stablecoin-looking tokens
    const disc = await pub.getLogs({ event: TRANSFER, fromBlock: head.number - BigInt(SCAN - 1), toBlock: head.number }).catch(() => [])
    const counts = {}
    for (const l of disc) counts[l.address] = (counts[l.address] ?? 0) + 1
    const cand = [...new Set([...(KNOWN[c.id] ?? []), ...Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([a]) => a)])]
    const stables = []
    for (const a of cand) {
      const sym = await pub.readContract({ address: a, abi: SYMBOL_ABI, functionName: "symbol" }).catch(() => null)
      if (sym && STABLE_RE.test(sym) && !stables.some((s) => s.address.toLowerCase() === a.toLowerCase())) stables.push({ address: a, sym })
    }
    // address-filtered logs, walking back in chunks until enough transfers are found
    let logs = []
    for (let i = 0n, step = 50n; i < 2000n && logs.length < 200 && stables.length; i += step) {
      const to = head.number - i
      const got = await pub.getLogs({ address: stables.map((s) => s.address), event: TRANSFER, fromBlock: to - step + 1n, toBlock: to }).catch(() => [])
      logs = logs.concat(got)
    }
    out.stablecoinsSeen = stables.map((s) => s.sym).join(", ") || null
    // plain transfer() txs to those tokens
    const stableSet = new Set(stables.map((s) => s.address.toLowerCase()))
    const hashes = [...new Set(logs.filter((l) => stableSet.has(l.address.toLowerCase())).map((l) => l.transactionHash))].slice(0, 80)
    const fees = [], gasUsed = []
    for (const h of hashes) {
      if (fees.length >= 12) break
      const [tx, rc] = await Promise.all([pub.getTransaction({ hash: h }).catch(() => null), pub.getTransactionReceipt({ hash: h }).catch(() => null)])
      if (!tx || !rc || rc.status !== "success") continue
      if (!tx.to || !stableSet.has(tx.to.toLowerCase()) || rc.logs.length > 2) continue // a direct call on the token, not a router/AA bundle
      const l1 = rc.l1Fee != null ? BigInt(rc.l1Fee) : 0n // OP-stack data fee (some RPCs return it as hex text)
      const fee = rc.gasUsed * BigInt(rc.effectiveGasPrice ?? tx.gasPrice ?? 0n) + l1
      // Celo: fee paid in a stablecoin (feeCurrency) is quoted in 18-decimal dollar units
      fees.push({ v: Number(formatUnits(fee, 18)), usd: !!tx.feeCurrency }); gasUsed.push(Number(rc.gasUsed))
    }
    out.sampleTransfers = fees.length
    if (fees.length) {
      out.gasUsed = median(gasUsed)
      const usdEach = fees.map((f) => (f.usd || c.gas === "usd" ? f.v : px[c.gas] != null ? f.v * px[c.gas] : NaN)).filter((x) => !Number.isNaN(x))
      out.feeUsd = usdEach.length ? +median(usdEach).toPrecision(3) : null
      if (fees.some((f) => f.usd)) out.note = (out.note ? out.note + "; " : "") + "some fees paid in a stablecoin (feeCurrency)"
      if (out.feeUsd == null) out.note = (out.note ? out.note + "; " : "") + `no price for ${c.gas}`
    } else {
      // no live sample: simulate a real transfer of 1 base unit from an address that just received the token
      const gp = await pub.getGasPrice().catch(() => null)
      const recv = logs.find((l) => l.args?.to)
      let gas = null
      if (recv) gas = await pub.estimateGas({ account: recv.args.to, to: recv.address, data: "0xa9059cbb" + "000000000000000000000000000000000000000000000000000000000000dead".padStart(64, "0") + "1".padStart(64, "0") }).catch(() => null)
      if (gp != null) {
        const units = gas ?? 65_000n
        out.gasUsed = Number(units)
        const feeNative = Number(formatUnits(units * gp, 18))
        const usd = c.gas === "usd" ? 1 : px[c.gas]
        out.feeUsd = usd != null ? +(feeNative * usd).toPrecision(3) : null
        out.note = (out.note ? out.note + "; " : "") + (gas ? "simulated transfer (estimateGas) × current gas price" : "estimate: 65k gas × current gas price")
      }
    }
  } catch (e) { out.error = (e.shortMessage ?? e.message ?? String(e)).split("\n")[0].slice(0, 120) }
  return out
}

const px = await prices()
const rows = await Promise.all(CHAINS.map((c) => bench(c, px)))
const fmt = (v, d = 4) => (v == null ? "–" : typeof v === "number" ? (Math.abs(v) < 0.001 && v !== 0 ? v.toExponential(2) : +v.toFixed(d)) : v)
console.log(`\nStablecoin transfer benchmark · ${new Date().toISOString()} · scanned last ${SCAN} blocks per chain\n`)
console.log("| Chain | Block time (s) | Transfer fee (USD) | Gas used | Samples | RPC ms | Stablecoins seen | Note |")
console.log("|---|---|---|---|---|---|---|---|")
for (const r of rows.sort((a, b) => (a.feeUsd ?? 9e9) - (b.feeUsd ?? 9e9)))
  console.log(`| ${r.chain} | ${fmt(r.blockTimeS, 3)} | ${fmt(r.feeUsd)} | ${fmt(r.gasUsed, 0)} | ${r.sampleTransfers ?? "–"} | ${fmt(r.rpcMs, 0)} | ${r.stablecoinsSeen ?? "–"} | ${r.error ? "ERROR: " + r.error : r.note ?? ""} |`)
console.log(`\nGas-token prices (CoinGecko): ${JSON.stringify(px)}`)
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ at: new Date().toISOString(), prices: px, rows }, null, 2))
