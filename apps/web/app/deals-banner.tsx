"use client"
// Home screen: protected deals that are waiting on this wallet (deliver, confirm, answer, or enforce a deadline).
import { useEffect, useState } from "react"
import { myMove, nextStep, type DealView } from "@/lib/deals"
import { Icon } from "./ui"

export function DealsBanner({ address }: { address?: string }) {
  const [todo, setTodo] = useState<DealView[]>([])
  useEffect(() => {
    if (!address) return
    let off = false
    const me = address.toLowerCase()
    const load = () => fetch(`/api/deals?party=${address}`).then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d?.deals) setTodo((d.deals as DealView[]).filter((x) => myMove(x, me))) }).catch(() => {})
    void load()
    const t = setInterval(() => { if (document.visibilityState === "visible") void load() }, 30_000)
    return () => { off = true; clearInterval(t) }
  }, [address])
  if (!address || !todo.length) return null
  const one = todo.length === 1 ? todo[0] : null
  return (
    <a className="due-card" href={one ? `/d/${one.dealId}` : "/deals"}>
      <span className="bell" aria-hidden>{Icon.shield(24)}</span>
      <div className="grow">
        <div className="strong">{one ? one.title : `${todo.length} protected deals need you`}</div>
        <div className="sub">{one ? nextStep(one, address.toLowerCase()) : "Open them to see what to do next."}</div>
      </div>
      <span className="due-pay">Open</span>
    </a>
  )
}
