"use client"
// One protected deal, for the buyer, the seller and anyone with the link.
// Money and state come from the contract (through /api/deals/[id]); every button signs in this wallet and
// the relayer submits it, so neither side pays gas. The offer is re-checked here before the buyer pays:
// its hash must equal the deal id, and the payment is signed to the escrow address built into this app.
import "../../deal.css"
import { use, useCallback, useEffect, useState } from "react"
import { hashTypedData, parseUnits, verifyTypedData, zeroAddress, type Hex } from "viem"
import type { PrivateKeyAccount } from "viem/accounts"
import { EXPLORER_URL } from "@whitepay/shared"
import { ESCROW_ADDRESS, ActionKind, DealState, DEAL_TEXT, offerTypedData, actionTypedData, fundAuthTypedData, dealEventMessage, describeAction, splitPreview, isClosed, type Offer } from "@whitepay/shared/escrow"
import { TopBar, UnlockSheet } from "../../components"
import { LogoLoader, Icon, Identicon } from "../../ui"
import { Processing } from "../../processing"
import { getWallet } from "@/lib/wallet"
import { usdt, short, when } from "@/lib/format"
import { playSound } from "@/lib/sound"
import { settle, SettleError } from "@/lib/settle"
import { friendlyError } from "@/lib/errors"
import { usdtExact, autoSentence, days, timeLeft, STATE_LABEL, termsAccepted, acceptTerms, type DealView, type Role } from "@/lib/deals"

type Pending =
  | { type: "fund" }
  | { type: "act"; kind: ActionKind; amount?: bigint; danger?: boolean }
  | { type: "message"; text: string; evidence?: string; kind: "message" | "ruling_note" }

