// Protected Pay, end to end on Whitechain Sepolia with real signatures and the real USDT.
// Buyer (CUSTOMER_PK) and seller (MERCHANT_PK) never pay gas: they only sign. The submitter
// (DEPLOYER_PK, standing in for the relayer) pays gas and has no special power in the contract.
//
//   A) fund -> seller marks delivered -> buyer releases           (Released)
//   B) fund -> delivered -> dispute -> seller offers 40% -> buyer accepts   (Settled)
//   C) attack: replay the buyer's funding signature -> rejected
//
// Run:  node --import tsx --env-file=.env scripts/protected-demo.ts [amountUSDT=1]
import { createPublicClient, createWalletClient, http, parseSignature, parseUnits, formatUnits, keccak256, toHex, type Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { whitechainSepolia, ERC20_ABI, USDT_ADDRESS, EXPLORER_URL } from "../packages/shared/src/index"
import {
  ESCROW_ABI, ESCROW_ADDRESS, offerTypedData, actionTypedData, fundAuthTypedData, ActionKind, DealState, splitPreview,
} from "../packages/shared/src/escrow"

const amount = parseUnits(process.argv.find((a) => /^\d+(\.\d+)?$/.test(a)) ?? "1", 6)
const buyer = privateKeyToAccount(process.env.CUSTOMER_PK as Hex)
const seller = privateKeyToAccount(process.env.MERCHANT_PK as Hex)
const submitter = privateKeyToAccount(process.env.DEPLOYER_PK as Hex)
const transport = http(process.env.WC_RPC_URL || "https://rpc.testnet.whitechain.io")
const pub = createPublicClient({ chain: whitechainSepolia, transport })
const wallet = createWalletClient({ chain: whitechainSepolia, transport, account: submitter })
const esc = { address: ESCROW_ADDRESS, abi: ESCROW_ABI } as const

const ok = (s: string) => console.log(`  \x1b[32m✔\x1b[0m ${s}`)
const step = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m`)
const fmt = (v: bigint) => `${formatUnits(v, 6)} USDT`
const bal = (a: Hex) => pub.readContract({ address: USDT_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf", args: [a] })
const now = () => BigInt(Math.floor(Date.now() / 1000))
const links: string[] = []

async function send(functionName: string, args: readonly unknown[], label: string) {
  const hash = await wallet.writeContract({ ...esc, functionName: functionName as any, args: args as any })
  const rc = await pub.waitForTransactionReceipt({ hash })
  if (rc.status !== "success") throw new Error(`${label} reverted`)
  links.push(`${label}: ${EXPLORER_URL}/tx/${hash}`)
  ok(`${label} (gas ${rc.gasUsed}) ${EXPLORER_URL}/tx/${hash}`)
  return hash
}

async function makeDeal(tag: string) {
  const offer = {
    payee: seller.address,
    payer: "0x0000000000000000000000000000000000000000" as Hex,
    amount,
    deliverWithin: 3 * 86_400,
    inspectFor: 3 * 86_400,
    respondWithin: 86_400,
    offerExpiry: now() + 86_400n,
    offerId: keccak256(toHex(`${tag}-${Date.now()}`)),
  }
  const payeeSig = await seller.signTypedData(offerTypedData(ESCROW_ADDRESS, offer))
  const dealId = (await pub.readContract({ ...esc, functionName: "hashOffer", args: [offer] })) as Hex
  const fee = (await pub.readContract({ ...esc, functionName: "feeFor", args: [amount] })) as bigint
  const validAfter = now() - 60n
  const validBefore = now() + 3_600n
  const authSig = parseSignature(
    await buyer.signTypedData(fundAuthTypedData({ from: buyer.address, escrow: ESCROW_ADDRESS, total: amount + fee, dealId, validAfter, validBefore })),
  )
  const auth = { from: buyer.address, validAfter, validBefore, v: Number(authSig.yParity) + 27, r: authSig.r, s: authSig.s }
  return { offer, payeeSig, dealId, fee, auth }
}

async function act(signer: typeof buyer, dealId: Hex, kind: ActionKind, label: string, amt = 0n) {
  const nonce = (await pub.readContract({ ...esc, functionName: "nonces", args: [signer.address] })) as bigint
  const action = { dealId, kind, amount: amt, nonce, validBefore: now() + 600n }
  const sig = await signer.signTypedData(actionTypedData(ESCROW_ADDRESS, action))
  return send("actWithSig", [action, sig], label)
}

const state = async (id: Hex) => DealState[((await pub.readContract({ ...esc, functionName: "getDeal", args: [id] })) as any).state]

async function main() {
  step(`Protected Pay on Whitechain Sepolia · escrow ${ESCROW_ADDRESS}`)
  const [b0, s0, wbtB, wbtS] = await Promise.all([bal(buyer.address), bal(seller.address), pub.getBalance({ address: buyer.address }), pub.getBalance({ address: seller.address })])
  ok(`buyer ${buyer.address} has ${fmt(b0)}; seller ${seller.address} has ${fmt(s0)}`)
  if (b0 < (amount + amount / 100n) * 2n) throw new Error("buyer needs more test USDT")

  step("A) fund → delivered → buyer releases")
  const A = await makeDeal("A")
  await send("fund", [A.offer, A.payeeSig, A.auth], "A fund (buyer signed, 0 gas)")
  await act(seller, A.dealId, ActionKind.MarkDelivered, "A seller marks delivered (signed, 0 gas)")
  await act(buyer, A.dealId, ActionKind.Release, "A buyer releases (signed, 0 gas)")
  ok(`deal A is ${await state(A.dealId)}`)

  step("B) fund → delivered → dispute → 40% partial refund accepted")
  const B = await makeDeal("B")
  await send("fund", [B.offer, B.payeeSig, B.auth], "B fund")
  await act(seller, B.dealId, ActionKind.MarkDelivered, "B seller marks delivered")
  await act(buyer, B.dealId, ActionKind.OpenDispute, "B buyer opens dispute")
  const refund = (amount * 40n) / 100n
  await act(seller, B.dealId, ActionKind.OfferPartial, `B seller offers ${fmt(refund)} back`, refund)
  await act(buyer, B.dealId, ActionKind.AcceptPartial, "B buyer accepts")
  ok(`deal B is ${await state(B.dealId)}`)

  step("C) attack: replay the buyer's funding signature")
  try {
    await pub.simulateContract({ ...esc, functionName: "fund", args: [A.offer, A.payeeSig, A.auth], account: submitter })
    throw new Error("replay was NOT rejected")
  } catch (e: any) {
    if (String(e.message).includes("NOT rejected")) throw e
    ok(`rejected: ${e.shortMessage ?? "revert"} (${e.cause?.data?.errorName ?? "AlreadyFunded"})`)
  }

  step("Balances")
  const [b1, s1, wbtB1, wbtS1] = await Promise.all([bal(buyer.address), bal(seller.address), pub.getBalance({ address: buyer.address }), pub.getBalance({ address: seller.address })])
  const split = splitPreview(amount, B.fee, refund)
  const expBuyer = b0 - (amount + A.fee) - (amount + B.fee) + split.payerGets
  const expSeller = s0 + amount + split.payeeGets
  ok(`buyer  ${fmt(b0)} → ${fmt(b1)} (expected ${fmt(expBuyer)}) ${b1 === expBuyer ? "✓" : "✗ MISMATCH"}`)
  ok(`seller ${fmt(s0)} → ${fmt(s1)} (expected ${fmt(expSeller)}) ${s1 === expSeller ? "✓" : "✗ MISMATCH"}`)
  ok(`gas paid by buyer: ${wbtB - wbtB1} wei · by seller: ${wbtS - wbtS1} wei (both must be 0)`)
  if (b1 !== expBuyer || s1 !== expSeller || wbtB !== wbtB1 || wbtS !== wbtS1) process.exitCode = 1

  console.log(`\nDeals: A ${A.dealId}\n       B ${B.dealId}\n` + links.map((l) => "  " + l).join("\n"))
}

main().catch((e) => { console.error("\n✘", e.shortMessage ?? e.message); process.exit(1) })
