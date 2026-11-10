"use client"
// My protected deals: selling, buying, and the ones waiting on me.
import "../deal.css"
import { useEffect, useState } from "react"
import { DealState, isClosed } from "@whitepay/shared/escrow"
import { TopBar } from "../components"
import { LogoLoader, Icon } from "../ui"
import { getWallet } from "@/lib/wallet"
import { usdt } from "@/lib/format"
import { STATE_LABEL, timeLeft, type DealView } from "@/lib/deals"

type Tab = "action" | "selling" | "buying" | "desk"

/** Is it this wallet's move? */
function myMove(d: DealView, me: string) {
  const seller = d.payee.toLowerCase() === me, buyer = d.payer?.toLowerCase() === me && d.state !== DealState.None
  if (isClosed(d.state) || d.state === DealState.None) return false
  if (Math.floor(Date.now() / 1000) > d.deadline) return true // anyone can enforce it
  if (seller) return d.state === DealState.Funded || (d.state === DealState.Disputed && d.offeredRefund === "0")
  if (buyer) return d.state === DealState.Delivered || (d.state === DealState.Disputed && d.offeredRefund !== "0")
  return false
}

export default function Deals() {
  const [wallet, setWallet] = useState<ReturnType<typeof getWallet> | undefined>(undefined)
  const [deals, setDeals] = useState<DealView[] | null>(null)
  const [err, setErr] = useState("")
  const [tab, setTab] = useState<Tab>("action")
  const [desk, setDesk] = useState<DealView[] | null>(null) // only for the dispute desk wallet

  useEffect(() => setWallet(getWallet()), [])
  useEffect(() => {
    if (!wallet) return
    fetch(`/api/deals?party=${wallet.address}`).then((r) => r.json()).then((d) => (d.error ? setErr(d.error) : setDeals(d.deals))).catch(() => setErr("Couldn't load your deals. Check your connection."))
    // the dispute desk wallet also sees the deals waiting for a decision
    fetch("/api/deals").then((r) => r.json()).then((s) => {
      if (s.arbiter?.toLowerCase() !== wallet.address.toLowerCase()) return
      return fetch("/api/deals?desk=1").then((r) => r.json()).then((d) => setDesk(d.deals ?? []))
    }).catch(() => {})
  }, [wallet])

  if (wallet === undefined) return <main className="shell"><LogoLoader /></main>
  if (!wallet)
    return (
      <main className="shell">
        <TopBar />
        <div className="card stack"><h2>Set up WondrPay first</h2><a className="btn btn-primary" href="/app">Create wallet</a></div>
      </main>
    )

  const me = wallet.address.toLowerCase()
  const action = (deals ?? []).filter((d) => myMove(d, me))
  const list = tab === "desk" ? (desk ?? []) : tab === "action" ? action : (deals ?? []).filter((d) => (tab === "selling" ? d.payee.toLowerCase() === me : d.payer?.toLowerCase() === me && d.state !== DealState.None))
  const now = Math.floor(Date.now() / 1000)

  return (
    <main className="shell">
      <TopBar right={<a className="chip" href="/deal/new">New deal</a>} />
      <h1 className="deal-h1">Protected deals</h1>
      <div className="seg">
        <button className={tab === "action" ? "on" : ""} onClick={() => setTab("action")}>Your move{action.length > 0 && <span className="seg-badge" style={{ marginLeft: 6 }}>{action.length}</span>}</button>
        <button className={tab === "selling" ? "on" : ""} onClick={() => setTab("selling")}>Selling</button>
        <button className={tab === "buying" ? "on" : ""} onClick={() => setTab("buying")}>Buying</button>
        {desk && <button className={tab === "desk" ? "on" : ""} onClick={() => setTab("desk")}>Desk{desk.length > 0 && <span className="seg-badge" style={{ marginLeft: 6 }}>{desk.length}</span>}</button>}
      </div>
      {err && <div className="deal-note bad" role="alert">{err}</div>}
      {!deals && !err && <LogoLoader />}
      {deals && list.length === 0 && (
        <div className="card stack center">
          <div className="sub">{tab === "desk" ? "No disputes are waiting for a decision." : tab === "action" ? "Nothing is waiting on you." : tab === "selling" ? "You haven't created a protected deal yet." : "You haven't paid for a protected deal yet."}</div>
          {tab !== "buying" && tab !== "desk" && <a className="btn btn-primary" href="/deal/new">Create a protected deal</a>}
        </div>
      )}
      <div className="list">
        {list.map((d) => {
          const label = STATE_LABEL[d.state]
          return (
            <a key={d.dealId} className="deal-row" href={`/d/${d.dealId}`}>
              <span className="sub-ic">{Icon.shield(24)}</span>
              <div className="grow">
                <b>{d.title}</b>
                <div className="sub">{label.text}{d.deadline > 0 && (now > d.deadline ? " · deadline passed" : ` · ${timeLeft(d.deadline - now)} left`)}</div>
              </div>
              <div className="right"><b>{usdt(d.amount)}</b><div className="sub">USDT</div></div>
            </a>
          )
        })}
      </div>
    </main>
  )
}
