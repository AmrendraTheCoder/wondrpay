"use client"
// Home screen, two states:
//  - a deal is waiting on this wallet: say which one and what to do next
//  - this wallet has never used a protected deal: say what it is for, by what the person wants to do
import { useEffect, useState } from "react"
import { myMove, nextStep, useDeals, introDismissed, dismissIntro } from "@/lib/deals"
import { Icon } from "./ui"

export function DealsBanner({ address, business }: { address?: string; business?: boolean }) {
  const deals = useDeals(address)
  const [hideIntro, setHideIntro] = useState(true)
  useEffect(() => setHideIntro(introDismissed()), [])
  if (!address || !deals) return null
  const me = address.toLowerCase()
  const todo = deals.filter((d) => myMove(d, me))

  if (todo.length) {
    const one = todo.length === 1 ? todo[0] : null
    return (
      <a className="due-card" href={one ? `/d/${one.dealId}` : "/deals"}>
        <span className="bell" aria-hidden>{Icon.shield(24)}</span>
        <div className="grow">
          <div className="strong">{one ? one.title : `${todo.length} protected deals need you`}</div>
          <div className="sub">{one ? nextStep(one, me) : "Open them to see what to do next."}</div>
        </div>
        <span className="due-pay">Open</span>
      </a>
    )
  }
  if (deals.length || hideIntro) return null
  return (
    <div className="card deal-intro">
      <button className="deal-intro-x" aria-label="Hide this" onClick={() => { dismissIntro(); setHideIntro(true) }}>{Icon.close(18)}</button>
      <div className="row" style={{ justifyContent: "flex-start", gap: 12 }}>
        <span className="ic">{Icon.shield(24)}</span>
        <div className="grow">
          <div className="strong">{business ? "Taking a custom order or a pre-order?" : "Dealing with someone you don't know?"}</div>
          <div className="sub">A protected deal holds the buyer's money until they confirm they got what they paid for. Nobody can run off with it.</div>
        </div>
      </div>
      <div className="deal-intro-go">
        <a className="btn btn-primary" href="/deal/new">I'm selling</a>
        <a className="btn btn-ghost" href="/deals?buying=1">I'm buying</a>
      </div>
    </div>
  )
}
