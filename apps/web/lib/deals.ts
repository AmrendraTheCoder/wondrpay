"use client"
// Client helpers for protected deals: the shapes the API returns and plain-language wording.
import { useEffect, useState } from "react"
import { DealState, isClosed } from "@whitepay/shared/escrow"

export type DealEventView = { key: string; actor: string; role: "payer" | "payee" | "arbiter"; kind: string; text: string; evidence?: string; at: number }
export type DealView = {
  dealId: `0x${string}`; title: string; details?: string; payee: `0x${string}`; payer?: `0x${string}`
  amount: string; fee: string; total: string
  terms: { deliverWithin: number; inspectFor: number; respondWithin: number; offerExpiry: number }
  state: DealState; stateName: string; deadline: number; onDeadline: "refund" | "release" | "arbiter" | null
  offeredRefund: string; fundedAt: number; createdAt: number; fundTx?: string
  offer: { payee: `0x${string}`; payer: `0x${string}`; amount: string; deliverWithin: number; inspectFor: number; respondWithin: number; offerExpiry: string; offerId: `0x${string}` }
  payeeSig: `0x${string}`; escrow: `0x${string}`; arbiter: `0x${string}`; events: DealEventView[]
}
export type Role = "seller" | "buyer" | "desk" | "visitor"

export const days = (s: number) => {
  const d = s / 86_400
  return d >= 1 ? `${Number.isInteger(d) ? d : d.toFixed(1)} day${d === 1 ? "" : "s"}` : `${Math.round(s / 3_600)} hour${Math.round(s / 3_600) === 1 ? "" : "s"}`
}
export const timeLeft = (secs: number) => {
  if (secs <= 0) return "0m"
  const d = Math.floor(secs / 86_400), h = Math.floor((secs % 86_400) / 3_600), m = Math.floor((secs % 3_600) / 60)
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`
}

export const STATE_LABEL: Record<number, { text: string; tone: "ok" | "warn" | "bad" | "brand" }> = {
  [DealState.None]: { text: "Waiting for a buyer", tone: "brand" },
  [DealState.Funded]: { text: "Paid, waiting for delivery", tone: "brand" },
  [DealState.Delivered]: { text: "Delivered, buyer is checking", tone: "brand" },
  [DealState.Disputed]: { text: "Problem reported", tone: "warn" },
  [DealState.Escalated]: { text: "With the dispute desk", tone: "warn" },
  [DealState.Released]: { text: "Done, seller was paid", tone: "ok" },
  [DealState.Refunded]: { text: "Refunded to the buyer", tone: "bad" },
  [DealState.Settled]: { text: "Settled with a split", tone: "ok" },
}

/** One sentence: what happens by itself if nobody does anything, from this viewer's side. */
export function autoSentence(d: DealView, role: Role, left: string) {
  const you = (who: "buyer" | "seller") => (role === who ? "you" : `the ${who}`)
  if (d.onDeadline === "refund" && d.state === DealState.Funded) return `If ${you("seller")} ${role === "seller" ? "don't" : "doesn't"} deliver in ${left}, the money goes back to ${you("buyer")}.`
  if (d.onDeadline === "release") return `If ${you("buyer")} ${role === "buyer" ? "don't" : "doesn't"} report a problem in ${left}, the money goes to ${you("seller")}.`
  if (d.onDeadline === "refund" && d.state === DealState.Disputed) return `If ${you("seller")} ${role === "seller" ? "don't" : "doesn't"} answer in ${left}, the money goes back to ${you("buyer")}.`
  if (d.onDeadline === "arbiter") return `If ${you("buyer")} ${role === "buyer" ? "don't" : "doesn't"} answer the offer in ${left}, the dispute desk decides.`
  if (d.onDeadline === "refund" && d.state === DealState.Escalated) return `The dispute desk decides within ${left}. If it doesn't, the money goes back to ${you("buyer")}.`
  return ""
}

