"use client"
// Split: two things people mean by "split".
//  - Send to many: one payment from you, shared out to several people in one transaction (salaries, a group).
//    You approve once; the approval covers the exact list of people and amounts.
//  - Ask friends: you paid for something and each friend owes you a share. Each gets a request they can pay
//    or decline. A request never moves money by itself.
import "../deal.css"
import "./split.css"
import { useEffect, useMemo, useState } from "react"
import { formatUnits, keccak256, parseUnits, toHex, type Address, type Hex } from "viem"
import type { PrivateKeyAccount } from "viem/accounts"
import { receiveAuthTypedData, LIMITS } from "@whitepay/shared"
import { SPLIT_ADDRESS, SPLIT_MAX_PEOPLE, ASK, splitNonce, equalShares, askGroupMessage, askActionMessage } from "@whitepay/shared/split"
import { TopBar, UnlockSheet } from "../components"
import { LogoLoader, Icon, Identicon, SuccessCheck, prettyName } from "../ui"
import { Processing } from "../processing"
import { PayeeSearch, type Payee } from "../send/search"
import { getWallet } from "@/lib/wallet"
import { short, when } from "@/lib/format"
import { playSound } from "@/lib/sound"
import { settle, SettleError } from "@/lib/settle"
import { friendlyError } from "@/lib/errors"
import { usdtExact } from "@/lib/deals"
import { useAsks, useNames, payAskHref, type AskView } from "@/lib/split"

type Mode = "send" | "ask"
type How = "total" | "each" | "custom"
const AMOUNT = /^\d+(\.\d{1,6})?$/
const micro = (s: string) => (AMOUNT.test(s) && Number(s) > 0 ? parseUnits(s, 6) : 0n)