export default function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [wallet, setWallet] = useState<ReturnType<typeof getWallet> | undefined>(undefined)
  const [deal, setDeal] = useState<DealView | null | undefined>(undefined)
  const [loadErr, setLoadErr] = useState("")
  const [names, setNames] = useState<Record<string, string>>({})
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState<"" | "signing" | "sending">("")
  const [err, setErr] = useState("")
  const [note, setNote] = useState("")
  const [, tick] = useState(0)
  const [agree, setAgree] = useState(false)
  const [partial, setPartial] = useState("")
  const [showPartial, setShowPartial] = useState(false)
  const [msg, setMsg] = useState("")
  const [proof, setProof] = useState("")
  const [copied, setCopied] = useState(false)
  const [ruling, setRuling] = useState("")

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/deals/${id}`, { cache: "no-store" })
      const d = await r.json()
      if (r.status === 404) { setDeal(null); return }
      if (!r.ok) throw new Error(d.error)
      setDeal(d); setLoadErr("")
    } catch (e) { setLoadErr(friendlyError(e, { action: "loading this deal" })) }
  }, [id])

  useEffect(() => { setWallet(getWallet()); setAgree(termsAccepted()) }, [])
  useEffect(() => {
    void load()
    const t = setInterval(() => { if (document.visibilityState === "visible") void load() }, 8_000)
    const c = setInterval(() => tick((n) => n + 1), 30_000)
    return () => { clearInterval(t); clearInterval(c) }
  }, [load])
  useEffect(() => {
    if (!deal) return
    for (const a of [deal.payee, deal.payer].filter(Boolean) as string[])
      if (!(a in names)) fetch(`/api/resolve?q=${a}`).then((r) => (r.ok ? r.json() : null)).then((d) => setNames((n) => ({ ...n, [a]: d?.name ?? d?.displayName ?? "" }))).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal?.payee, deal?.payer])

  if (deal === undefined && !loadErr) return <main className="shell"><LogoLoader /></main>
  if (deal === null || (!deal && loadErr))
    return (
      <main className="shell">
        <TopBar />
        <div className="card result"><div className="icon bad" aria-hidden>{Icon.close(40)}</div><h1>{deal === null ? "Deal not found" : "Couldn't load"}</h1>
          <div className="sub">{deal === null ? "This link is wrong, or the deal expired before anyone paid." : loadErr}</div></div>
        <a className="btn btn-primary" href="/app">Home</a>
      </main>
    )
  if (!deal) return <main className="shell"><LogoLoader /></main>

  const me = wallet?.address.toLowerCase()
  const funded = deal.state !== DealState.None
  const role: Role = me === deal.payee.toLowerCase() ? "seller" : funded && me === deal.payer?.toLowerCase() ? "buyer" : funded && me === deal.arbiter.toLowerCase() ? "desk" : "visitor"
  const now = Math.floor(Date.now() / 1000)
  const overdue = funded && !isClosed(deal.state) && now > deal.deadline
  const offerExpired = !funded && now > deal.terms.offerExpiry
  const wrongBuyer = !funded && !!deal.payer && deal.payer !== zeroAddress && me !== deal.payer.toLowerCase()
  const nameOf = (a?: string) => (a ? names[a] || short(a) : "")
  const sellerName = nameOf(deal.payee), buyerName = nameOf(deal.payer)
  const label = STATE_LABEL[deal.state]
  const offered = BigInt(deal.offeredRefund)

  // the offer must hash to this deal id for the escrow built into the app, and carry the seller's signature
  const offer: Offer = { ...deal.offer, amount: BigInt(deal.offer.amount), offerExpiry: BigInt(deal.offer.offerExpiry) }
  const typed = offerTypedData(ESCROW_ADDRESS, offer)
  const offerOk = hashTypedData(typed as any).toLowerCase() === deal.dealId.toLowerCase() && deal.offer.payee.toLowerCase() === deal.payee.toLowerCase()

  const run = async (account: PrivateKeyAccount) => {
    const p = pending
    setPending(null)
    if (!p) return
    setErr(""); setNote(""); setBusy("signing")
    try {
      if (p.type === "fund") {
        if (!offerOk) throw new Error("This deal's details don't match its link. Don't pay; ask the seller for a new link.")
        // contract wallets sign differently; for them the contract's own check is the one that counts
        const sigOk = await verifyTypedData({ ...(typed as any), address: deal.payee, signature: deal.payeeSig }).catch(() => true)
        if (!sigOk) throw new Error("The seller's signature doesn't match this deal. Don't pay.")
        const total = BigInt(deal.total)
        const validBefore = BigInt(Math.floor(Date.now() / 1000) + 600)
        const signature = await account.signTypedData(fundAuthTypedData({ from: account.address, escrow: ESCROW_ADDRESS, total, dealId: deal.dealId, validAfter: 0n, validBefore }))
        setBusy("sending")
        await settle(`/api/deals/${deal.dealId}/fund`, { acceptedTerms: true, auth: { from: account.address, validAfter: "0", validBefore: validBefore.toString(), signature } }, { from: account.address, nonce: deal.dealId })
        acceptTerms()
        playSound("sent")
        setNote("Paid into protection. The seller has been asked to deliver.")
      } else if (p.type === "act") {
        const n = await fetch(`/api/deals/${deal.dealId}/act?signer=${account.address}`).then((r) => r.json())
        if (n.error) throw new Error(n.error)
        const action = { dealId: deal.dealId as Hex, kind: p.kind, amount: p.amount ?? 0n, nonce: BigInt(n.nonce), validBefore: BigInt(Math.floor(Date.now() / 1000) + 600) }
        const sig = await account.signTypedData(actionTypedData(ESCROW_ADDRESS, action))
        setBusy("sending")
        const r = await fetch(`/api/deals/${deal.dealId}/act`, { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: { ...action, amount: action.amount.toString(), nonce: action.nonce.toString(), validBefore: action.validBefore.toString() }, sig }) })
        const out = await r.json()
        if (!r.ok) throw new Error(out.error ?? "That didn't go through")
        playSound("sent")
        setShowPartial(false); setPartial(""); setRuling("")
        setNote("Done. It's recorded on Whitechain.")
      } else {
        const issuedAt = Math.floor(Date.now() / 1000)
        const sig = await account.signMessage({ message: dealEventMessage({ dealId: deal.dealId, actor: account.address, kind: p.kind, text: p.text, evidence: p.evidence, issuedAt }) })
        setBusy("sending")
        const r = await fetch(`/api/deals/${deal.dealId}/events`, { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ actor: account.address, kind: p.kind, text: p.text, evidence: p.evidence, issuedAt, sig }) })
        const out = await r.json()
        if (!r.ok) throw new Error(out.error ?? "Couldn't post the message")
        setMsg(""); setProof("")
      }
      await load()
    } catch (e) {
      const se = e as SettleError
      setErr(se.code === "unconfirmed" ? se.message : friendlyError(e, { action: p.type === "fund" ? "paying" : "sending that" }))
      playSound("error")
    } finally { setBusy("") }
  }

  const poke = async () => {
    setErr(""); setNote(""); setBusy("sending")
    try {
      const r = await fetch(`/api/deals/${deal.dealId}/poke`, { method: "POST" }), out = await r.json()
      if (!r.ok) throw new Error(out.error ?? "Couldn't enforce the deadline")
      setNote("Deadline enforced on Whitechain.")
      await load()
    } catch (e) { setErr(friendlyError(e, { action: "enforcing the deadline" })) } finally { setBusy("") }
  }

  const act = (kind: ActionKind, amount?: bigint) => setPending({ type: "act", kind, amount })
  const counterparty = role === "seller" ? buyerName || "the buyer" : sellerName
  const sheetText = (p: Pending) => {
    if (p.type === "fund") return { title: `Pay ${usdtExact(deal.total)} USDT into protection`, subtitle: `It's released to ${sellerName} only when you confirm, or if you don't report a problem in time.` }
    if (p.type === "message") return { title: "Sign your message", subtitle: "It's stored with your signature and can't be edited later." }
    return { title: "Confirm", subtitle: describeAction(p.kind, { amount: `${usdt(deal.amount)} USDT`, counterparty, refund: `${usdt(p.amount ?? offered)} USDT` }) }
  }
  const partialOk = /^\d+(\.\d{1,6})?$/.test(partial) && Number(partial) > 0 && parseUnits(partial, 6) < BigInt(deal.amount)
  const rulingOk = /^\d+(\.\d{1,6})?$/.test(ruling) && parseUnits(ruling, 6) <= BigInt(deal.amount)
  const rulingSplit = rulingOk ? splitPreview(BigInt(deal.amount), BigInt(deal.fee), parseUnits(ruling, 6)) : null
  const split = offered > 0n ? splitPreview(BigInt(deal.amount), BigInt(deal.fee), offered) : null
  const outcome = deal.state === DealState.Released ? `The seller received ${usdt(deal.amount)} USDT. Final.`
    : deal.state === DealState.Refunded ? `The buyer got ${usdtExact(deal.total)} USDT back, fee included. Final.`
    : "The amount was split between buyer and seller. Final."
  const canTalk = role !== "visitor" && (deal.state === DealState.Disputed || deal.state === DealState.Escalated || deal.events.length > 0)

  return (
    <main className="shell">
      <TopBar back="/deals" right={<a className="chip" href="/deals">My deals</a>} />

      <div className="card">
        <div className="deal-top">
          <span className={`badge badge-${label.tone}`}>{Icon.shield(14)} {label.text}</span>
          {role !== "visitor" && <span className="badge badge-brand">{role === "desk" ? "You're the dispute desk" : `You're the ${role}`}</span>}
        </div>
        <h1 className="deal-title">{deal.title}</h1>
        {deal.details && <p className="deal-details">{deal.details}</p>}
        <div className="deal-amount">{usdt(deal.amount)} <small>USDT</small></div>
        <div className="deal-party">
          <Identicon seed={deal.payee} name={names[deal.payee]} size={40} />
          <div><b>{names[deal.payee] || (role === "seller" ? "You" : "Seller")}</b><div className="sub">{names[deal.payee] ? "Seller · " : role === "seller" ? "Seller · " : ""}<span className="mono">{short(deal.payee)}</span></div></div>
        </div>
        {funded && deal.payer && (
          <div className="deal-party">
            <Identicon seed={deal.payer} name={names[deal.payer]} size={40} />
            <div><b>{names[deal.payer] || (role === "buyer" ? "You" : "Buyer")}</b><div className="sub">{names[deal.payer] ? "Buyer · " : role === "buyer" ? "Buyer · " : ""}<span className="mono">{short(deal.payer)}</span></div></div>
          </div>
        )}
      </div>

      {funded && !isClosed(deal.state) && (
        <div className={`deal-note ${overdue ? "warn" : ""}`}>
          {overdue
            ? <>The deadline passed. Anyone can enforce it now: {deal.onDeadline === "release" ? `the money goes to ${role === "seller" ? "you" : "the seller"}` : deal.onDeadline === "arbiter" ? "the dispute desk decides" : `the money goes back to ${role === "buyer" ? "you" : "the buyer"}`}.</>
            : autoSentence(deal, role, timeLeft(deal.deadline - now))}
        </div>
      )}
      {note && <div className="deal-note ok" role="status">{note}</div>}
      {err && <div className="deal-note bad" role="alert">{err}</div>}

      {busy ? (
        <Processing amount={`${usdt(deal.amount)} USDT`} title={deal.title} steps={["Approve on your device", "Sending on Whitechain", "Done"]} step={busy === "signing" ? 0 : 1} done={false} />
      ) : (
        <div className="stack">
          {/* not funded yet */}
          {!funded && offerExpired && <div className="deal-note bad">This deal link expired before anyone paid. Ask the seller for a new one.</div>}
          {!funded && !offerExpired && role === "seller" && (
            <>
              <div className="deal-note">Waiting for a buyer. Send them this page's link. It stays valid until {when(deal.terms.offerExpiry)}.</div>
              <button className="btn btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch {} }}>{copied ? "Copied" : "Copy deal link"}</button>
            </>
          )}
          {!funded && !offerExpired && role !== "seller" && (
            <>
              <div className="card kv">
                <div className="row"><span className="sub">Price</span><span>{usdt(deal.amount)} USDT</span></div>
                <div className="row"><span className="sub">Protection fee</span><span>{usdtExact(deal.fee)} USDT</span></div>
                <div className="row"><b>You pay</b><b>{usdtExact(deal.total)} USDT</b></div>
                <div className="sub">The fee is returned to you if the deal is refunded. You pay no network fee.</div>
              </div>
              <ul className="deal-rules">
                <li>The seller must deliver within <b>{days(deal.terms.deliverWithin)}</b>, or you're refunded automatically.</li>
                <li>After delivery you have <b>{days(deal.terms.inspectFor)}</b> to check it and report a problem.</li>
                <li>If you report a problem, the seller has <b>{days(deal.terms.respondWithin)}</b> to answer, or you're refunded.</li>
              </ul>
              {!offerOk && <div className="deal-note bad">This deal's details don't match its link. Don't pay.</div>}
              {wrongBuyer && <div className="deal-note bad">The seller made this deal for a different buyer.</div>}
              {!wallet ? <a className="btn btn-primary btn-big" href="/app">Set up WondrPay to pay</a> : (
                <>
                  <label className="deal-terms">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span>I agree to the <a href="/protected-terms" target="_blank">Protected Pay terms</a>.</span>
                  </label>
                  <button className="btn btn-primary btn-big" disabled={!offerOk || wrongBuyer || !agree} onClick={() => setPending({ type: "fund" })}>{Icon.shield(20)} Pay protected</button>
                </>
              )}
            </>
          )}

          {/* seller */}
          {role === "seller" && deal.state === DealState.Funded && !overdue && <button className="btn btn-primary btn-big" onClick={() => act(ActionKind.MarkDelivered)}>I've delivered it</button>}
          {role === "seller" && deal.state === DealState.Funded && <button className="btn btn-ghost" onClick={() => act(ActionKind.CancelBySeller)}>Cancel and refund the buyer</button>}
          {role === "seller" && deal.state === DealState.Disputed && !overdue && offered === 0n && !showPartial && <button className="btn btn-primary" onClick={() => setShowPartial(true)}>Offer a partial refund</button>}
          {role === "seller" && deal.state === DealState.Disputed && showPartial && (
            <div className="card stack">
              <label className="deal-field"><span>How much do you give back? (USDT, less than {usdt(deal.amount)})</span>
                <input className="input" inputMode="decimal" value={partial} placeholder="0.00" onChange={(e) => setPartial(e.target.value.replace(/[^\d.]/g, ""))} /></label>
              <div className="sub">You can make only one offer. If the buyer doesn't answer, the dispute desk decides.</div>
              <button className="btn btn-primary" disabled={!partialOk} onClick={() => act(ActionKind.OfferPartial, parseUnits(partial, 6))}>Send offer</button>
            </div>
          )}
          {role === "seller" && deal.state === DealState.Disputed && !overdue && <button className="btn btn-ghost" onClick={() => act(ActionKind.Contest)}>I disagree: send to the dispute desk</button>}
          {role === "seller" && (deal.state === DealState.Delivered || deal.state === DealState.Disputed || deal.state === DealState.Escalated) && <button className="btn btn-ghost" onClick={() => act(ActionKind.AgreeRefund)}>Refund the buyer in full</button>}

          {/* buyer */}
          {role === "buyer" && deal.state === DealState.Delivered && <button className="btn btn-primary btn-big" onClick={() => act(ActionKind.Release)}>I received it: release payment</button>}
          {role === "buyer" && deal.state === DealState.Delivered && !overdue && <button className="btn btn-ghost" onClick={() => act(ActionKind.OpenDispute)}>Something's wrong</button>}
          {role === "buyer" && deal.state === DealState.Disputed && split && (
            <div className="card kv">
              <div className="row"><b>The seller offers a partial refund</b></div>
              <div className="row"><span className="sub">You get back</span><b>{usdtExact(split.payerGets)} USDT</b></div>
              <div className="row"><span className="sub">Seller keeps</span><span>{usdtExact(split.payeeGets)} USDT</span></div>
              <button className="btn btn-primary" onClick={() => act(ActionKind.AcceptPartial)}>Accept and close</button>
              {!overdue && <button className="btn btn-ghost" onClick={() => act(ActionKind.Escalate)}>Reject: send to the dispute desk</button>}
            </div>
          )}
          {role === "buyer" && (deal.state === DealState.Funded || deal.state === DealState.Disputed || deal.state === DealState.Escalated) && (
            <button className="btn btn-ghost" onClick={() => act(ActionKind.Release)}>{deal.state === DealState.Funded ? "Release payment early" : "Drop the complaint and pay the seller"}</button>
          )}

          {/* dispute desk: it can only split the held price between the two sides, and only while the deal is escalated */}
          {role === "desk" && deal.state === DealState.Escalated && !overdue && (
            <div className="card stack">
              <h2>Decide this dispute</h2>
              <div className="sub">Read both sides below first. Post your reasons as a note, then decide. The decision is final.</div>
              <label className="deal-field"><span>How much of the {usdt(deal.amount)} USDT goes back to the buyer?</span>
                <input className="input" inputMode="decimal" value={ruling} placeholder="0.00" onChange={(e) => setRuling(e.target.value.replace(/[^\d.]/g, ""))} /></label>
              <div className="deal-chips">
                <button className="chip" onClick={() => setRuling("0")}>Seller is right</button>
                <button className="chip" onClick={() => setRuling((Number(deal.amount) / 2e6).toFixed(6).replace(/\.?0+$/, ""))}>Half each</button>
                <button className="chip" onClick={() => setRuling((Number(deal.amount) / 1e6).toString())}>Buyer is right</button>
              </div>
              {rulingSplit && (
                <div className="kv">
                  <div className="row"><span className="sub">Buyer gets</span><b>{usdt(rulingSplit.payerGets)} USDT</b></div>
                  <div className="row"><span className="sub">Seller gets</span><b>{usdt(rulingSplit.payeeGets)} USDT</b></div>
                  <div className="row"><span className="sub">Protection fee kept</span><span>{usdt(rulingSplit.treasuryGets)} USDT</span></div>
                </div>
              )}
              <button className="btn btn-primary" disabled={!rulingOk} onClick={() => act(ActionKind.Rule, parseUnits(ruling, 6))}>Decide</button>
            </div>
          )}

          {overdue && <button className="btn btn-primary" onClick={poke}>Enforce deadline</button>}
        </div>
      )}

      {/* timeline */}
      <div className="card">
        <h2>Progress</h2>
        <ol className="deal-steps">
          <Step done={funded} now={!funded} title="Buyer pays into protection" sub={funded ? when(deal.fundedAt) : "The money is held safely, not sent to the seller"} />
          <Step done={deal.state >= DealState.Delivered && deal.state !== DealState.Refunded} now={deal.state === DealState.Funded} title="Seller delivers" sub={deal.state === DealState.Funded ? `Due ${when(deal.deadline)}` : `Within ${days(deal.terms.deliverWithin)}`} />
          <Step done={isClosed(deal.state)} now={deal.state === DealState.Delivered} title="Buyer checks and confirms" sub={deal.state === DealState.Delivered ? `Until ${when(deal.deadline)}` : `${days(deal.terms.inspectFor)} to check`} />
          {(deal.state === DealState.Disputed || deal.state === DealState.Escalated) && <Step done={false} now title={deal.state === DealState.Disputed ? "Problem reported" : "Dispute desk is deciding"} sub={`Until ${when(deal.deadline)}`} />}
          {isClosed(deal.state) && <Step done now={false} title={label.text} sub={outcome} />}
        </ol>
        {deal.fundTx && <a className="chip deal-tx" href={`${EXPLORER_URL}/tx/${deal.fundTx}`} target="_blank" rel="noreferrer">View payment on Whitechain ↗</a>}
      </div>

      {/* dispute thread */}
      {(deal.events.length > 0 || canTalk) && (
        <div className="card stack">
          <h2>Messages and proof</h2>
          {deal.events.length === 0 && <div className="sub">No messages yet. Explain what happened and add a link to your proof. The dispute desk reads this.</div>}
          {deal.events.map((e) => (
            <div key={e.key} className={`deal-msg ${e.actor.toLowerCase() === me ? "mine" : ""}`}>
              <div className="row"><b>{e.role === "arbiter" ? "Dispute desk" : e.role === "payer" ? "Buyer" : "Seller"}</b><span className="sub">{when(e.at)}</span></div>
              <p>{e.text}</p>
              {e.evidence && <a href={e.evidence} target="_blank" rel="noreferrer nofollow">Proof link ↗</a>}
            </div>
          ))}
          {canTalk && !isClosed(deal.state) && !busy && (
            <>
              <textarea className="input deal-area" value={msg} maxLength={DEAL_TEXT.message} placeholder={role === "desk" ? "Write the reasons for your decision" : "Write what happened"} onChange={(e) => setMsg(e.target.value)} />
              <input className="input" value={proof} placeholder="Proof link (https://…, optional)" autoCapitalize="none" spellCheck={false} onChange={(e) => setProof(e.target.value)} />
              <div className="sub">Don't put private details here: messages are public and can't be deleted.</div>
              <button className="btn btn-ghost" disabled={!msg.trim() || (!!proof.trim() && !/^https:\/\/\S+$/.test(proof.trim()))} onClick={() => setPending({ type: "message", text: msg.trim(), evidence: proof.trim() || undefined, kind: role === "desk" ? "ruling_note" : "message" })}>Sign and post</button>
            </>
          )}
        </div>
      )}

      <div className="sub center">{isClosed(deal.state) ? "Was held" : "Held"} by the <a href={`${EXPLORER_URL}/address/${deal.escrow}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>protection contract</a> on Whitechain, not by WondrPay.</div>

      {pending && (
        <UnlockSheet {...sheetText(pending)} payment={pending.type === "fund" ? { amountMicro: BigInt(deal.total) } : undefined} onUnlocked={run} onCancel={() => setPending(null)} />
      )}
    </main>
  )
}

function Step({ done, now, title, sub }: { done: boolean; now: boolean; title: string; sub: string }) {
  return (
    <li className={done ? "done" : now ? "now" : ""}>
      <span className="dot" aria-hidden>{done ? Icon.check(14) : null}</span>
      <div><b>{title}</b><div className="sub">{sub}</div></div>
    </li>
  )
}
