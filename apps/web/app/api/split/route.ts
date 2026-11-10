// Split pay-out: one signed payment, many recipients, one transaction (SplitPay contract). Gasless for the payer.
import { isAddress, isHex, type Address, type Hex } from "viem"
import { after } from "next/server"
import { relaySplit, settleOnArkiv, PolicyError, SplitError } from "@whitepay/server"
import { json, errorMessage } from "@/lib/json"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request) {
  let b: any
  try { b = await req.json() } catch { return json({ error: "bad json" }, { status: 400 }) }
  const a = b?.auth
  if (!a || !isAddress(a.from) || !isHex(a.signature)) return json({ error: "malformed payment" }, { status: 400 })
  try {
    const auth = { from: a.from as Address, validAfter: BigInt(a.validAfter), validBefore: BigInt(a.validBefore), signature: a.signature as Hex }
    const paid = await relaySplit({ to: b.to, amounts: b.amounts, memo: b.memo, auth })
    // one receipt for the payer's history and the daily limit; each recipient sees the on-chain transfer
    after(() => settleOnArkiv({ merchant: paid.contract, merchantName: `Split between ${paid.people} ${paid.people === 1 ? "person" : "people"}`, payer: auth.from, amount: paid.total,
      paymentId: paid.splitId, txHash: paid.txHash, block: paid.block, kind: "split" }).then(() => {}, (e) => console.error("arkiv settle failed", errorMessage(e))))
    return json({ txHash: paid.txHash, explorer: paid.explorer, total: paid.total, people: paid.people })
  } catch (e) {
    if (e instanceof SplitError) return json({ error: e.message, code: e.code }, { status: e.code === "bad_request" ? 400 : 403 })
    if (e instanceof PolicyError) return json({ error: e.message, code: e.code }, { status: 403 })
    return json({ error: errorMessage(e) }, { status: 500 })
  }
}
