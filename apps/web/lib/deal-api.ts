// Shared pieces of the /api/deals routes: error mapping and the country block for real-money launches.
import { DealError, PolicyError } from "@whitepay/server"
import { json, errorMessage } from "@/lib/json"

const STATUS: Record<string, number> = { bad_request: 400, not_found: 404, rate_limited: 429, not_allowed: 403 }

export function dealFailure(e: unknown) {
  if (e instanceof DealError) return json({ error: e.message, code: e.code }, { status: STATUS[e.code] ?? 400 })
  if (e instanceof PolicyError) return json({ error: e.message, code: e.code }, { status: 403 })
  return json({ error: errorMessage(e) }, { status: 500 })
}

/** Countries where protected deals are switched off, as ISO codes in DEALS_BLOCKED_COUNTRIES (e.g. "IN,US").
 *  Empty on testnet. The country comes from the host's edge header; a missing header is not blocked. */
export function blockedCountry(req: Request): string | null {
  const list = (process.env.DEALS_BLOCKED_COUNTRIES ?? "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
  if (!list.length) return null
  const country = (req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "").toUpperCase()
  return country && list.includes(country) ? country : null
}
export const blockedResponse = () => json({ error: "Protected deals aren't available in your country yet.", code: "country_blocked" }, { status: 451 })
