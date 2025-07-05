import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const CashflowProjectionSchema = z.object({
  projections: z.array(
    z.object({
      month: z.string(),
      projectedIncome: z.number(),
      projectedExpenses: z.number(),
      subscriptionCosts: z.number(),
      netCashflow: z.number(),
      confidence: z.number().min(0).max(1),
    }),
  ),
  insights: z.array(z.string()),
  recommendations: z.array(
    z.object({
      action: z.string(),
      impact: z.number(),
      priority: z.enum(["high", "medium", "low"]),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    const { historicalData, subscriptions } = await req.json()

    const { object: projection } = await generateObject({
      model: openai("gpt-4o"),
      schema: CashflowProjectionSchema,
      prompt: `Create a 6-month cashflow projection based on this data:

Historical financial data:
${JSON.stringify(historicalData, null, 2)}

Current subscriptions:
${JSON.stringify(subscriptions, null, 2)}

Generate:
1. Monthly projections for the next 6 months
2. Include seasonal variations and trends
3. Factor in subscription costs and potential cancellations
4. Provide confidence levels for each projection
5. Identify optimization opportunities
6. Recommend actions to improve cashflow

Consider:
- Income stability and growth trends
- Expense patterns and seasonality
- Subscription optimization opportunities
- Emergency fund requirements`,
    })

    return Response.json(projection)
  } catch (error) {
    console.error("Cashflow projection error:", error)
    return Response.json({ error: "Failed to generate cashflow projection" }, { status: 500 })
  }
}
