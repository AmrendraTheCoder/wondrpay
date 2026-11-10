"use client"
// My protected deals: selling, buying, and the ones waiting on me.
import "../deal.css"
import { useEffect, useState } from "react"
import { DealState } from "@whitepay/shared/escrow"
import { TopBar } from "../components"
import { LogoLoader, Icon } from "../ui"
import { getWallet } from "@/lib/wallet"
import { usdt } from "@/lib/format"
import { STATE_LABEL, timeLeft, myMove, nextStep, type DealView } from "@/lib/deals"

type Tab = "action" | "selling" | "buying" | "desk"

export default function Deals() {
  const [wallet, setWallet] = useState<ReturnType<typeof getWallet> | undefined>(undefined)
  const [deals, setDeals] = useState<DealView[] | null>(null)
  const [err, setErr] = useState("")
  // null = not chosen yet: open on the first tab that has something in it
  const [picked, setTab] = useState<Tab | null>(null)
  const [desk, setDesk] = useState<DealView[] | null>(null) // only for the dispute desk wallet
  useEffect(() => { if (new URLSearchParams(location.search).get("buying")) setTab("buying") }, [])

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
  const selling = (deals ?? []).filter((d) => d.payee.toLowerCase() === me)
  const buying = (deals ?? []).filter((d) => d.payer?.toLowerCase() === me && d.state !== DealState.None)
  const tab: Tab = picked ?? (action.length ? "action" : selling.length ? "selling" : buying.length ? "buying" : "action")
  const list = tab === "desk" ? (desk ?? []) : tab === "action" ? action : tab === "selling" ? selling : buying
  const now = Math.floor(Date.now() / 1000)

  return (
    <main className="shell with-nav">
      <TopBar back="/money" right={<a className="chip" href="/deal/new">New deal</a>} />
      <h1 className="deal-h1">Protected deals</h1>
      <div className="sub">For deals with people you don't know yet. The money is held until the buyer confirms.</div>
      <div className="seg">
        <button className={tab === "action" ? "on" : ""} onClick={() => setTab("action")}>Your move{action.length > 0 && <span className="seg-badge" style={{ marginLeft: 6 }}>{action.length}</span>}</button>
        <button className={tab === "selling" ? "on" : ""} onClick={() => setTab("selling")}>Selling</button>
        <button className={tab === "buying" ? "on" : ""} onClick={() => setTab("buying")}>Buying</button>
        {desk && <button className={tab === "desk" ? "on" : ""} onClick={() => setTab("desk")}>Desk{desk.length > 0 && <span className="seg-badge" style={{ marginLeft: 6 }}>{desk.length}</span>}</button>}
      </div>
      {err && <div className="deal-note bad" role="alert">{err}</div>}
      {!deals && !err && (
        <div className="list" aria-busy="true" aria-label="Loading your deals">
          {[0, 1, 2].map((i) => (
            <div key={i} className="deal-row"><span className="sub-ic skel" /><div className="grow"><span className="skel" style={{ display: "block", width: "60%", height: 16 }} /><span className="skel" style={{ display: "block", width: "40%", height: 13, marginTop: 6 }} /></div></div>
          ))}
        </div>
      )}
      {deals && list.length === 0 && tab === "action" && (
        <div className="card deal-empty">
          <span className="deal-empty-ic ok" aria-hidden>{Icon.check(26)}</span>
          <b>Nothing is waiting on you</b>
          <div className="sub">When a buyer pays, or something you bought is delivered, it shows up here with what to do next.</div>
          {deals.length === 0 && (
            <div className="deal-intro-go">
              <button className="btn btn-primary" onClick={() => setTab("selling")}>I'm selling</button>
              <button className="btn btn-ghost" onClick={() => setTab("buying")}>I'm buying</button>
            </div>
          )}
        </div>
      )}
      {deals && list.length === 0 && tab === "selling" && (
        <div className="card stack">
          <h2>Sell with protection</h2>
          <ol className="deal-how">
            <li><b>Create a link</b><span>Set the price and how long you need to deliver.</span></li>
            <li><b>The buyer pays into protection</b><span>The money is set aside for you before you start. Nobody can take it early.</span></li>
            <li><b>Deliver, and get paid</b><span>You're paid when they confirm, or automatically if they stay silent.</span></li>
          </ol>
          <a className="btn btn-primary" href="/deal/new">Create a protected deal</a>
        </div>
      )}
      {deals && list.length === 0 && tab === "buying" && (
        <div className="card stack">
          <h2>Buy with protection</h2>
          <ol className="deal-how">
            <li><b>Open the seller's link</b><span>Ask the seller for a WondrPay protected deal link. You'll see the price and the deadlines first.</span></li>
            <li><b>Pay protected</b><span>Your money is held safely. It doesn't go to the seller yet.</span></li>
            <li><b>Check it, then release</b><span>Not delivered in time? You're refunded automatically. Something wrong? Report it before the checking time ends.</span></li>
          </ol>
          <div className="sub center">Deals you pay for appear here.</div>
        </div>
      )}
      {deals && list.length === 0 && tab === "desk" && <div className="card stack center"><div className="sub">No disputes are waiting for a decision.</div></div>}
      <div className="list">
        {list.map((d) => {
          const label = STATE_LABEL[d.state]
          const mine = tab !== "desk" && myMove(d, me)
          return (
            <a key={d.dealId} className="deal-row" href={`/d/${d.dealId}`}>
              <span className={`sub-ic ${mine ? "todo" : ""}`}>{Icon.shield(24)}</span>
              <div className="grow">
                <b>{d.title}</b>
                <div className="sub">{mine
                  ? <span className="deal-todo">{nextStep(d, me)}{now <= d.deadline && ` · ${timeLeft(d.deadline - now)} left`}</span>
                  : <>{label.text}{d.deadline > 0 && (now > d.deadline ? " · deadline passed" : ` · ${timeLeft(d.deadline - now)} left`)}</>}</div>
              </div>
              <div className="right"><b>{usdt(d.amount)}</b><div className="sub">USDT</div></div>
            </a>
          )
        })}
      </div>
    </main>
  )
}
