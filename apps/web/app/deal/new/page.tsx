"use client"
// The seller creates a protected deal: fills in the terms, signs the offer once, gets a link to share.
// Nothing moves on-chain here. The signed offer becomes a deal only when a buyer pays into protection.
import "../../deal.css"
import { useEffect, useState } from "react"
import { isAddress, keccak256, parseUnits, toHex, zeroAddress, type Address } from "viem"
import type { PrivateKeyAccount } from "viem/accounts"
import { ESCROW_ADDRESS, DEAL_DEFAULTS, DEAL_TEXT, offerTypedData, dealFee, type Offer } from "@whitepay/shared/escrow"
import { TopBar, UnlockSheet } from "../../components"
import { LogoLoader, Icon } from "../../ui"
import { getWallet } from "@/lib/wallet"
import { usdt } from "@/lib/format"
import { friendlyError } from "@/lib/errors"
import { days, termsAccepted, acceptTerms } from "@/lib/deals"

const D = 86_400
const DELIVER = [1 * D, 3 * D, 7 * D, 14 * D]
const INSPECT = [1 * D, 3 * D, 7 * D]
type Settings = { feeBps: number; maxDealAmount: string; paused: boolean; blocked: boolean }

export default function NewDeal() {
  const [wallet, setWallet] = useState<ReturnType<typeof getWallet> | undefined>(undefined)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [details, setDetails] = useState("")
  const [deliverWithin, setDeliverWithin] = useState<number>(DEAL_DEFAULTS.deliverWithin)
  const [inspectFor, setInspectFor] = useState<number>(DEAL_DEFAULTS.inspectFor)
  const [buyer, setBuyer] = useState("")
  const [agree, setAgree] = useState(false)
  const [unlock, setUnlock] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [link, setLink] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => { setWallet(getWallet()); setAgree(termsAccepted()) }, [])
  useEffect(() => { fetch("/api/deals").then((r) => r.json()).then((s) => !s.error && setSettings(s)).catch(() => {}) }, [])

  if (wallet === undefined) return <main className="shell"><LogoLoader /></main>
  if (!wallet)
    return (
      <main className="shell">
        <TopBar />
        <div className="card stack"><h2>Set up WondrPay first</h2><a className="btn btn-primary" href="/app">Create wallet</a></div>
      </main>
    )

  const validPrice = /^\d+(\.\d{1,6})?$/.test(price) && Number(price) > 0
  const amount = validPrice ? parseUnits(price, 6) : 0n
  const overCap = !!settings && amount > BigInt(settings.maxDealAmount)
  const fee = settings ? dealFee(amount, settings.feeBps) : 0n
  const ready = title.trim().length > 0 && validPrice && !overCap && agree && !settings?.paused && !settings?.blocked

  const create = async (account: PrivateKeyAccount) => {
    setUnlock(false); setBusy(true); setErr("")
    try {
      let payer: Address = zeroAddress
      if (buyer.trim()) {
        if (isAddress(buyer.trim())) payer = buyer.trim() as Address
        else {
          const r = await fetch(`/api/resolve?q=${encodeURIComponent(buyer.trim())}`), d = await r.json()
          if (!r.ok || !isAddress(d.address)) throw new Error(`Couldn't find “${buyer.trim()}”. Leave it empty to let anyone with the link pay.`)
          payer = d.address
        }
        if (payer.toLowerCase() === account.address.toLowerCase()) throw new Error("That's your own wallet. Enter the buyer's name, or leave it empty.")
      }
      const offer: Offer = {
        payee: account.address, payer, amount, deliverWithin, inspectFor, respondWithin: DEAL_DEFAULTS.respondWithin,
        offerExpiry: BigInt(Math.floor(Date.now() / 1000) + DEAL_DEFAULTS.offerTtl),
        offerId: keccak256(toHex(`deal/${account.address}/${Date.now()}/${crypto.randomUUID()}`)),
      }
      // signed for the escrow address built into this app, never one the server suggests
      const payeeSig = await account.signTypedData(offerTypedData(ESCROW_ADDRESS, offer))
      const r = await fetch("/api/deals", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ offer: { ...offer, amount: offer.amount.toString(), offerExpiry: offer.offerExpiry.toString() }, payeeSig, title: title.trim(), details: details.trim(), acceptedTerms: true }),
      })
      const out = await r.json()
      if (!r.ok) throw new Error(out.error ?? "Couldn't create the deal")
      acceptTerms()
      setLink(`${location.origin}${out.path}`)
    } catch (e) {
      setErr(friendlyError(e, { action: "creating the deal" }))
    } finally { setBusy(false) }
  }

  if (link) {
    const text = `${title.trim()} for ${price} USDT, protected by WondrPay: your money is held safely until you confirm you received it.`
    return (
      <main className="shell">
        <TopBar right={<a className="chip" href="/deals">My deals</a>} />
        <div className="card result">
          <div className="icon ok" aria-hidden>{Icon.shield(44)}</div>
          <h1>Protected link ready</h1>
          <div className="sub">Send it to your buyer. When they pay, the money is held safely and you'll be asked to deliver within {days(deliverWithin)}.</div>
          <div className="deal-link mono">{link}</div>
        </div>
        <button className="btn btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch {} }}>
          {copied ? "Copied" : "Copy link"}
        </button>
        <div className="deal-share">
          <a className="btn btn-ghost" href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">Telegram</a>
          <a className="btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
        <a className="btn btn-ghost" href={link}>Open the deal</a>
      </main>
    )
  }

  return (
    <main className="shell">
      <TopBar right={<a className="chip" href="/deals">My deals</a>} />
      <h1 className="deal-h1">New protected deal</h1>
      <div className="sub">The buyer's money is held safely until they confirm they received it. You get paid automatically if they don't report a problem in time.</div>

      {settings?.blocked && <div className="deal-note bad">Protected deals aren't available in your country yet.</div>}
      {settings?.paused && <div className="deal-note bad">New protected deals are paused right now.</div>}

      <div className="card stack">
        <label className="deal-field">
          <span>What are you selling?</span>
          <input className="input" value={title} maxLength={DEAL_TEXT.title} placeholder="Logo design, 3 concepts" onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="deal-field">
          <span>Price (USDT)</span>
          <input className="input" inputMode="decimal" value={price} placeholder="0.00" onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} />
        </label>
        {overCap && settings && <div className="err">Protected deals are limited to {usdt(settings.maxDealAmount)} USDT for now.</div>}
        <label className="deal-field">
          <span>Details (optional)</span>
          <textarea className="input deal-area" value={details} maxLength={DEAL_TEXT.details} placeholder="What's included, condition, how you'll deliver" onChange={(e) => setDetails(e.target.value)} />
        </label>
        <div className="deal-field">
          <span>You'll deliver within</span>
          <div className="deal-chips">{DELIVER.map((s) => <button key={s} type="button" className={`chip ${deliverWithin === s ? "on" : ""}`} onClick={() => setDeliverWithin(s)}>{days(s)}</button>)}</div>
        </div>
        <div className="deal-field">
          <span>The buyer can check it for</span>
          <div className="deal-chips">{INSPECT.map((s) => <button key={s} type="button" className={`chip ${inspectFor === s ? "on" : ""}`} onClick={() => setInspectFor(s)}>{days(s)}</button>)}</div>
        </div>
        <label className="deal-field">
          <span>Only this buyer (optional)</span>
          <input className="input" value={buyer} placeholder="Name or address. Empty = anyone with the link" autoCapitalize="none" spellCheck={false} onChange={(e) => setBuyer(e.target.value)} />
        </label>
      </div>

      {validPrice && !overCap && (
        <div className="card kv">
          <div className="row"><span className="sub">You receive</span><b>{usdt(amount)} USDT</b></div>
          <div className="row"><span className="sub">Buyer pays</span><span>{usdt(amount + fee)} USDT</span></div>
          <div className="sub">The buyer pays a {settings ? settings.feeBps / 100 : 0.5}% protection fee on top. It's returned to them if the deal is refunded.</div>
        </div>
      )}

      <label className="deal-terms">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>I agree to the <a href="/protected-terms" target="_blank">Protected Pay terms</a>, including how deadlines and disputes are decided.</span>
      </label>
      <div className="err" role="alert">{err}</div>
      <button className="btn btn-primary btn-big" disabled={!ready || busy} onClick={() => setUnlock(true)}>{busy ? "Creating…" : "Create protected link"}</button>
      <div className="sub center">You're promising to deliver within {days(deliverWithin)}. If you don't, the buyer gets an automatic refund.</div>

      {unlock && <UnlockSheet title="Sign this offer" subtitle={`${title.trim()} for ${price} USDT, delivered within ${days(deliverWithin)}`} onUnlocked={create} onCancel={() => setUnlock(false)} />}
    </main>
  )
}
