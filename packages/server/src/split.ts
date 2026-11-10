// Split pay-out: one signed payment from the payer, many recipients, one transaction (SplitPay contract).
// The relayer only submits: the payer's signature covers the exact list of people and amounts.
import { getAddress, isAddress, isHex, type Address, type Hex } from "viem"
import { ERC20_ABI } from "@whitepay/shared"
import { SPLIT_ABI, SPLIT_ADDRESS, SPLIT_MAX_PEOPLE, splitNonce } from "@whitepay/shared/split"
import { wc } from "./clients"
import { config } from "./config"
import { PolicyError, checkPolicy, recordSpend, guardGas, sendRobust, shortErr, toAuthTuple, type PayerAuth } from "./relayer"

export class SplitError extends Error {
  constructor(public code: "bad_request" | "not_allowed", msg: string) { super(msg) }
}
const split = { address: (process.env.SPLIT_ADDRESS as Address | undefined) ?? SPLIT_ADDRESS, abi: SPLIT_ABI } as const

export async function relaySplit(p: { to: string[]; amounts: string[]; memo: string; auth: PayerAuth }) {
  if (!Array.isArray(p.to) || !Array.isArray(p.amounts) || p.to.length !== p.amounts.length) throw new SplitError("bad_request", "Malformed split")
  if (p.to.length < 1 || p.to.length > SPLIT_MAX_PEOPLE) throw new SplitError("bad_request", `A split can pay 1 to ${SPLIT_MAX_PEOPLE} people`)
  if (!isHex(p.memo) || p.memo.length !== 66) throw new SplitError("bad_request", "Malformed split")
  let to: Address[], amounts: bigint[]
  try {
    to = p.to.map((a) => { if (!isAddress(a)) throw 0; return getAddress(a) })
    amounts = p.amounts.map((a) => { const v = BigInt(a); if (v <= 0n) throw 0; return v })
  } catch { throw new SplitError("bad_request", "Every person needs a valid address and an amount above zero") }
  const from = getAddress(p.auth.from)
  if (new Set(to.map((a) => a.toLowerCase())).size !== to.length) throw new SplitError("bad_request", "The same person is in the list twice")
  if (to.some((a) => a === from)) throw new SplitError("bad_request", "You can't include your own wallet")
  const total = amounts.reduce((s, x) => s + x, 0n)
  const { pub } = wc()
  if (p.auth.validBefore > BigInt(Math.floor(Date.now() / 1000) + 3_600)) throw new SplitError("bad_request", "That approval is valid for too long. Approve again.")
  const balance = (await pub.readContract({ address: config.usdt, abi: ERC20_ABI, functionName: "balanceOf", args: [from] })) as bigint
  if (balance < total) throw new SplitError("not_allowed", "Not enough USDT in this wallet for the whole split")

  await checkPolicy(from, total)
  await guardGas()
  const relayer = wc().relayerFor(from)
  let request
  try {
    ;({ request } = await pub.simulateContract({ account: relayer.account, ...split, functionName: "splitPay", args: [to, amounts, p.memo as Hex, toAuthTuple(p.auth)] }))
  } catch (err) {
    const e = shortErr(err)
    throw new PolicyError("simulation_failed", /invalid signature/i.test(e) ? "The approval doesn't match this list of people and amounts. Approve again." : /auth invalid|authorization is used/i.test(e) ? "This split was already paid. Nothing more was charged."
      : /blocked|blacklist/i.test(e) ? "One of these wallets can't receive USDT. Nothing was sent." : e)
  }
  const txHash = await sendRobust(relayer, request as any)
  const receipt = await pub.waitForTransactionReceipt({ hash: txHash, timeout: 60_000 })
  if (receipt.status !== "success") throw new Error(`splitPay reverted: ${txHash}`)
  recordSpend(from, total)
  return { txHash, block: receipt.blockNumber, gasUsed: receipt.gasUsed, total, people: to.length, splitId: splitNonce(to, amounts, p.memo as Hex, split.address), contract: split.address, explorer: `${config.explorer}/tx/${txHash}` }
}
