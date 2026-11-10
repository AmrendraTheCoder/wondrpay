// Keeper: enforce deadlines that passed on open protected deals (daily cron + on demand).
// Safe to leave open: it can only do what anyone may do on-chain, and the contract decides the outcome.
import { pokeDue } from "@whitepay/server"
import { json, errorMessage } from "@/lib/json"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET() {
  try { return json(await pokeDue()) } catch (e) { return json({ error: errorMessage(e) }, { status: 502 }) }
}
