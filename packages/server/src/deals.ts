// Protected Pay: the server side of a protected deal.
//
//  - The ProtectedEscrow contract is the only source of truth for money and state. Everything here either
//    reads it or relays a signature the user made; the relayer has no special power in the contract.
//  - Arkiv holds the human-readable terms (so a deal link can rebuild the seller's signed offer), a status
//    cache for lists and the keeper, and the signed dispute thread.
//  - Every relay is simulated first: if the contract would reject it, nothing is sent and no gas is spent.
import { ExpirationTime } from "@arkiv-network/sdk"
import { addr, u64 } from "@arkiv-network/sdk/schema"
import { and, or, eq, desc } from "@arkiv-network/sdk/query"
import { getAddress, hashTypedData, hexToBytes, bytesToHex, isAddress, isHex, zeroAddress, type Address, type Hex } from "viem"
import { Deal, DealEvent } from "@whitepay/shared/arkiv"
import { ERC20_ABI } from "@whitepay/shared"
import {
  ESCROW_ABI, ESCROW_ADDRESS, DealState, ActionKind, ACTION_SIGNER, DEAL_BOUNDS, DEAL_TEXT,
  offerTypedData, dealEventMessage, onDeadline, isClosed, type Offer, type Action,
} from "@whitepay/shared/escrow"
import { arkiv, wc } from "./clients"
import { cached, invalidate } from "./cache"
import { config } from "./config"
import { PolicyError, checkPolicy, recordSpend, guardGas, sendRobust, shortErr, toAuthTuple, type PayerAuth } from "./relayer"

