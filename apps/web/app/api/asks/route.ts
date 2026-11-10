// Money requests ("friends owe me"). GET ?party=0x…: requests to and from that wallet. POST: ask a group.
import { isAddress, type Address } from "viem"
import { listAsks, createAsks } from "@whitepay/server"
import { json } from "@/lib/json"
import { askFailure } from "@/lib/ask-api"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(req: Request) {
  const party = new URL(req.url).searchParams.get("party") ?? ""
  if (!isAddress(party)) return json({ error: "bad address" }, { status: 400 })
  try { return json({ asks: await listAsks(party as Address) }) } catch (e) { return askFailure(e) }
}

export async function POST(req: Request) {
  let b: any
  try { b = await req.json() } catch { return json({ error: "bad json" }, { status: 400 }) }
  try { return json(await createAsks({ from: b.from, groupId: b.groupId, items: b.items, note: b.note, issuedAt: Number(b.issuedAt), sig: b.sig })) } catch (e) { return askFailure(e) }
}