const TERMS_KEY = "whitepay.deal-terms.v1"
export const termsAccepted = () => { try { return localStorage.getItem(TERMS_KEY) === "1" } catch { return false } }
export const acceptTerms = () => { try { localStorage.setItem(TERMS_KEY, "1") } catch {} }

/** Is it this wallet's move on this deal? (also true once a deadline passed: anyone can enforce it) */
export function myMove(d: DealView, me: string) {
  const seller = d.payee.toLowerCase() === me, buyer = d.payer?.toLowerCase() === me && d.state !== DealState.None
  if (isClosed(d.state) || d.state === DealState.None || (!seller && !buyer)) return false
  if (Math.floor(Date.now() / 1000) > d.deadline) return true
  if (seller) return d.state === DealState.Funded || (d.state === DealState.Disputed && d.offeredRefund === "0")
  return d.state === DealState.Delivered || (d.state === DealState.Disputed && d.offeredRefund !== "0")
}

/** What this wallet should do next, in a few words (for lists and the home banner). */
export function nextStep(d: DealView, me: string) {
  const seller = d.payee.toLowerCase() === me
  if (Math.floor(Date.now() / 1000) > d.deadline) return "Deadline passed: enforce it"
  if (seller) return d.state === DealState.Funded ? "Deliver, then mark it delivered" : "Answer the buyer's complaint"
  return d.state === DealState.Delivered ? "Check it and release the payment" : "Answer the seller's offer"
}

/** Exact USDT for money a person is about to pay or receive: at least 2 decimals, never rounded away
 *  (the shared `usdt` cuts to 2 decimals, which would show 25.125 as 25.12). */
export function usdtExact(v: string | bigint) {
  const n = BigInt(v), whole = n / 1_000_000n
  const frac = (n % 1_000_000n).toString().padStart(6, "0").replace(/0{1,4}$/, "")
  return `${whole.toLocaleString("en-IN")}.${frac}`
}

// one request per wallet, shared by everything on the page that shows deals (banner, Money card, menu badge)
const inflight = new Map<string, { at: number; p: Promise<DealView[] | null> }>()
function fetchDeals(address: string) {
  const k = address.toLowerCase(), hit = inflight.get(k)
  if (hit && Date.now() - hit.at < 10_000) return hit.p
  const p = fetch(`/api/deals?party=${address}`).then((r) => (r.ok ? r.json() : null)).then((d) => (d?.deals as DealView[]) ?? null).catch(() => null)
  inflight.set(k, { at: Date.now(), p })
  return p
}

/** This wallet's protected deals, refreshed every 30 s while the tab is visible. null = still loading / unavailable. */
export function useDeals(address?: string) {
  const [deals, setDeals] = useState<DealView[] | null>(null)
  useEffect(() => {
    if (!address) return
    let off = false
    const load = () => fetchDeals(address).then((d) => { if (!off && d) setDeals(d) })
    void load()
    const t = setInterval(() => { if (document.visibilityState === "visible") void load() }, 30_000)
    return () => { off = true; clearInterval(t) }
  }, [address])
  return deals
}

/** Money this wallet has tied up in open deals: what it paid in as a buyer, and what is on its way as a seller. */
export function inProtection(deals: DealView[], me: string) {
  let paid = 0n, coming = 0n, open = 0
  for (const d of deals) {
    if (d.state === DealState.None || isClosed(d.state)) continue
    open++
    if (d.payer?.toLowerCase() === me) paid += BigInt(d.total)
    else if (d.payee.toLowerCase() === me) coming += BigInt(d.amount)
  }
  return { paid, coming, open }
}

const INTRO_KEY = "whitepay.deal-intro.v1"
export const introDismissed = () => { try { return localStorage.getItem(INTRO_KEY) === "1" } catch { return false } }
export const dismissIntro = () => { try { localStorage.setItem(INTRO_KEY, "1") } catch {} }
