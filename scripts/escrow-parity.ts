// Prints the EIP-712 hashes @whitepay/shared/escrow produces for fixed inputs.
// contracts/test/ProtectedEscrow.parity.t.sol asserts the Solidity contract produces the same values.
// If you change a type in either place, rerun this and update the constants in the parity test:
//   node --import tsx scripts/escrow-parity.ts
import { hashTypedData, type Address, type Hex } from "viem"
import { offerTypedData, actionTypedData, splitPreview, dealFee, ActionKind } from "../packages/shared/src/escrow"

export const PARITY = {
  chainId: 31337,
  escrow: "0x00000000000000000000000000000000e5c0e5c0" as Address,
  offer: {
    payee: "0x00000000000000000000000000000000000000B0" as Address,
    payer: "0x0000000000000000000000000000000000000000" as Address,
    amount: 180_000_000n,
    deliverWithin: 259_200,
    inspectFor: 259_200,
    respondWithin: 86_400,
    offerExpiry: 1_800_086_400n,
    offerId: "0x1111111111111111111111111111111111111111111111111111111111111111" as Hex,
  },
}

const offerHash = hashTypedData(offerTypedData(PARITY.escrow, PARITY.offer, PARITY.chainId))
const actionHash = hashTypedData(
  actionTypedData(
    PARITY.escrow,
    { dealId: offerHash, kind: ActionKind.OfferPartial, amount: 60_000_000n, nonce: 7n, validBefore: 1_800_000_600n },
    PARITY.chainId,
  ),
)
const fee = dealFee(PARITY.offer.amount, 50)
console.log(JSON.stringify({ offerHash, actionHash, fee: fee.toString(), split: splitPreview(PARITY.offer.amount, fee, 60_000_000n) }, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2))
