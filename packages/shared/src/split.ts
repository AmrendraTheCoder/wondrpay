// Split payments: one payment to many people (SplitPay contract), and money requests ("friends owe me").
// The nonce maths MUST mirror contracts/src/SplitPay.sol; scripts/split-e2e.ts checks it against the chain.
import { encodeAbiParameters, keccak256, toHex, type Address, type Hex } from "viem"
import { WHITECHAIN_CHAIN_ID } from "./index"
export { SplitPayAbi as SPLIT_ABI } from "./abi/SplitPay"

/** Whitechain Sepolia deployment (deployments/1874.json → contracts.SplitPay). No owner, no settings. */
export const SPLIT_ADDRESS: Address = "0xADE9b2D2e933ce3d1fd760Da6424459d70c2e6f1"
export const SPLIT_MAX_PEOPLE = 50

const SPLIT_TAG = keccak256(toHex("WONDRPAY_SPLIT"))

/** Mirrors SplitPay.splitNonce: the id of a split and the EIP-3009 nonce the payer signs.
 *  It binds every recipient and amount (in order) and the memo, so a relayer can't change them. */
export const splitNonce = (to: readonly Address[], amounts: readonly bigint[], memo: Hex, contract: Address = SPLIT_ADDRESS, chainId = WHITECHAIN_CHAIN_ID): Hex =>
  keccak256(encodeAbiParameters(
    [{ type: "bytes32" }, { type: "uint256" }, { type: "address" }, { type: "bytes32" }, { type: "bytes32" }],
    [SPLIT_TAG, BigInt(chainId), contract, keccak256(encodeAbiParameters([{ type: "address[]" }, { type: "uint256[]" }], [[...to], [...amounts]])), memo],
  ))

/** Split `total` into `n` shares that add up exactly. Leftover base units (at most n-1 millionths of a
 *  USDT) go one each to the first people, so nothing is lost to rounding. */
export function equalShares(total: bigint, n: number): bigint[] {
  if (n <= 0 || total <= 0n) return []
  const base = total / BigInt(n), extra = Number(total % BigInt(n))
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1n : 0n))
}

// ------------------------------------------------------------------ money requests ("friends owe me")
// A request is only a message: it never moves money. The person asked sees who is asking and for what, and
// pays with their own PIN like any other payment, or declines. Limits stop it being used to pester people.
export const ASK = {
  maxPeople: 20, // per request
  perDay: 20, // people one wallet may ask per day
  openPerPair: 3, // open requests from one wallet to the same person
  ttlSeconds: 7 * 86_400,
  note: 80,
} as const
export type AskStatus = "open" | "paid" | "declined" | "cancelled" | "expired"

/** One request id per (group, person asked, person owed). Paying a request uses this as the payment memo,
 *  so the same request can never be paid twice. */
export const askId = (groupId: Hex, to: Address, from: Address): Hex =>
  keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "address" }, { type: "address" }], [groupId, to, from]))

/** The person who is owed signs this once for the whole group. */
export const askGroupMessage = (p: { from: Address; groupId: Hex; items: readonly { to: Address; amount: bigint }[]; note: string; issuedAt: number }) =>
  `WondrPay money request\nfrom: ${p.from}\ngroup: ${p.groupId.toLowerCase()}\n` +
  p.items.map((i) => `ask ${i.to}: ${i.amount}`).join("\n") +
  `\nnote: ${p.note}\nissued: ${p.issuedAt}`

/** Decline (by the person asked) or cancel (by the person owed). */
export const askActionMessage = (p: { askId: Hex; actor: Address; action: "decline" | "cancel"; issuedAt: number }) =>
  `WondrPay money request\n${p.action}: ${p.askId.toLowerCase()}\nby: ${p.actor}\nissued: ${p.issuedAt}`
