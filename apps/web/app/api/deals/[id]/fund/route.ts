// The buyer pays into protection: an EIP-3009 authorization to the escrow, relayed (the buyer pays no gas).
import { isAddress, isHex, type Address, type Hex } from "viem"
import { relayFund } from "@whitepay/server"
import { json } from "@/lib/json"
import { dealFailure, blockedCountry, blockedResponse } from "@/lib/deal-api"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (blockedCountry(req)) return blockedResponse()
  const { id } = await ctx.params
  let b: any
  try { b = await req.json() } catch { return json({ error: "bad json" }, { status: 400 }) }
  const a = b?.auth
  if (b?.acceptedTerms !== true) return json({ error: "Accept the Protected Pay terms first.", code: "terms" }, { status: 400 })
  if (!a || !isAddress(a.from) || !isHex(a.signature)) return json({ error: "malformed payment" }, { status: 400 })
  try {
    return json(await relayFund({ dealId: id, auth: { from: a.from as Address, validAfter: BigInt(a.validAfter), validBefore: BigInt(a.validBefore), signature: a.signature as Hex } }))
  } catch (e) { return dealFailure(e) }
}
