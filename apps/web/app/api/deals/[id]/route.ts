// One protected deal: the contract's state, the terms and the dispute thread.
import { getDeal } from "@whitepay/server"
import { json } from "@/lib/json"
import { dealFailure } from "@/lib/deal-api"

export const runtime = "nodejs"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  try {
    const deal = await getDeal(id)
    return deal ? json(deal) : json({ error: "This deal doesn't exist" }, { status: 404 })
  } catch (e) { return dealFailure(e) }
}
