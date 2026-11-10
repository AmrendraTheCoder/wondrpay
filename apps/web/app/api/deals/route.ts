// Protected deals. POST: the seller's signed offer becomes a deal link. GET ?party=0x…: that wallet's deals.
// GET ?desk=1: escalated deals waiting for the dispute desk (public, like the chain). GET with no party: the escrow's public settings (fee, cap, time limits).
import { isAddress, type Address } from "viem"
import { createDeal, listDeals, listEscalated, dealSettings } from "@whitepay/server"
import { json } from "@/lib/json"
import { clientIp, rateLimit } from "@whitepay/shared/security"
import { dealFailure, blockedCountry, blockedResponse } from "@/lib/deal-api"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams, party = q.get("party")
  try {
    if (q.get("desk")) return json({ deals: await listEscalated() })
    if (!party) return json({ ...(await dealSettings()), blocked: !!blockedCountry(req) })
    if (!isAddress(party)) return json({ error: "bad address" }, { status: 400 })
    return json({ deals: await listDeals(party as Address) })
  } catch (e) { return dealFailure(e) }
}

export async function POST(req: Request) {
  if (blockedCountry(req)) return blockedResponse()
  if (!rateLimit(`deal-new|${clientIp(req.headers)}`, 10, 60 * 60_000).ok) return json({ error: "Too many new deals from this network. Try again in an hour." }, { status: 429 })
  let b: any
  try { b = await req.json() } catch { return json({ error: "bad json" }, { status: 400 }) }
  if (b?.acceptedTerms !== true) return json({ error: "Accept the Protected Pay terms first.", code: "terms" }, { status: 400 })
  try { return json(await createDeal({ offer: b.offer, payeeSig: b.payeeSig, title: b.title, details: b.details })) } catch (e) { return dealFailure(e) }
}
