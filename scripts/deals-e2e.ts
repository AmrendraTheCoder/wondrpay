// Protected Pay through the SERVER code path (packages/server/src/deals.ts), on Whitechain Sepolia + Arkiv:
// createDeal -> getDeal -> relayFund -> relayAction x2 -> postDealEvent -> listDeals -> pokeDue, plus rejections.
// CUSTOMER_PK and MERCHANT_PK are the buyer and seller (they only sign). The app's relayer pays the gas.
//
// Run:  node --import tsx --env-file=.env scripts/deals-e2e.ts [amountUSDT=0.2]
import { keccak256, parseUnits, toHex, zeroAddress, type Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { wc } from "../packages/server/src/index"
import { ERC20_ABI, USDT_ADDRESS } from "../packages/shared/src/index"
import { createDeal, getDeal, listDeals, relayFund, relayAction, relayPoke, pokeDue, postDealEvent, actionNonce, dealSettings } from "../packages/server/src/index"
import { ESCROW_ADDRESS, ActionKind, DealState, offerTypedData, actionTypedData, fundAuthTypedData, dealEventMessage } from "../packages/shared/src/escrow"

const amount = parseUnits(process.argv.find((a) => /^\d+(\.\d+)?$/.test(a)) ?? "0.2", 6)
// the two test wallets swap roles so the test can be re-run: whoever holds more test USDT buys
let buyer = privateKeyToAccount(process.env.CUSTOMER_PK as Hex)
let seller = privateKeyToAccount(process.env.MERCHANT_PK as Hex)
const now = () => Math.floor(Date.now() / 1000)
const ok = (s: string) => console.log(`  \x1b[32m✔\x1b[0m ${s}`)
const step = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m`)
let failed = 0
const check = (cond: boolean, s: string) => { if (cond) ok(s); else { failed++; console.log(`  \x1b[31m✘ ${s}\x1b[0m`) } }
const rejects = async (f: () => Promise<unknown>, s: string) => { try { await f(); check(false, `${s} (was NOT rejected)`) } catch (e) { ok(`${s}: "${(e as Error).message.split("\n")[0]}"`) } }

async function newOffer(tag: string, over: Record<string, unknown> = {}) {
  const offer = { payee: seller.address, payer: zeroAddress, amount, deliverWithin: 3 * 86_400, inspectFor: 86_400, respondWithin: 86_400,
    offerExpiry: BigInt(now() + 86_400), offerId: keccak256(toHex(`${tag}-${Date.now()}`)), ...over } as any
  const payeeSig = await seller.signTypedData(offerTypedData(ESCROW_ADDRESS, offer))
  return { offer: { ...offer, amount: offer.amount.toString(), offerExpiry: offer.offerExpiry.toString() }, payeeSig }
}
async function act(signer: typeof buyer, dealId: Hex, kind: ActionKind, amt = 0n) {
  const action = { dealId, kind, amount: amt, nonce: BigInt(await actionNonce(signer.address)), validBefore: BigInt(now() + 600) }
  const sig = await signer.signTypedData(actionTypedData(ESCROW_ADDRESS, action))
  return relayAction({ action: { ...action, amount: action.amount.toString(), nonce: action.nonce.toString(), validBefore: action.validBefore.toString() }, sig })
}

async function main() {
  const s = await dealSettings()
  const bal = (a: Hex) => wc().pub.readContract({ address: USDT_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf", args: [a] }) as Promise<bigint>
  const [b0, s0] = await Promise.all([bal(buyer.address), bal(seller.address)])
  if (s0 > b0) [buyer, seller] = [seller, buyer]
  if ((b0 > s0 ? b0 : s0) < amount * 3n) throw new Error("the buyer wallet needs more test USDT")
  step(`Escrow ${s.escrow} · fee ${s.feeBps} bps · cap ${Number(s.maxDealAmount) / 1e6} USDT`)

  step("Rejections before anything is stored")
  const bad = await newOffer("bad")
  await rejects(() => createDeal({ ...bad, payeeSig: bad.payeeSig.slice(0, -4) + "0000", title: "x" }), "tampered seller signature")
  await rejects(() => createDeal({ ...bad, offer: { ...bad.offer, amount: (BigInt(s.maxDealAmount) + 1n).toString() }, title: "x" }), "amount above the cap")
  await rejects(() => createDeal({ ...bad, title: "" }), "empty title")
  const shortCheck = await newOffer("t", { inspectFor: 3_600 })
  await rejects(() => createDeal({ ...shortCheck, title: "x" }), "checking period under 1 day")

  step("Create → fund → deliver → release")
  const a = await newOffer("A")
  const made = await createDeal({ ...a, title: "E2E deal <b>A</b>", details: "Created by scripts/deals-e2e.ts" })
  ok(`deal ${made.dealId}`)
  let d = (await getDeal(made.dealId))!
  check(d.state === DealState.None && d.title === "E2E deal A", `stored, HTML stripped from the title, state ${d.stateName}`)
  check(BigInt(d.total) === amount + (amount * BigInt(s.feeBps)) / 10_000n, `buyer total ${Number(d.total) / 1e6} USDT`)

  const sign = async (dealId: Hex, total: bigint, validFor = 600) => {
    const validBefore = BigInt(now() + validFor)
    const signature = await buyer.signTypedData(fundAuthTypedData({ from: buyer.address, escrow: ESCROW_ADDRESS, total, dealId, validAfter: 0n, validBefore }))
    return { from: buyer.address, validAfter: 0n, validBefore, signature }
  }
  await rejects(async () => relayFund({ dealId: made.dealId, auth: await sign(made.dealId, BigInt(d.total), 7_200) }), "approval valid for more than 1 hour")
  await rejects(async () => relayFund({ dealId: made.dealId, auth: await sign(made.dealId, BigInt(d.total) - 1n) }), "approval for the wrong amount")
  const f = await relayFund({ dealId: made.dealId, auth: await sign(made.dealId, BigInt(d.total)) })
  ok(`funded ${f.explorer}`)
  await rejects(async () => relayFund({ dealId: made.dealId, auth: await sign(made.dealId, BigInt(d.total)) }), "funding the same deal twice")
  await rejects(() => act(buyer, made.dealId, ActionKind.OpenDispute), "dispute before delivery")
  await rejects(() => relayPoke(made.dealId), "enforcing a deadline that hasn't passed")
  await act(seller, made.dealId, ActionKind.MarkDelivered); ok("seller marked delivered")
  await act(buyer, made.dealId, ActionKind.Release); ok("buyer released")
  d = (await getDeal(made.dealId))!
  check(d.state === DealState.Released, `deal A is ${d.stateName}`)

  step("Create → fund → deliver → dispute → signed messages → 50% offer → accept")
  const b = await newOffer("B")
  const madeB = await createDeal({ ...b, title: "E2E deal B" })
  d = (await getDeal(madeB.dealId))!
  await relayFund({ dealId: madeB.dealId, auth: await sign(madeB.dealId, BigInt(d.total)) }); ok("funded")
  await act(seller, madeB.dealId, ActionKind.MarkDelivered)
  await act(buyer, madeB.dealId, ActionKind.OpenDispute); ok("dispute opened")
  const post = async (who: typeof buyer, text: string, actor = who.address) => {
    const issuedAt = now()
    const sig = await who.signMessage({ message: dealEventMessage({ dealId: madeB.dealId, actor, kind: "message", text, issuedAt }) })
    return postDealEvent({ dealId: madeB.dealId, actor, kind: "message", text, issuedAt, sig })
  }
  await post(buyer, "Half of it is missing."); ok("buyer posted a signed message")
  await rejects(() => post(seller, "forged", buyer.address), "message signed by the wrong wallet")
  await act(seller, madeB.dealId, ActionKind.OfferPartial, amount / 2n); ok("seller offered 50% back")
  await rejects(() => act(seller, madeB.dealId, ActionKind.OfferPartial, amount / 4n), "second partial offer")
  await act(buyer, madeB.dealId, ActionKind.AcceptPartial); ok("buyer accepted")
  d = (await getDeal(madeB.dealId))!
  check(d.state === DealState.Settled, `deal B is ${d.stateName}`)
  check(d.events.length === 1 && d.events[0].role === "payer", `thread has ${d.events.length} verified message`)

  step("Lists and keeper")
  const mine = await listDeals(seller.address)
  check(mine.some((x) => x.dealId === made.dealId) && mine.some((x) => x.dealId === madeB.dealId), `seller's list has both deals (${mine.length} total)`)
  const bought = await listDeals(buyer.address)
  check(bought.some((x) => x.dealId === madeB.dealId), `buyer's list has deal B (${bought.length} total)`)
  const k = await pokeDue()
  ok(`keeper: ${k.open} open, ${k.poked} enforced, ${k.closed} marked closed, ${k.errors.length} errors`)

  console.log(failed ? `\n\x1b[31m${failed} check(s) failed\x1b[0m` : "\n\x1b[32mAll checks passed\x1b[0m")
  process.exit(failed ? 1 : 0)
}
main().catch((e) => { console.error("\n✘", e.shortMessage ?? e.message); process.exit(1) })
