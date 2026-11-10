"use client"
// Home screen: someone asked this wallet for money. Shows who and how much; paying still needs the PIN.
import { prettyName, Identicon } from "./ui"
import { short } from "@/lib/format"
import { usdtExact } from "@/lib/deals"
import { useAsks, useNames, payAskHref } from "@/lib/split"

export function AsksBanner({ address }: { address?: string }) {
  const { asks } = useAsks(address)
  const me = address?.toLowerCase() ?? ""
  const open = (asks ?? []).filter((a) => a.to.toLowerCase() === me && a.status === "open")
  const names = useNames(open.slice(0, 1).map((a) => a.from))
  if (!open.length) return null
  const a = open[0], name = names[a.from.toLowerCase()]
  return (
    <a className="due-card" href={open.length === 1 ? payAskHref(a) : "/split?ask=1"}>
      <span className="bell" aria-hidden><Identicon seed={a.from} name={name} size={36} /></span>
      <div className="grow">
        <div className="strong">{open.length === 1 ? `${name ? prettyName(name) : short(a.from)} asks you for ${usdtExact(a.amount)} USDT` : `${open.length} people asked you for money`}</div>
        <div className="sub">{open.length === 1 ? (a.note ?? "Pay only if you know them.") : "See who and what for."}</div>
      </div>
      <span className="due-pay">{open.length === 1 ? "Pay" : "Open"}</span>
    </a>
  )
}
