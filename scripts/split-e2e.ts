// Split payments and money requests through the SERVER code path, on Whitechain Sepolia + Arkiv.
//   1) split pay-out: one signature, three recipients, one transaction (and the ways it must be refused)
//   2) money request: ask -> the person asked pays it -> marked paid; decline; cancel; limits
// CUSTOMER_PK and MERCHANT_PK are the two test wallets (whoever holds more test USDT pays).
//
// Run:  node --import tsx --env-file=.env scripts/split-e2e.ts [amountUSDT=0.03]
import { keccak256, parseUnits, toHex, type Hex, type Address } from "viem"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"
import { wc, relaySplit, relayDirectPayment, createAsks, listAsks, actOnAsk, markAskPaid } from "../packages/server/src/index"
import { ERC20_ABI, USDT_ADDRESS, ROUTER_ADDRESS, directNonce, receiveAuthTypedData } from "../packages/shared/src/index"
import { SPLIT_ABI, SPLIT_ADDRESS, splitNonce, equalShares, askId, askGroupMessage, askActionMessage } from "../packages/shared/src/split"

const each = parseUnits(process.argv.find((a) => /^\d+(\.\d+)?$/.test(a)) ?? "0.03", 6)
let payer = privateKeyToAccount(process.env.CUSTOMER_PK as Hex)
let friend = privateKeyToAccount(process.env.MERCHANT_PK as Hex)
const now = () => Math.floor(Date.now() / 1000)
const ok = (s: string) => console.log(`  \x1b[32m✔\x1b[0m ${s}`)
const step = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m`)
let failed = 0
const check = (cond: boolean, s: string) => { if (cond) ok(s); else { failed++; console.log(`  \x1b[31m✘ ${s}\x1b[0m`) } }
const rejects = async (f: () => Promise<unknown>, s: string) => { try { await f(); check(false, `${s} (was NOT rejected)`) } catch (e) { ok(`${s}: "${(e as Error).message.split("\n")[0]}"`) } }
const bal = (a: Address) => wc().pub.readContract({ address: USDT_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf", args: [a] }) as Promise<bigint>
const fresh = () => privateKeyToAccount(generatePrivateKey()).address

async function main() {
  const [b0, f0] = await Promise.all([bal(payer.address), bal(friend.address)])
  if (f0 > b0) [payer, friend] = [friend, payer]
  if ((b0 > f0 ? b0 : f0) < each * 6n) throw new Error("the paying wallet needs more test USDT")

  step(`1) Split pay-out · contract ${SPLIT_ADDRESS}`)
  check(equalShares(100n, 3).join() === "34,33,33" && equalShares(10n, 5).every((x) => x === 2n), "equal shares add up exactly (100 into 3 = 34 + 33 + 33)")
  const to = [friend.address, fresh(), fresh()]
  const amounts = equalShares(each * 3n + 1n, 3) // an uneven total on purpose
  const memo = keccak256(toHex(`split-e2e-${Date.now()}`))
  const nonce = splitNonce(to, amounts, memo)
  const onchain = await wc().pub.readContract({ address: SPLIT_ADDRESS, abi: SPLIT_ABI, functionName: "splitNonce", args: [to, amounts, memo] })
  check(nonce === onchain, "the app's split id matches the contract's")
  const total = amounts.reduce((s, x) => s + x, 0n)
  const sign = async (value: bigint, n: Hex, validFor = 600) => {
    const validBefore = BigInt(now() + validFor)
    const signature = await payer.signTypedData(receiveAuthTypedData({ from: payer.address, to: SPLIT_ADDRESS, value, validAfter: 0n, validBefore, nonce: n }))
    return { from: payer.address, validAfter: 0n, validBefore, signature }
  }
  const body = (t = to, a = amounts) => ({ to: t, amounts: a.map(String), memo })
  await rejects(async () => relaySplit({ ...body([to[0], to[0], to[2]]), auth: await sign(total, nonce) }), "the same person twice")
  await rejects(async () => relaySplit({ ...body([payer.address, to[1], to[2]]), auth: await sign(total, nonce) }), "paying yourself")
  await rejects(async () => relaySplit({ ...body([to[0], to[1], fresh()]), auth: await sign(total, nonce) }), "a recipient swapped after signing")
  await rejects(async () => relaySplit({ ...body(to, [amounts[1], amounts[0], amounts[2]]), auth: await sign(total, nonce) }), "shares changed after signing (same total)")
  await rejects(async () => relaySplit({ ...body(), auth: await sign(total, nonce, 7_200) }), "approval valid for more than 1 hour")

  const before = await Promise.all([bal(payer.address), ...to.map(bal)])
  const paid = await relaySplit({ ...body(), auth: await sign(total, nonce) })
  ok(`paid 3 people in one transaction (gas ${paid.gasUsed}) ${paid.explorer}`)
  const after = await Promise.all([bal(payer.address), ...to.map(bal)])
  check(after[0] === before[0] - total, `payer paid exactly the total (${Number(total) / 1e6} USDT)`)
  check(to.every((_, i) => after[i + 1] === before[i + 1] + amounts[i]), "each person received exactly their share")
  check((await bal(SPLIT_ADDRESS)) === 0n, "the contract kept nothing")
  await rejects(async () => relaySplit({ ...body(), auth: await sign(total, nonce) }), "the same split a second time")

  step("2) Money requests (friends owe me)")
  // `friend` is owed; `payer` and one stranger are asked
  const stranger = privateKeyToAccount(generatePrivateKey())
  const groupId = keccak256(toHex(`ask-e2e-${Date.now()}`))
  const items = [{ to: payer.address, amount: each }, { to: stranger.address, amount: each }]
  const issuedAt = now()
  const sig = await friend.signMessage({ message: askGroupMessage({ from: friend.address, groupId, items, note: "Dinner", issuedAt }) })
  const wire = { from: friend.address, groupId, items: items.map((i) => ({ to: i.to, amount: i.amount.toString() })), note: "Dinner", issuedAt, sig }
  await rejects(() => createAsks({ ...wire, items: [{ to: payer.address, amount: (each * 2n).toString() }, wire.items[1]] }), "amounts changed after signing")
  await rejects(() => createAsks({ ...wire, from: payer.address }), "asking in someone else's name")
  const made = await createAsks(wire)
  check(made.created === 2, "two requests created from one signature")
  check((await createAsks(wire)).created === 0, "sending the same request again creates nothing")

  const id = askId(groupId, payer.address, friend.address), strangerId = askId(groupId, stranger.address, friend.address)
  let mine = (await listAsks(payer.address)).find((a) => a.askId === id)
  check(!!mine && mine.status === "open" && mine.note === "Dinner" && BigInt(mine.amount) === each, "the person asked sees it: open, with the note and amount")

  // forged "paid" marks must not work
  check(!(await markAskPaid({ memo: id, payer: stranger.address, payee: friend.address, amount: each, txHash: memo })), "a payment from someone else does not settle it")
  check(!(await markAskPaid({ memo: id, payer: payer.address, payee: friend.address, amount: each - 1n, txHash: memo })), "a smaller payment does not settle it")

  // the real payment: person-to-person, memo = the request id
  const validBefore = BigInt(now() + 600)
  const paySig = await payer.signTypedData(receiveAuthTypedData({ from: payer.address, to: ROUTER_ADDRESS, value: each, validAfter: 0n, validBefore, nonce: directNonce(friend.address, id) }))
  const p2p = await relayDirectPayment({ to: friend.address, amount: each, memo: id, auth: { from: payer.address, validAfter: 0n, validBefore, signature: paySig } })
  check(await markAskPaid({ memo: id, payer: payer.address, payee: friend.address, amount: each, txHash: p2p.txHash }), `paid on Whitechain and marked paid ${p2p.explorer}`)
  mine = (await listAsks(payer.address)).find((a) => a.askId === id)
  check(mine?.status === "paid" && mine.paidTx === p2p.txHash.toLowerCase(), "the request shows as paid, with the payment's transaction")
  await rejects(async () => {
    const vb = BigInt(now() + 600)
    const s2 = await payer.signTypedData(receiveAuthTypedData({ from: payer.address, to: ROUTER_ADDRESS, value: each, validAfter: 0n, validBefore: vb, nonce: directNonce(friend.address, id) }))
    return relayDirectPayment({ to: friend.address, amount: each, memo: id, auth: { from: payer.address, validAfter: 0n, validBefore: vb, signature: s2 } })
  }, "paying the same request twice")

  const act = async (who: typeof payer, action: "decline" | "cancel", target: Hex) => {
    const at = now()
    return actOnAsk({ askId: target, actor: who.address, action, issuedAt: at, sig: await who.signMessage({ message: askActionMessage({ askId: target, actor: who.address, action, issuedAt: at }) }) })
  }
  await rejects(() => act(payer, "decline", strangerId), "declining a request made to someone else")
  await act(stranger, "decline", strangerId)
  check((await listAsks(friend.address)).find((a) => a.askId === strangerId)?.status === "declined", "the person asked declined; the asker sees it")
  await rejects(() => act(friend, "cancel", strangerId), "cancelling a request that was already declined")

  console.log(failed ? `\n\x1b[31m${failed} check(s) failed\x1b[0m` : "\n\x1b[32mAll checks passed\x1b[0m")
  process.exit(failed ? 1 : 0)
}
main().catch((e) => { console.error("\n✘", e.shortMessage ?? e.message); process.exit(1) })
