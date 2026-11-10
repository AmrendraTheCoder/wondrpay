// Money requests ("friends owe me"): one person asks others for their share of something.
//  - A request never moves money. The person asked pays it like any person-to-person payment, with their own
//    PIN, after seeing who asks and for what; or declines it.
//  - The payment's memo is the request id, so the EIP-3009 nonce is fixed: a request can't be paid twice.
//  - Limits (ASK in @whitepay/shared/split) stop requests being used to pester strangers.
import { ExpirationTime } from "@arkiv-network/sdk"
import { addr, u64 } from "@arkiv-network/sdk/schema"
import { and, or, eq, gte, desc } from "@arkiv-network/sdk/query"
import { getAddress, hexToBytes, isAddress, isHex, type Address, type Hex } from "viem"
import { MoneyAsk } from "@whitepay/shared/arkiv"
import { LIMITS } from "@whitepay/shared"
import { ASK, askId, askGroupMessage, askActionMessage, type AskStatus } from "@whitepay/shared/split"
import { arkiv, wc } from "./clients"
import { cached, invalidate } from "./cache"

export class AskError extends Error {
  constructor(public code: "bad_request" | "not_found" | "rate_limited" | "not_allowed", msg: string) { super(msg) }
}
export type AskView = { askId: Hex; groupId: Hex; from: Address; to: Address; amount: string; note?: string; status: AskStatus; createdAt: number; expiresAt: number; paidTx?: string }

const now = () => Math.floor(Date.now() / 1000)
const v = (x: any) => (x && typeof x === "object" && "value" in x ? x.value : x)
const clean = (s: string) => s.replace(/<[^>]*>/g, "").replace(/[\u0000-\u001f]/g, " ").trim()
const isId = (x: unknown): x is Hex => typeof x === "string" && isHex(x) && x.length === 66
const FIELDS = { $key: true, askId: true, groupId: true, from: true, to: true, amount: true, note: true, status: true, createdAt: true, expiresAt: true, paidTx: true } as const

type Row = AskView & { key: Hex; stored: string }
const toRow = (e: any): Row => {
  const stored = String(v(e.status)), expiresAt = Number(v(e.expiresAt))
  return {
    key: e.$key, askId: v(e.askId), groupId: v(e.groupId), from: getAddress(v(e.from)), to: getAddress(v(e.to)), amount: BigInt(v(e.amount)).toString(),
    note: v(e.note) || undefined, stored, status: (stored === "open" && now() > expiresAt ? "expired" : stored) as AskStatus,
    createdAt: Number(v(e.createdAt)), expiresAt, paidTx: v(e.paidTx) || undefined,
  }
}
async function rows(where: any, limit = 100): Promise<Row[]> {
  const a = arkiv()
  const page = await a.pub.select(FIELDS).from(MoneyAsk).ownedBy(a.owner).where(where as never).orderBy(desc("createdAt")).limit(limit).fetch()
  return (page.entities as any[]).map(toRow)
}
const view = ({ key: _k, stored: _s, ...r }: Row): AskView => r

/** Requests this wallet made (it is owed) and requests made to it (it owes), newest first. */
export async function listAsks(party: Address): Promise<AskView[]> {
  const a = addr(getAddress(party))
  return cached(`asks:${party.toLowerCase()}`, 5_000, async () => (await rows(or(eq("from", a), eq("to", a)))).map(view))
}