const BURN: Address = "0x000000000000000000000000000000000000dEaD"
const now = () => Math.floor(Date.now() / 1000)
const v = (x: any) => (x && typeof x === "object" && "value" in x ? x.value : x)
const hexOf = (x: string | Uint8Array) => (typeof x === "string" ? (x as Hex) : bytesToHex(x))
const esc = { address: (process.env.ESCROW_ADDRESS as Address | undefined) ?? ESCROW_ADDRESS, abi: ESCROW_ABI } as const
const clean = (s: string) => s.replace(/<[^>]*>/g, "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim()
const isId = (x: unknown): x is Hex => typeof x === "string" && isHex(x) && x.length === 66

export class DealError extends Error {
  constructor(public code: "bad_request" | "not_found" | "rate_limited" | "not_allowed", msg: string) { super(msg) }
}

export type DealEventView = { key: Hex; actor: Address; role: "payer" | "payee" | "arbiter"; kind: string; text: string; evidence?: string; at: number }
export type DealView = {
  dealId: Hex
  title: string
  details?: string
  payee: Address
  /** the buyer once funded; before that, the one buyer the seller allowed (if any) */
  payer?: Address
  amount: string
  fee: string
  total: string
  terms: { deliverWithin: number; inspectFor: number; respondWithin: number; offerExpiry: number }
  state: DealState
  stateName: keyof typeof DealState
  /** when the current step times out (0 before funding and after closing) */
  deadline: number
  /** what happens if nobody acts before the deadline */
  onDeadline: ReturnType<typeof onDeadline>
  offeredRefund: string
  fundedAt: number
  createdAt: number
  fundTx?: string
  /** the seller's signed offer, so a buyer's wallet can check it without trusting this server */
  offer: Record<keyof Offer, string | number>
  payeeSig: Hex
  escrow: Address
  /** the dispute desk's address: the only one that can decide an escalated deal */
  arbiter: Address
  events: DealEventView[]
}

// ------------------------------------------------------------------- Arkiv rows
type Row = {
  key: Hex; dealId: Hex; offerId: Hex; payee: Address; payer?: Address; onlyPayer?: Address; amount: bigint; title: string; details?: string
  deliverWithin: number; inspectFor: number; respondWithin: number; offerExpiry: number; payeeSig: Hex; status: string; createdAt: number; fundedAt?: number; fundTx?: string
}
const FIELDS = { $key: true, dealId: true, offerId: true, payee: true, payer: true, onlyPayer: true, amount: true, title: true, details: true, deliverWithin: true,
  inspectFor: true, respondWithin: true, offerExpiry: true, payeeSig: true, status: true, createdAt: true, fundedAt: true, fundTx: true } as const
const toRow = (e: any): Row => ({
  key: e.$key, dealId: v(e.dealId), offerId: v(e.offerId), payee: getAddress(v(e.payee)), payer: v(e.payer) ? getAddress(v(e.payer)) : undefined,
  onlyPayer: v(e.onlyPayer) ? getAddress(v(e.onlyPayer)) : undefined, amount: BigInt(v(e.amount)), title: v(e.title), details: v(e.details) || undefined,
  deliverWithin: Number(v(e.deliverWithin)), inspectFor: Number(v(e.inspectFor)), respondWithin: Number(v(e.respondWithin)), offerExpiry: Number(v(e.offerExpiry)),
  payeeSig: hexOf(v(e.payeeSig)), status: v(e.status), createdAt: Number(v(e.createdAt)), fundedAt: v(e.fundedAt) != null ? Number(v(e.fundedAt)) : undefined, fundTx: v(e.fundTx) || undefined,
})
async function rows(where: any, limit = 50): Promise<Row[]> {
  const a = arkiv()
  const page = await a.pub.select(FIELDS).from(Deal).ownedBy(a.owner).where(where as never).orderBy(desc("createdAt")).limit(limit).fetch()
  return (page.entities as any[]).map(toRow)
}
const rowOf = async (dealId: Hex) => (await rows(eq("dealId", dealId.toLowerCase()), 1))[0] ?? null
const offerOf = (r: Row): Offer => ({
  payee: r.payee, payer: r.onlyPayer ?? zeroAddress, amount: r.amount, deliverWithin: r.deliverWithin, inspectFor: r.inspectFor,
  respondWithin: r.respondWithin, offerExpiry: BigInt(r.offerExpiry), offerId: r.offerId,
})
async function mark(r: Row, set: Record<string, unknown>) {
  try { await (arkiv().writer as any).patchEntity(Deal, r.key, { set }, { gas: 1_000_000n }) } catch (e) { console.warn("deal status cache not updated:", (e as Error).message.split("\n")[0]) }
  invalidate(`deal:${r.dealId}`)
  invalidate("deals:")
}

// ------------------------------------------------------------------- chain reads
// fundedAt is optional: a later escrow version may drop it from storage (the Arkiv row and the DealFunded event keep it)
type ChainDeal = { payer: Address; deadline: bigint; inspectFor: number; payee: Address; respondWithin: number; state: number; amount: bigint; fee: bigint; offeredRefund: bigint; fundedAt?: bigint }
const chainDeal = (dealId: Hex) => wc().pub.readContract({ ...esc, functionName: "getDeal", args: [dealId] }) as Promise<ChainDeal>
const settings = () => cached("escrow:settings", 60_000, async () => {
  const { pub } = wc()
  const [feeBps, maxDealAmount, paused, arbiter] = await Promise.all([
    pub.readContract({ ...esc, functionName: "feeBps" }), pub.readContract({ ...esc, functionName: "maxDealAmount" }),
    pub.readContract({ ...esc, functionName: "newDealsPaused" }), pub.readContract({ ...esc, functionName: "arbiter" }),
  ])
  return { feeBps: Number(feeBps), maxDealAmount: maxDealAmount as bigint, paused: paused as boolean, arbiter: getAddress(arbiter as Address) }
})
/** Public settings of the escrow (fee, cap, whether new deals are paused). */
export const dealSettings = async () => { const s = await settings(); return { ...s, maxDealAmount: s.maxDealAmount.toString(), escrow: esc.address, bounds: DEAL_BOUNDS } }

// ------------------------------------------------------------------- create
const made = new Map<string, number[]>() // payee -> creation times (per instance)
const MAX_PER_DAY = 20

/** The seller signed an Offer in their wallet: check it exactly as the contract will, then store the terms. */
export async function createDeal(p: { offer: Record<string, unknown>; payeeSig: string; title: string; details?: string }) {
  const o = p.offer ?? {}
  if (!isAddress(String(o.payee)) || !isAddress(String(o.payer)) || !isId(o.offerId) || !isHex(p.payeeSig)) throw new DealError("bad_request", "Malformed offer")
  let offer: Offer
  try {
    offer = { payee: getAddress(String(o.payee)), payer: getAddress(String(o.payer)), amount: BigInt(String(o.amount)), deliverWithin: Number(o.deliverWithin),
      inspectFor: Number(o.inspectFor), respondWithin: Number(o.respondWithin), offerExpiry: BigInt(String(o.offerExpiry)), offerId: o.offerId }
  } catch { throw new DealError("bad_request", "Malformed offer") }
  const title = clean(String(p.title ?? "")), details = clean(String(p.details ?? ""))
  if (!title || title.length > DEAL_TEXT.title) throw new DealError("bad_request", `Give the deal a title (up to ${DEAL_TEXT.title} characters)`)
  if (details.length > DEAL_TEXT.details) throw new DealError("bad_request", `Details can be up to ${DEAL_TEXT.details} characters`)

  const s = await settings(), t = now(), B = DEAL_BOUNDS
  if (s.paused) throw new DealError("not_allowed", "New protected deals are paused right now")
  if (offer.amount <= 0n) throw new DealError("bad_request", "The price must be more than zero")
  if (offer.amount > s.maxDealAmount) throw new DealError("bad_request", `Protected deals are limited to ${Number(s.maxDealAmount) / 1e6} USDT for now`)
  const within = (x: number, b: { min: number; max: number }) => Number.isInteger(x) && x >= b.min && x <= b.max
  if (!within(offer.deliverWithin, B.deliverWithin) || !within(offer.inspectFor, B.inspectFor) || !within(offer.respondWithin, B.respondWithin))
    throw new DealError("bad_request", "Those time limits aren't allowed")
  if (offer.offerExpiry <= BigInt(t + 300) || offer.offerExpiry > BigInt(t + 30 * 86_400)) throw new DealError("bad_request", "The link must stay valid between 5 minutes and 30 days")
  if (offer.payer !== zeroAddress && offer.payer === offer.payee) throw new DealError("bad_request", "You can't make a deal with yourself")

  const typed = offerTypedData(esc.address, offer)
  // also accepts smart-contract wallets (ERC-1271), like the contract does
  if (!(await wc().pub.verifyTypedData({ ...typed, address: offer.payee, signature: p.payeeSig as Hex } as any))) throw new DealError("bad_request", "The seller's signature doesn't match this offer")
  const dealId = hashTypedData(typed as any).toLowerCase() as Hex

  const existing = await rowOf(dealId)
  if (existing) return { dealId, path: `/d/${dealId}` }
  const k = offer.payee.toLowerCase(), mine = (made.get(k) ?? []).filter((x) => t - x < 86_400)
  if (mine.length >= MAX_PER_DAY) throw new DealError("rate_limited", `You can create up to ${MAX_PER_DAY} protected deals a day`)

  const a = arkiv()
  await a.writer.createEntity(Deal, {
    dealId, offerId: offer.offerId, payee: addr(offer.payee), amount: offer.amount, title, ...(details ? { details } : {}),
    ...(offer.payer !== zeroAddress ? { payer: addr(offer.payer), onlyPayer: addr(offer.payer) } : {}),
    deliverWithin: u64(BigInt(offer.deliverWithin)), inspectFor: u64(BigInt(offer.inspectFor)), respondWithin: u64(BigInt(offer.respondWithin)),
    offerExpiry: u64(offer.offerExpiry), payeeSig: hexToBytes(p.payeeSig as Hex), status: "offer", createdAt: u64(BigInt(t)),
  } as any, { expiration: ExpirationTime.fromSeconds(Math.ceil((Number(offer.offerExpiry) - t + 120 * 86_400) / 2) * 2) }, { gas: 2_500_000n })
  made.set(k, [...mine, t])
  invalidate("deals:")
  return { dealId, path: `/d/${dealId}` }
}

// ------------------------------------------------------------------- read
async function view(r: Row, withEvents: boolean): Promise<DealView> {
  const [c, s] = await Promise.all([chainDeal(r.dealId), settings()])
  const state = c.state as DealState, funded = state !== DealState.None
  const amount = funded ? c.amount : r.amount
  const fee = funded ? c.fee : (r.amount * BigInt(s.feeBps)) / 10_000n
  const offer = offerOf(r)
  if (funded && r.status !== (isClosed(state) ? "closed" : "open")) void mark(r, { status: isClosed(state) ? "closed" : "open", payer: addr(c.payer), fundedAt: u64(c.fundedAt ?? BigInt(r.fundedAt ?? now())) })
  return {
    dealId: r.dealId, title: r.title, details: r.details, payee: r.payee, payer: funded ? getAddress(c.payer) : r.onlyPayer,
    amount: amount.toString(), fee: fee.toString(), total: (amount + fee).toString(),
    terms: { deliverWithin: r.deliverWithin, inspectFor: r.inspectFor, respondWithin: r.respondWithin, offerExpiry: r.offerExpiry },
    state, stateName: DealState[state] as keyof typeof DealState, deadline: funded && !isClosed(state) ? Number(c.deadline) : 0,
    onDeadline: onDeadline(state, c.offeredRefund > 0n), offeredRefund: c.offeredRefund.toString(), fundedAt: Number(c.fundedAt ?? r.fundedAt ?? 0), createdAt: r.createdAt, fundTx: r.fundTx,
    offer: { ...offer, amount: offer.amount.toString(), offerExpiry: offer.offerExpiry.toString() }, payeeSig: r.payeeSig, escrow: esc.address, arbiter: s.arbiter,
    events: withEvents && funded ? await listDealEvents(r.dealId, { payer: getAddress(c.payer), payee: getAddress(c.payee), arbiter: s.arbiter }) : [],
  }
}

/** One deal: the contract's state merged with the stored terms and the dispute thread. */
export async function getDeal(dealId: string): Promise<DealView | null> {
  if (!isId(dealId)) return null
  const id = dealId.toLowerCase() as Hex
  return cached(`deal:${id}`, 4_000, async () => { const r = await rowOf(id); return r ? view(r, true) : null }, (x) => !!x)
}

/** Deals where this wallet is the seller or the buyer, newest first. */
export async function listDeals(party: Address): Promise<DealView[]> {
  const a = addr(getAddress(party))
  return cached(`deals:${party.toLowerCase()}`, 8_000, async () => Promise.all((await rows(or(eq("payee", a), eq("payer", a)), 50)).map((r) => view(r, false))))
}

/** The dispute desk's queue: deals both sides couldn't settle, the one closest to its deadline first. */
export async function listEscalated(): Promise<DealView[]> {
  return cached("deals:desk", 8_000, async () => {
    const all = await Promise.all((await rows(eq("status", "open"), 100)).map((r) => view(r, false)))
    return all.filter((d) => d.state === DealState.Escalated).sort((x, y) => x.deadline - y.deadline)
  })
}

// ------------------------------------------------------------------- relay (gasless for both sides)
async function relay(payer: Address, functionName: string, args: readonly unknown[]) {
  await guardGas()
  const { pub } = wc()
  const relayer = wc().relayerFor(payer)
  let request
  try { ;({ request } = await pub.simulateContract({ account: relayer.account, ...esc, functionName: functionName as any, args: args as any })) }
  catch (err) { throw new PolicyError("simulation_failed", dealErr(shortErr(err))) }
  const txHash = await sendRobust(relayer, request as any)
  const receipt = await pub.waitForTransactionReceipt({ hash: txHash, timeout: 60_000 })
  if (receipt.status !== "success") throw new Error(`${functionName} reverted: ${txHash}`)
  return { txHash, explorer: `${config.explorer}/tx/${txHash}` }
}

/** The buyer signed an EIP-3009 authorization to the escrow for amount + fee with nonce == dealId. */
export async function relayFund(p: { dealId: string; auth: PayerAuth }) {
  if (!isId(p.dealId)) throw new DealError("bad_request", "Bad deal id")
  const r = await rowOf(p.dealId.toLowerCase() as Hex)
  if (!r) throw new DealError("not_found", "This deal doesn't exist")
  const t = now(), s = await settings()
  if (r.offerExpiry < t) throw new DealError("not_allowed", "This deal link expired. Ask the seller for a new one.")
  if (p.auth.validBefore > BigInt(t + 3_600)) throw new DealError("bad_request", "That approval is valid for too long. Approve again.")
  const total = r.amount + (r.amount * BigInt(s.feeBps)) / 10_000n
  const balance = (await wc().pub.readContract({ address: config.usdt, abi: ERC20_ABI, functionName: "balanceOf", args: [p.auth.from] })) as bigint
  if (balance < total) throw new DealError("not_allowed", "Not enough USDT in this wallet for the price plus the protection fee")
  await checkPolicy(p.auth.from, total)
  const out = await relay(p.auth.from, "fund", [offerOf(r), r.payeeSig, toAuthTuple(p.auth)])
  recordSpend(p.auth.from, total)
  await mark(r, { status: "open", payer: addr(p.auth.from), fundedAt: u64(BigInt(now())), fundTx: out.txHash })
  return { ...out, dealId: r.dealId }
}

/** The next action nonce for this signer (one sequence per wallet, across all its deals). */
export const actionNonce = async (signer: Address) => ((await wc().pub.readContract({ ...esc, functionName: "nonces", args: [signer] })) as bigint).toString()

const acts = new Map<string, number[]>() // signer -> action times (per instance)
/** Any party action (deliver, release, dispute, offer, accept, contest, escalate, cancel, rule), signed by that party. */
export async function relayAction(p: { action: Record<string, unknown>; sig: string }) {
  const a = p.action ?? {}
  if (!isId(a.dealId) || !isHex(p.sig)) throw new DealError("bad_request", "Malformed action")
  let action: Action
  try { action = { dealId: a.dealId, kind: Number(a.kind), amount: BigInt(String(a.amount ?? 0)), nonce: BigInt(String(a.nonce)), validBefore: BigInt(String(a.validBefore)) } }
  catch { throw new DealError("bad_request", "Malformed action") }
  if (!(action.kind in ActionKind)) throw new DealError("bad_request", "Unknown action")
  const c = await chainDeal(action.dealId)
  if (c.state === DealState.None) throw new DealError("not_found", "This deal isn't funded yet")
  const who = ACTION_SIGNER[action.kind as ActionKind]
  const signer = who === "payer" ? c.payer : who === "payee" ? c.payee : (await settings()).arbiter
  const k = signer.toLowerCase(), t = Date.now(), hits = (acts.get(k) ?? []).filter((x) => t - x < 60_000)
  if (hits.length >= 10) throw new DealError("rate_limited", "Too many actions. Wait a minute and try again.")
  const out = await relay(signer, "actWithSig", [action, p.sig])
  acts.set(k, [...hits, t])
  await syncStatus(action.dealId)
  return out
}

/** Anyone may enforce a deadline that has passed: the contract decides who gets the money. */
export async function relayPoke(dealId: string) {
  if (!isId(dealId)) throw new DealError("bad_request", "Bad deal id")
  const out = await relay(BURN, "poke", [dealId])
  await syncStatus(dealId as Hex)
  return out
}

async function syncStatus(dealId: Hex) {
  const id = dealId.toLowerCase() as Hex
  invalidate(`deal:${id}`)
  invalidate("deals:")
  const [r, c] = await Promise.all([rowOf(id), chainDeal(id)])
  if (r && isClosed(c.state as DealState) && r.status !== "closed") await mark(r, { status: "closed" })
}

/** Keeper (daily cron, and anyone can call it): enforce deadlines that passed on open deals, oldest first. */
export async function pokeDue(max = 15) {
  const a = arkiv()
  const page = await a.pub.select(FIELDS).from(Deal).ownedBy(a.owner).where(eq("status", "open") as never).limit(100).fetch()
  const open = (page.entities as any[]).map(toRow).sort((x, y) => (x.fundedAt ?? 0) - (y.fundedAt ?? 0))
  let poked = 0, closed = 0
  const errors: string[] = []
  for (const r of open) {
    const c = await chainDeal(r.dealId)
    const state = c.state as DealState
    if (isClosed(state)) { await mark(r, { status: "closed" }); closed++; continue }
    if (state === DealState.None || BigInt(now()) <= c.deadline || poked >= max) continue
    try { await relayPoke(r.dealId); poked++ } catch (e) { errors.push(`${r.dealId.slice(0, 10)}: ${(e as Error).message.split("\n")[0]}`) }
  }
  return { open: open.length, poked, closed, errors }
}

// ------------------------------------------------------------------- dispute thread
/** A party or the arbiter posts a signed message or proof link. Stored once, then owned by nobody. */
export async function postDealEvent(p: { dealId: string; actor: string; kind: string; text: string; evidence?: string; issuedAt: number; sig: string }) {
  if (!isId(p.dealId) || !isAddress(p.actor) || !isHex(p.sig)) throw new DealError("bad_request", "Malformed message")
  if (!["message", "evidence", "ruling_note"].includes(p.kind)) throw new DealError("bad_request", "Unknown message kind")
  const text = clean(String(p.text ?? "")), evidence = p.evidence ? String(p.evidence).trim() : undefined
  if (!text || text.length > DEAL_TEXT.message) throw new DealError("bad_request", `Write a message (up to ${DEAL_TEXT.message} characters)`)
  if (evidence && (!/^https:\/\/[^\s]{4,300}$/.test(evidence))) throw new DealError("bad_request", "The proof link must be an https:// link")
  if (!Number.isInteger(p.issuedAt) || Math.abs(now() - p.issuedAt) > 15 * 60) throw new DealError("bad_request", "That signature expired. Sign again.")
  const dealId = p.dealId.toLowerCase() as Hex, actor = getAddress(p.actor)
  const [c, s] = await Promise.all([chainDeal(dealId), settings()])
  if (c.state === DealState.None) throw new DealError("not_found", "This deal isn't funded yet")
  const role = actor === getAddress(c.payer) ? "payer" : actor === getAddress(c.payee) ? "payee" : actor === s.arbiter ? "arbiter" : null
  if (!role) throw new DealError("not_allowed", "Only the buyer, the seller or the dispute desk can post here")
  if ((p.kind === "ruling_note") !== (role === "arbiter")) throw new DealError("not_allowed", "Only the dispute desk writes ruling notes")
  const message = dealEventMessage({ dealId, actor, kind: p.kind, text, evidence, issuedAt: p.issuedAt })
  if (!(await wc().pub.verifyMessage({ address: actor, message, signature: p.sig as Hex }))) throw new DealError("bad_request", "The signature doesn't match this wallet")

  const a = arkiv()
  const { entityKey } = await (a.writer as any).createEntity(DealEvent, {
    dealId, actor: addr(actor), role, kind: p.kind, text, ...(evidence ? { evidence } : {}), at: u64(BigInt(now())), signedAt: u64(BigInt(p.issuedAt)), sig: hexToBytes(p.sig as Hex),
  }, { expiration: ExpirationTime.fromSeconds(180 * 86_400) }, { gas: 2_500_000n })
  await (a.writer as any).changeOwnership({ entityKey, newOwner: BURN }, { gas: 1_000_000n })
  invalidate(`deal:${dealId}`)
  return { key: entityKey as Hex }
}

/** The thread, oldest first. An entry is kept only if our writer created it AND the actor's signature checks out. */
export async function listDealEvents(dealId: Hex, parties: { payer: Address; payee: Address; arbiter: Address }): Promise<DealEventView[]> {
  const a = arkiv()
  const page = await a.pub.select({ $key: true, $creator: true, dealId: true, actor: true, role: true, kind: true, text: true, evidence: true, at: true, signedAt: true, sig: true })
    .from(DealEvent).createdBy(a.owner).where(eq("dealId", dealId.toLowerCase()) as never).limit(100).fetch()
  const out: DealEventView[] = []
  for (const e of page.entities as any[]) {
    try {
      const actor = getAddress(v(e.actor)), role = v(e.role) as DealEventView["role"]
      if (actor !== parties[role]) continue
      const message = dealEventMessage({ dealId, actor, kind: v(e.kind), text: v(e.text), evidence: v(e.evidence) || undefined, issuedAt: Number(v(e.signedAt)) })
      if (!(await wc().pub.verifyMessage({ address: actor, message, signature: hexOf(v(e.sig)) }))) continue
      out.push({ key: e.$key, actor, role, kind: v(e.kind), text: v(e.text), evidence: v(e.evidence) || undefined, at: Number(v(e.at)) })
    } catch {}
  }
  return out.sort((x, y) => x.at - y.at)
}

/** Contract errors in words a person can act on. */
function dealErr(name: string) {
  const M: Record<string, string> = {
    AlreadyFunded: "This deal was already paid for. Nothing more was charged.",
    OfferExpired: "This deal link expired. Ask the seller for a new one.",
    WrongPayer: "The seller made this deal for a different buyer.",
    SelfDeal: "You can't buy your own deal.",
    AmountTooLarge: "This deal is above the current limit for protected deals.",
    Paused: "New protected deals are paused right now.",
    BadNonce: "Another action of yours is still being processed. Try again in a moment.",
    ActionExpired: "That approval expired. Approve again.",
    WrongState: "That isn't possible at this stage of the deal.",
    DeadlinePassed: "The time for that has passed. Use “Enforce deadline” instead.",
    DeadlineNotPassed: "The deadline hasn't passed yet.",
    BadSplit: "The refund must be more than zero and less than the full price.",
    OfferAlreadyMade: "A partial refund was already offered. Only one offer is allowed.",
    BadSignature: "The signature doesn't match the person who must approve this.",
    BadPayeeSignature: "The seller's signature doesn't match this deal.",
  }
  return M[name] ?? name
}
