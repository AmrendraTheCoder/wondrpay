"use client"
// Client helpers for split payments and money requests.
import { useCallback, useEffect, useState } from "react"
import { formatUnits } from "viem"
import type { AskStatus } from "@whitepay/shared/split"

export type AskView = { askId: `0x${string}`; groupId: `0x${string}`; from: `0x${string}`; to: `0x${string}`; amount: string; note?: string; status: AskStatus; createdAt: number; expiresAt: number; paidTx?: string }

/** Requests to and from this wallet. null = still loading. `reload` after paying, declining or cancelling. */
export function useAsks(address?: string) {
  const [asks, setAsks] = useState<AskView[] | null>(null)
  const reload = useCallback(async () => {
    if (!address) return
    try { const r = await fetch(`/api/asks?party=${address}`, { cache: "no-store" }); const d = await r.json(); if (r.ok) setAsks(d.asks ?? []) } catch {}
  }, [address])
  useEffect(() => {
    void reload()
    const t = setInterval(() => { if (document.visibilityState === "visible") void reload() }, 30_000)
    return () => clearInterval(t)
  }, [reload])
  return { asks, reload }
}

// names for addresses, looked up once per page
const names = new Map<string, Promise<string>>()
export const lookupName = (address: string) => {
  const k = address.toLowerCase()
  if (!names.has(k)) names.set(k, fetch(`/api/resolve?q=${address}`).then((r) => (r.ok ? r.json() : null)).then((d) => (d?.name ?? d?.displayName ?? "") as string).catch(() => ""))
  return names.get(k)!
}
export function useNames(addresses: string[]) {
  const [map, setMap] = useState<Record<string, string>>({})
  const key = addresses.map((a) => a.toLowerCase()).sort().join(",")
  useEffect(() => {
    let off = false
    for (const a of addresses) void lookupName(a).then((n) => { if (!off && n) setMap((m) => (m[a.toLowerCase()] === n ? m : { ...m, [a.toLowerCase()]: n })) })
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return map
}

export const payAskHref = (a: AskView) => `/send?to=${a.from}&amount=${formatUnits(BigInt(a.amount), 6)}&ask=${a.askId}`
