// Protected Pay terms. DRAFT for the testnet: to be reviewed by a lawyer before any real-money launch.
import { TopBar } from "../components"

export const metadata = { title: "Protected Pay terms · WondrPay" }

const S: [string, string[]][] = [
  ["1. What Protected Pay is", [
    "A buyer's payment is held by a smart contract on Whitechain until the deal is finished. WondrPay does not hold the money and cannot move it.",
    "The seller's signed offer and the buyer's signed payment are the agreement. The contract follows the deadlines in that offer exactly.",
  ]],
  ["2. Deadlines decide when nobody acts", [
    "Seller doesn't deliver in time: the buyer is refunded in full, including the protection fee.",
    "Buyer doesn't report a problem in the checking period: the seller is paid.",
    "Seller doesn't answer a reported problem in time: the buyer is refunded in full.",
    "Buyer doesn't answer a partial refund offer in time: the dispute desk decides.",
    "The dispute desk doesn't decide within 7 days: the buyer is refunded in full.",
  ]],
  ["3. Disputes", [
    "Either side can end a dispute at any time: the buyer by releasing the payment, the seller by refunding in full.",
    "The seller may make one partial refund offer. The buyer may accept it or send the case to the dispute desk.",
    "The dispute desk reads only what both sides post on the deal page. It can split the held amount between buyer and seller and nothing else. Its decision is final and is carried out by the contract.",
    "Messages and proof links are public and cannot be deleted. Do not post private information.",
  ]],
  ["4. Fees and limits", [
    "The buyer pays a protection fee on top of the price (shown before paying, never more than 2%). It is charged only on the part the seller ends up with; the rest is returned to the buyer.",
    "There is a maximum amount per deal and a daily limit per wallet. WondrPay may pause new deals; deals already paid for always run to the end.",
  ]],
  ["5. What WondrPay does not do", [
    "It does not check goods or services, verify identities beyond what the page shows, convert to or from bank money, or give refunds from its own funds.",
    "It is not available where local law does not allow it. You are responsible for your own taxes and for following the law where you live.",
  ]],
  ["6. Risks", [
    "Smart contracts can have bugs. The stablecoin issuer can freeze addresses; a frozen payout stays claimable in the contract. Transactions cannot be reversed once final.",
  ]],
]

export default function Terms() {
  return (
    <main className="shell">
      <TopBar back="/deals" />
      <h1 style={{ margin: "4px 0 0", fontSize: 26, letterSpacing: "-0.02em" }}>Protected Pay terms</h1>
      <div className="sub">Draft for the Whitechain test network, where the money is test money. These terms will be reviewed by a lawyer before any real-money launch.</div>
      {S.map(([h, items]) => (
        <div className="card" key={h}>
          <h2>{h}</h2>
          <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, lineHeight: 1.5, fontSize: 14.5 }}>{items.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      ))}
      <div className="sub center">The full rulebook is published as WondrPay Rules v0.1.</div>
    </main>
  )
}
