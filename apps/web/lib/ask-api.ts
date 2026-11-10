// Error mapping shared by the /api/asks routes.
import { AskError } from "@whitepay/server"
import { json, errorMessage } from "@/lib/json"

const STATUS: Record<string, number> = { bad_request: 400, not_found: 404, rate_limited: 429, not_allowed: 403 }
export const askFailure = (e: unknown) => (e instanceof AskError ? json({ error: e.message, code: e.code }, { status: STATUS[e.code] ?? 400 }) : json({ error: errorMessage(e) }, { status: 500 }))
