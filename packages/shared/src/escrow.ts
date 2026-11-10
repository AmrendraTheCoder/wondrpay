// Protected Pay: shared types, EIP-712 definitions and money maths for the ProtectedEscrow contract.
// Everything here MUST mirror contracts/src/ProtectedEscrow.sol exactly. The hash parity test
// (contracts/test/ProtectedEscrow.parity.t.sol, values from scripts/escrow-parity.ts) guards the typed data.
import type { Address, Hex } from "viem"
import { WHITECHAIN_CHAIN_ID, USDT_DOMAIN, RECEIVE_WITH_AUTHORIZATION_TYPES } from "./index"
export { ProtectedEscrowAbi as ESCROW_ABI } from "./abi/ProtectedEscrow"

/** Whitechain Sepolia deployment (deployments/1874.json → contracts.ProtectedEscrow). Testnet roles = deployer. */
export const ESCROW_ADDRESS: Address = "0xBbE402F5c137AEc229c801d7F89ba3dD384fB649"

// ------------------------------------------------------------------ enums (same order as Solidity)
export enum DealState { None, Funded, Delivered, Disputed, Escalated, Released, Refunded, Settled }
export enum ActionKind {
  MarkDelivered, Release, OpenDispute, AgreeRefund, OfferPartial,
  AcceptPartial, Contest, Escalate, CancelBySeller, Rule,
}
/** who must sign each action (the contract checks the same) */
export const ACTION_SIGNER: Record<ActionKind, "payer" | "payee" | "arbiter"> = {
  [ActionKind.MarkDelivered]: "payee",
  [ActionKind.Release]: "payer",
  [ActionKind.OpenDispute]: "payer",
  [ActionKind.AgreeRefund]: "payee",
  [ActionKind.OfferPartial]: "payee",
  [ActionKind.AcceptPartial]: "payer",
  [ActionKind.Contest]: "payee",
  [ActionKind.Escalate]: "payer",
  [ActionKind.CancelBySeller]: "payee",
  [ActionKind.Rule]: "arbiter",
}
export const isClosed = (s: DealState) => s >= DealState.Released

// ------------------------------------------------------------------ limits and defaults
const H = 3_600
const D = 86_400
/** mirrors the contract's immutable bounds */
export const DEAL_BOUNDS = {
  deliverWithin: { min: 1 * H, max: 30 * D },
  inspectFor: { min: 1 * H, max: 14 * D },
  respondWithin: { min: 1 * D, max: 7 * D },
  arbiterWindow: 7 * D,
  maxFeeBps: 200,
} as const
/** product defaults; tune after user interviews (no contract change needed) */
export const DEAL_DEFAULTS = { deliverWithin: 3 * D, inspectFor: 3 * D, respondWithin: 3 * D, offerTtl: 7 * D } as const

// ------------------------------------------------------------------ EIP-712
export type Offer = {
  payee: Address
  payer: Address // zero address = anyone with the link
  amount: bigint
  deliverWithin: number
  inspectFor: number
  respondWithin: number
  offerExpiry: bigint
  offerId: Hex
}
export type Action = { dealId: Hex; kind: number; amount: bigint; nonce: bigint; validBefore: bigint }

export const escrowDomain = (escrow: Address, chainId: number = WHITECHAIN_CHAIN_ID) =>
  ({ name: "WondrPayEscrow", version: "1", chainId, verifyingContract: escrow }) as const

export const OFFER_TYPES = {
  Offer: [
    { name: "payee", type: "address" },
    { name: "payer", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "deliverWithin", type: "uint32" },
    { name: "inspectFor", type: "uint32" },
    { name: "respondWithin", type: "uint32" },
    { name: "offerExpiry", type: "uint64" },
    { name: "offerId", type: "bytes32" },
  ],
} as const

export const ACTION_TYPES = {
  Action: [
    { name: "dealId", type: "bytes32" },
    { name: "kind", type: "uint8" },
    { name: "amount", type: "uint128" },
    { name: "nonce", type: "uint256" },
    { name: "validBefore", type: "uint64" },
  ],
} as const

export const FUND_CONSENT_TYPES = {
  FundConsent: [
    { name: "dealId", type: "bytes32" },
    { name: "payer", type: "address" },
    { name: "validBefore", type: "uint64" },
  ],
} as const

/** The seller signs this to create a protected deal link. Its hash is the dealId. */
export const offerTypedData = (escrow: Address, offer: Offer, chainId?: number) =>
  ({ domain: escrowDomain(escrow, chainId), types: OFFER_TYPES, primaryType: "Offer", message: offer }) as const

/** A party signs this for a gasless action; the relayer submits it with actWithSig. */
export const actionTypedData = (escrow: Address, action: Action, chainId?: number) =>
  ({ domain: escrowDomain(escrow, chainId), types: ACTION_TYPES, primaryType: "Action", message: action }) as const

/** The payer signs this EIP-3009 authorization to fund a deal: to = escrow, value = amount + fee, nonce = dealId. */
export const fundAuthTypedData = (p: {
  from: Address
  escrow: Address
  total: bigint
  dealId: Hex
  validAfter: bigint
  validBefore: bigint
}) =>
  ({
    domain: USDT_DOMAIN,
    types: RECEIVE_WITH_AUTHORIZATION_TYPES,
    primaryType: "ReceiveWithAuthorization",
    message: {
      from: p.from,
      to: p.escrow,
      value: p.total,
      validAfter: p.validAfter,
      validBefore: p.validBefore,
      nonce: p.dealId,
    },
  }) as const

// ------------------------------------------------------------------ money maths (mirrors _settle)
/** fee added on top of `amount` (rounded down, like the contract) */
export const dealFee = (amount: bigint, feeBps: number) => (amount * BigInt(feeBps)) / 10_000n

/** Exactly what each side receives when `payerShare` of `amount` goes back to the payer. */
export function splitPreview(amount: bigint, fee: bigint, payerShare: bigint) {
  if (amount <= 0n || payerShare < 0n || payerShare > amount) throw new Error("bad split")
  const payeeShare = amount - payerShare
  const feeKept = (fee * payeeShare) / amount
  return { payerGets: payerShare + (fee - feeKept), payeeGets: payeeShare, treasuryGets: feeKept }
}

/** Plain-language description of an action, shown before the user signs it. */
export function describeAction(kind: ActionKind, p: { amount: string; counterparty: string; refund?: string }) {
  switch (kind) {
    case ActionKind.MarkDelivered: return `You confirm you delivered. ${p.counterparty} then has a few days to check it.`
    case ActionKind.Release: return `Release ${p.amount} to ${p.counterparty} now. This can't be undone.`
    case ActionKind.OpenDispute: return `Report a problem. ${p.counterparty} must answer, or you get an automatic refund.`
    case ActionKind.AgreeRefund: return `Refund ${p.counterparty} in full. This can't be undone.`
    case ActionKind.OfferPartial: return `Offer ${p.refund} back to ${p.counterparty}. If they don't answer, it's accepted.`
    case ActionKind.AcceptPartial: return `Accept ${p.refund} back and close the deal.`
    case ActionKind.Contest: return `Disagree and send it to the WondrPay dispute desk.`
    case ActionKind.Escalate: return `Reject the offer and send it to the WondrPay dispute desk.`
    case ActionKind.CancelBySeller: return `Cancel the deal. ${p.counterparty} gets everything back.`
    case ActionKind.Rule: return `Arbiter ruling: ${p.refund} back to the buyer.`
  }
}
