// A signed party action (deliver, release, report a problem, offer, accept, contest, escalate, cancel), relayed.
import { isAddress, type Address } from "viem"
import { relayAction, actionNonce } from "@whitepay/server"
import { json } from "@/lib/json"
import { dealFailure } from "@/lib/deal-api"

export const runtime = "nodejs"
export const maxDuration = 60

/** GET ?signer=0x… → the nonce that wallet must put in its next signed action */
export async function GET(req: Request) {
  const signer = new URL(req.url).searchParams.get("signer") ?? ""
  if (!isAddress(signer)) return json({ error: "bad address" }, { status: 400 })
  try { return json({ nonce: await actionNonce(signer as Address) }) } catch (e) { return dealFailure(e) }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  let b: any
  try { b = await req.json() } catch { return json({ error: "bad json" }, { status: 400 }) }
  if (String(b?.action?.dealId ?? "").toLowerCase() !== id.toLowerCase()) return json({ error: "This approval is for a different deal" }, { status: 400 })
  try { return json(await relayAction({ action: b.action, sig: b.sig })) } catch (e) { return dealFailure(e) }
}