export default function SplitPage() {
  const [wallet, setWallet] = useState<ReturnType<typeof getWallet> | undefined>(undefined)
  const [mode, setMode] = useState<Mode>("send")
  const [how, setHow] = useState<How>("total")
  const [people, setPeople] = useState<Payee[]>([])
  const [adding, setAdding] = useState(false)
  const [amount, setAmount] = useState("")
  const [custom, setCustom] = useState<Record<string, string>>({})
  const [includeMe, setIncludeMe] = useState(true)
  const [note, setNote] = useState("")
  const [unlock, setUnlock] = useState<null | "send" | "ask" | { ask: AskView; action: "decline" | "cancel" }>(null)
  const [phase, setPhase] = useState<"idle" | "signing" | "sending" | "done">("idle")
  const [done, setDone] = useState<{ title: string; sub: string; explorer?: string } | null>(null)
  const [err, setErr] = useState("")
  const [acting, setActing] = useState("") // the request being declined or cancelled (the form stays on screen)
  const { asks, reload } = useAsks(wallet?.address)

  useEffect(() => {
    setWallet(getWallet())
    if (new URLSearchParams(location.search).get("ask")) setMode("ask")
  }, [])

  const me = wallet?.address.toLowerCase() ?? ""
  const incoming = (asks ?? []).filter((a) => a.to.toLowerCase() === me && a.status === "open")
  const outgoing = (asks ?? []).filter((a) => a.from.toLowerCase() === me)
  const names = useNames([...incoming.map((a) => a.from), ...outgoing.map((a) => a.to)])
  const label = (a: string) => (names[a.toLowerCase()] ? prettyName(names[a.toLowerCase()]) : short(a))

  // each person's share, in base units, for the current mode
  const shares = useMemo(() => {
    const n = people.length
    if (!n) return [] as bigint[]
    if (mode === "ask") { const each = equalShares(micro(amount), n + (includeMe ? 1 : 0)); return each.slice(includeMe ? 1 : 0) } // any leftover millionth stays with you
    if (how === "total") return equalShares(micro(amount), n)
    if (how === "each") return people.map(() => micro(amount))
    return people.map((p) => micro(custom[p.address.toLowerCase()] ?? ""))
  }, [people, mode, how, amount, custom, includeMe])
  const total = shares.reduce((s, x) => s + x, 0n)
  const maxPeople = mode === "send" ? SPLIT_MAX_PEOPLE : ASK.maxPeople
  const overLimit = mode === "send" && total > LIMITS.dailyPerPayer
  const ready = people.length > 0 && shares.length === people.length && shares.every((x) => x > 0n) && !overLimit
  const missing = !people.length ? "Add at least one person." : !shares.every((x) => x > 0n) ? (how === "custom" && mode === "send" ? "Give every person an amount." : "Enter an amount.") : overLimit ? `Today's limit is ${usdtExact(LIMITS.dailyPerPayer)} USDT.` : ""

  if (wallet === undefined) return <main className="shell"><LogoLoader /></main>
  if (!wallet)
    return (
      <main className="shell">
        <TopBar />
        <div className="card stack"><h2>Set up WondrPay first</h2><a className="btn btn-primary" href="/app">Create wallet</a></div>
      </main>
    )

  const add = (p: Payee) => {
    setAdding(false)
    if (p.address.toLowerCase() === me) { setErr("That's your own wallet."); return }
    if (people.some((x) => x.address.toLowerCase() === p.address.toLowerCase())) { setErr("That person is already in the list."); return }
    setErr("")
    setPeople((l) => [...l, p])
  }
  const remove = (a: Address) => setPeople((l) => l.filter((x) => x.address !== a))
  const personName = (p: Payee) => p.displayName ?? (p.name ? prettyName(p.name) : short(p.address))
  const reset = () => { setPeople([]); setAmount(""); setCustom({}); setNote(""); setDone(null); setPhase("idle"); setErr("") }

  const run = async (account: PrivateKeyAccount) => {
    const what = unlock
    setUnlock(null)
    if (!what) return
    setErr("")
    if (typeof what === "object") setActing(what.ask.askId); else setPhase("signing")
    try {
      if (what === "send") {
        const to = people.map((p) => p.address), memo = keccak256(toHex(`split/${account.address}/${Date.now()}/${crypto.randomUUID()}`))
        const nonce = splitNonce(to, shares, memo) // covers every person and amount: the relayer can't change them
        const validBefore = BigInt(Math.floor(Date.now() / 1000) + 600)
        const signature = await account.signTypedData(receiveAuthTypedData({ from: account.address, to: SPLIT_ADDRESS, value: total, validAfter: 0n, validBefore, nonce }))
        setPhase("sending")
        const out = await settle("/api/split", { to, amounts: shares.map(String), memo, auth: { from: account.address, validAfter: "0", validBefore: validBefore.toString(), signature } }, { from: account.address, nonce })
        playSound("sent")
        setDone({ title: `Sent ${usdtExact(total)} USDT`, sub: `Shared between ${people.length} ${people.length === 1 ? "person" : "people"} in one payment. You paid no gas.`, explorer: out.explorer as string | undefined })
      } else if (what === "ask") {
        const groupId = keccak256(toHex(`ask/${account.address}/${Date.now()}/${crypto.randomUUID()}`))
        const items = people.map((p, i) => ({ to: p.address, amount: shares[i] })), issuedAt = Math.floor(Date.now() / 1000)
        const sig = await account.signMessage({ message: askGroupMessage({ from: account.address, groupId, items, note: note.trim(), issuedAt }) })
        setPhase("sending")
        const r = await fetch("/api/asks", { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ from: account.address, groupId, items: items.map((i) => ({ to: i.to, amount: i.amount.toString() })), note: note.trim(), issuedAt, sig }) })
        const out = await r.json()
        if (!r.ok) throw new Error(out.error ?? "Couldn't send the requests")
        playSound("sent")
        setDone({ title: `Asked ${people.length} ${people.length === 1 ? "person" : "people"}`, sub: `Each was asked for their share (${usdtExact(total)} USDT in all). They'll see it on their home screen and can pay or decline.` })
        void reload()
      } else {
        const issuedAt = Math.floor(Date.now() / 1000)
        const sig = await account.signMessage({ message: askActionMessage({ askId: what.ask.askId as Hex, actor: account.address, action: what.action, issuedAt }) })
        const r = await fetch("/api/asks/act", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ askId: what.ask.askId, actor: account.address, action: what.action, issuedAt, sig }) })
        const out = await r.json()
        if (!r.ok) throw new Error(out.error ?? "That didn't go through")
        await reload()
        return
      }
      setPhase("done")
    } catch (e) {
      const se = e as SettleError
      setErr(se.code === "unconfirmed" ? se.message : friendlyError(e, { action: what === "send" ? "sending" : "sending that" }))
      playSound("error")
      setPhase("idle")
    } finally { setActing("") }
  }

  if (phase === "done" && done)
    return (
      <main className="shell">
        <TopBar right={<a className="chip" href="/app">Home</a>} />
        <div className="card result">
          <SuccessCheck />
          <h1>{done.title}</h1>
          <div className="sub">{done.sub}</div>
          {done.explorer && <a className="chip" href={done.explorer} target="_blank" rel="noreferrer">View on Whitechain ↗</a>}
        </div>
        <button className="btn btn-primary" onClick={reset}>Done</button>
      </main>
    )

  if (adding)
    return (
      <main className="shell">
        <TopBar back={null} right={<button className="chip" onClick={() => setAdding(false)}>Cancel</button>} />
        <h1 className="ps-title">Add a person</h1>
        <PayeeSearch onPick={add} picker />
      </main>
    )

  const busy = phase === "signing" || phase === "sending"
  const locked = busy || !!acting
  return (
    <main className="shell">
      <TopBar right={<a className="chip" href="/app">Cancel</a>} />
      <h1 className="deal-h1">Split</h1>
      <div className="seg" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <button className={mode === "send" ? "on" : ""} onClick={() => { setMode("send"); setErr("") }}>Send to many</button>
        <button className={mode === "ask" ? "on" : ""} onClick={() => { setMode("ask"); setErr("") }}>Ask friends{incoming.length > 0 && <span className="seg-badge" style={{ marginLeft: 6 }}>{incoming.length}</span>}</button>
      </div>
      <div className="sub">{mode === "send"
        ? "Pay several people at once: salaries, a group, a team. One approval, one payment, each wallet gets its share."
        : "You paid for something? Ask each friend for their share. They can pay or decline; nothing moves until they pay."}</div>

      {mode === "ask" && incoming.length > 0 && (
        <div className="card stack">
          <h2>You were asked</h2>
          {incoming.map((a) => (
            <div key={a.askId} className="split-ask">
              <Identicon seed={a.from} name={names[a.from.toLowerCase()]} size={40} />
              <div className="grow"><b>{label(a.from)} asks for {usdtExact(a.amount)} USDT</b><div className="sub">{a.note ? `${a.note} · ` : ""}{when(a.createdAt)}</div></div>
              <div className="split-ask-go">
                <a className="btn btn-primary" href={payAskHref(a)}>Pay</a>
                <button className="btn btn-ghost" disabled={locked} onClick={() => setUnlock({ ask: a, action: "decline" })}>{acting === a.askId ? "Declining…" : "Decline"}</button>
              </div>
            </div>
          ))}
          <div className="sub">Only pay people you know. A request is just a message: WondrPay never takes money without your PIN.</div>
        </div>
      )}

      <div className="card stack">
        <div className="row"><h2 className="m-0">{mode === "send" ? "Who gets paid" : "Who owes you"}</h2><span className="sub">{people.length} of {maxPeople}</span></div>
        {people.length === 0 && <div className="sub">Nobody yet. Add people by name, WondrPay ID or address.</div>}
        {people.map((p, i) => (
          <div key={p.address} className="split-row">
            <Identicon seed={p.address} name={p.name} size={40} />
            <div className="grow"><b>{p.displayName || p.name ? personName(p) : "Unnamed wallet"}</b><div className="sub mono">{short(p.address)}</div></div>
            {mode === "send" && how === "custom"
              ? <input className="input split-amt" inputMode="decimal" placeholder="0.00" aria-label={`Amount for ${personName(p)}`} value={custom[p.address.toLowerCase()] ?? ""}
                  onChange={(e) => setCustom((c) => ({ ...c, [p.address.toLowerCase()]: e.target.value.replace(/[^\d.]/g, "") }))} />
              : <b className="split-share">{shares[i] > 0n ? usdtExact(shares[i]) : "–"}</b>}
            <button className="split-x" aria-label={`Remove ${personName(p)}`} onClick={() => remove(p.address)}>{Icon.close(18)}</button>
          </div>
        ))}
        {people.length < maxPeople && <button className="btn btn-ghost" onClick={() => { setErr(""); setAdding(true) }}>Add a person</button>}
      </div>

      <div className="card stack">
        {mode === "send" && (
          <div className="deal-chips">
            <button className={`chip ${how === "total" ? "on" : ""}`} onClick={() => setHow("total")}>Split a total equally</button>
            <button className={`chip ${how === "each" ? "on" : ""}`} onClick={() => setHow("each")}>Same amount each</button>
            <button className={`chip ${how === "custom" ? "on" : ""}`} onClick={() => setHow("custom")}>Different amounts</button>
          </div>
        )}
        {!(mode === "send" && how === "custom") && (
          <label className="deal-field">
            <span>{mode === "ask" ? "Total you paid (USDT)" : how === "total" ? "Total to split (USDT)" : "Amount for each person (USDT)"}</span>
            <input className="input" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
          </label>
        )}
        {mode === "ask" && (
          <>
            <label className="deal-terms"><input type="checkbox" checked={includeMe} onChange={(e) => setIncludeMe(e.target.checked)} /><span>Count me in the split (I pay a share too)</span></label>
            <label className="deal-field"><span>What was it for? (optional)</span>
              <input className="input" value={note} maxLength={ASK.note} placeholder="Dinner on Friday" onChange={(e) => setNote(e.target.value)} />
              <small className="sub">The people you ask will see this. Don't put private details in it.</small></label>
          </>
        )}
        {total > 0n && (
          <div className="kv">
            <div className="row"><span className="sub">{mode === "send" ? "You pay" : "You get back"}</span><b>{usdtExact(total)} USDT</b></div>
            {mode === "send" && <div className="sub">Network fee: 0. If any one wallet can't receive USDT, nothing is sent and you aren't charged.</div>}
          </div>
        )}
      </div>

      {err && <div className="deal-note bad" role="alert">{err}</div>}
      {busy ? (
        <Processing amount={`${usdtExact(total)} USDT`} title={mode === "send" ? `Paying ${people.length} people` : "Sending requests"} steps={["Approve on your device", mode === "send" ? "Sending on Whitechain" : "Sending", "Done"]} step={phase === "signing" ? 0 : 1} done={false} />
      ) : (
        <>
          <button className="btn btn-primary btn-big" disabled={!ready} onClick={() => setUnlock(mode)}>
            {mode === "send" ? `Pay ${people.length || ""} ${people.length === 1 ? "person" : "people"}`.replace("  ", " ") : `Ask ${people.length || ""} ${people.length === 1 ? "friend" : "friends"}`.replace("  ", " ")}
          </button>
          {missing && <div className="sub center">{missing}</div>}
        </>
      )}

      {mode === "ask" && outgoing.length > 0 && (
        <div className="card stack">
          <h2>Your requests</h2>
          {outgoing.slice(0, 20).map((a) => (
            <div key={a.askId} className="split-ask">
              <Identicon seed={a.to} name={names[a.to.toLowerCase()]} size={40} />
              <div className="grow"><b>{label(a.to)} · {usdtExact(a.amount)} USDT</b><div className="sub">{a.note ? `${a.note} · ` : ""}{when(a.createdAt)}</div></div>
              <span className={`badge badge-${a.status === "paid" ? "ok" : a.status === "open" ? "brand" : "warn"}`}>{acting === a.askId ? "Cancelling…" : a.status === "open" ? "Waiting" : a.status[0].toUpperCase() + a.status.slice(1)}</span>
              {a.status === "open" && <button className="split-x" aria-label="Cancel this request" disabled={locked} onClick={() => setUnlock({ ask: a, action: "cancel" })}>{Icon.close(18)}</button>}
            </div>
          ))}
        </div>
      )}

      {unlock && (
        <UnlockSheet
          title={unlock === "send" ? `Pay ${usdtExact(total)} USDT` : unlock === "ask" ? "Sign your request" : unlock.action === "decline" ? "Decline this request" : "Cancel this request"}
          subtitle={unlock === "send" ? `Shared between ${people.length} ${people.length === 1 ? "person" : "people"}. This can't be undone.` : unlock === "ask" ? `Ask ${people.length} ${people.length === 1 ? "person" : "people"} for ${usdtExact(total)} USDT in all` : `${usdtExact(unlock.ask.amount)} USDT${unlock.ask.note ? ` · ${unlock.ask.note}` : ""}`}
          payment={unlock === "send" ? { amountMicro: total } : undefined}
          onUnlocked={run} onCancel={() => setUnlock(null)} />
      )}
    </main>
  )
}