/** Create one request per person. `sig` is the asker's signature over the whole group. */
export async function createAsks(p: { from: string; groupId: string; items: { to: string; amount: string }[]; note?: string; issuedAt: number; sig: string }) {
  if (!isAddress(p.from) || !isId(p.groupId) || !isHex(p.sig) || !Array.isArray(p.items)) throw new AskError("bad_request", "Malformed request")
  const from = getAddress(p.from), note = clean(String(p.note ?? ""))
  if (note.length > ASK.note) throw new AskError("bad_request", `The note can be up to ${ASK.note} characters`)
  if (p.items.length < 1 || p.items.length > ASK.maxPeople) throw new AskError("bad_request", `You can ask 1 to ${ASK.maxPeople} people at once`)
  if (!Number.isInteger(p.issuedAt) || Math.abs(now() - p.issuedAt) > 15 * 60) throw new AskError("bad_request", "That signature expired. Sign again.")
  let items: { to: Address; amount: bigint }[]
  try {
    items = p.items.map((i) => { if (!isAddress(i.to)) throw 0; const amount = BigInt(i.amount); if (amount <= 0n || amount > LIMITS.dailyPerPayer) throw 0; return { to: getAddress(i.to), amount } })
  } catch { throw new AskError("bad_request", "Every person needs a valid address and an amount between 0 and the daily limit") }
  if (new Set(items.map((i) => i.to.toLowerCase())).size !== items.length) throw new AskError("bad_request", "The same person is in the list twice")
  if (items.some((i) => i.to === from)) throw new AskError("bad_request", "You can't ask yourself")
  const message = askGroupMessage({ from, groupId: p.groupId, items, note, issuedAt: p.issuedAt })
  if (!(await wc().pub.verifyMessage({ address: from, message, signature: p.sig as Hex }))) throw new AskError("bad_request", "The signature doesn't match this wallet")

  // limits, counted from Arkiv so they hold on every server instance
  const mine = await rows(and(eq("from", addr(from)), gte("createdAt", u64(BigInt(now() - ASK.ttlSeconds)))))
  if (mine.some((r) => r.groupId === p.groupId.toLowerCase())) return { groupId: p.groupId.toLowerCase() as Hex, created: 0 } // retry of the same request
  if (mine.filter((r) => r.createdAt > now() - 86_400).length + items.length > ASK.perDay) throw new AskError("rate_limited", `You can ask up to ${ASK.perDay} people a day`)
  for (const i of items)
    if (mine.filter((r) => r.to === i.to && r.status === "open").length >= ASK.openPerPair) throw new AskError("rate_limited", "You already have open requests to one of these people. Wait for an answer first.")

  const a = arkiv(), t = now(), groupId = p.groupId.toLowerCase() as Hex, sig = hexToBytes(p.sig as Hex)
  for (const i of items) {
    await a.writer.createEntity(MoneyAsk, {
      askId: askId(groupId, i.to, from).toLowerCase(), groupId, from: addr(from), to: addr(i.to), amount: i.amount, ...(note ? { note } : {}),
      status: "open", createdAt: u64(BigInt(t)), expiresAt: u64(BigInt(t + ASK.ttlSeconds)), updatedAt: u64(BigInt(t)), sig,
    } as any, { expiration: ExpirationTime.fromSeconds(ASK.ttlSeconds + 60 * 86_400) }, { gas: 2_000_000n })
    invalidate(`asks:${i.to.toLowerCase()}`)
  }
  invalidate(`asks:${from.toLowerCase()}`)
  return { groupId, created: items.length }
}

async function setStatus(r: Row, status: string, extra: Record<string, unknown> = {}) {
  await (arkiv().writer as any).patchEntity(MoneyAsk, r.key, { set: { status, updatedAt: u64(BigInt(now())), ...extra } }, { gas: 1_000_000n })
  invalidate(`asks:${r.from.toLowerCase()}`); invalidate(`asks:${r.to.toLowerCase()}`)
}

/** Decline (by the person asked) or cancel (by the person owed). Needs that wallet's signature. */
export async function actOnAsk(p: { askId: string; actor: string; action: string; issuedAt: number; sig: string }) {
  if (!isId(p.askId) || !isAddress(p.actor) || !isHex(p.sig) || (p.action !== "decline" && p.action !== "cancel")) throw new AskError("bad_request", "Malformed request")
  if (!Number.isInteger(p.issuedAt) || Math.abs(now() - p.issuedAt) > 15 * 60) throw new AskError("bad_request", "That signature expired. Sign again.")
  const r = (await rows(eq("askId", p.askId.toLowerCase()), 1))[0]
  if (!r) throw new AskError("not_found", "This request doesn't exist any more")
  const actor = getAddress(p.actor)
  if (actor !== (p.action === "decline" ? r.to : r.from)) throw new AskError("not_allowed", p.action === "decline" ? "Only the person asked can decline" : "Only the person who asked can cancel")
  if (r.status !== "open") throw new AskError("not_allowed", `This request is already ${r.status}`)
  const message = askActionMessage({ askId: r.askId, actor, action: p.action, issuedAt: p.issuedAt })
  if (!(await wc().pub.verifyMessage({ address: actor, message, signature: p.sig as Hex }))) throw new AskError("bad_request", "The signature doesn't match this wallet")
  await setStatus(r, p.action === "decline" ? "declined" : "cancelled")
  return { askId: r.askId, status: p.action === "decline" ? "declined" : "cancelled" }
}

/** Called after a person-to-person payment settled: if its memo is an open request from the payee to the payer
 *  for no more than was paid, mark that request paid. Never throws (a payment must not fail because of this). */
export async function markAskPaid(p: { memo: Hex; payer: Address; payee: Address; amount: bigint; txHash: Hex }) {
  try {
    const r = (await rows(eq("askId", p.memo.toLowerCase()), 1))[0]
    if (!r || r.stored !== "open") return false
    if (r.to !== getAddress(p.payer) || r.from !== getAddress(p.payee) || p.amount < BigInt(r.amount)) return false
    await setStatus(r, "paid", { paidTx: p.txHash.toLowerCase() })
    return true
  } catch (e) { console.warn("request not marked paid:", (e as Error).message.split("\n")[0]); return false }
}
