// Decline a money request (the person asked) or cancel it (the person who asked). Signed by that wallet.
import { actOnAsk } from "@whitepay/server"
import { json } from "@/lib/json"
import { askFailure } from "@/lib/ask-api"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request) {
  let b: any
  try { b = await req.json() } catch { return json({ error: "bad json" }, { status: 400 }) }
  try { return json(await actOnAsk({ askId: b.askId, actor: b.actor, action: b.action, issuedAt: Number(b.issuedAt), sig: b.sig })) } catch (e) { return askFailure(e) }
}
