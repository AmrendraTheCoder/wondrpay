// The dispute thread: a signed message or proof link from the buyer, the seller or the dispute desk.
import { postDealEvent } from "@whitepay/server"
import { json } from "@/lib/json"
import { clientIp, rateLimit } from "@whitepay/shared/security"
import { dealFailure } from "@/lib/deal-api"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!rateLimit(`deal-msg|${clientIp(req.headers)}`, 20, 10 * 60_000).ok) return json({ error: "Too many messages. Wait a few minutes." }, { status: 429 })
  let b: any
  try { b = await req.json() } catch { return json({ error: "bad json" }, { status: 400 }) }
  try { return json(await postDealEvent({ dealId: id, actor: b.actor, kind: b.kind ?? "message", text: b.text, evidence: b.evidence, issuedAt: Number(b.issuedAt), sig: b.sig })) }
  catch (e) { return dealFailure(e) }
}
