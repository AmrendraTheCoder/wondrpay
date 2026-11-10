// Enforce a deadline that has passed. Anyone may ask; the contract decides who gets the money.
import { relayPoke } from "@whitepay/server"
import { json } from "@/lib/json"
import { clientIp, rateLimit } from "@whitepay/shared/security"
import { dealFailure } from "@/lib/deal-api"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!rateLimit(`deal-poke|${clientIp(req.headers)}`, 10, 60_000).ok) return json({ error: "Too many tries. Wait a minute." }, { status: 429 })
  try { return json(await relayPoke(id)) } catch (e) { return dealFailure(e) }
}
