import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const TransactionAnalysisSchema = z.object({
  subscriptions: z.array(
    z.object({
      name: z.string(),
      amount: z.number(),
      frequency: z.enum(["monthly", "yearly", "weekly"]),
      category: z.string(),
      confidence: z.number().min(0).max(1),
      isRecurring: z.boolean(),
      merchantInfo: z.object({
        name: z.string(),
        website: z.string().optional(),
        cancellationDifficulty: z.enum(["easy", "medium", "hard"]),
      }),
    }),
  ),
  insights: z.array(z.string()),
  totalMonthlySpend: z.number(),
  potentialSavings: z.number(),
})

export async function POST(req: Request) {
  try {
    const { transactions } = await req.json()

    const { object: analysis } = await generateObject({
      model: openai("gpt-4o"),
      schema: TransactionAnalysisSchema,
      prompt: `Analyze these bank transactions and identify recurring subscriptions:

${JSON.stringify(transactions, null, 2)}

For each recurring subscription found:
1. Extract the service name, amount, and frequency
2. Categorize the service (Entertainment, Software, Health, News, etc.)
3. Assess confidence level (0-1) that this is a subscription
4. Determine cancellation difficulty based on known merchant practices
5. Provide merchant website if known

Also provide:
- Insights about spending patterns
- Total monthly subscription spend
- Potential savings from unused/duplicate services

Focus on identifying true recurring subscriptions, not one-time purchases.`,
    })

    return Response.json(analysis)
  } catch (error) {
    console.error("Transaction analysis error:", error)
    return Response.json({ error: "Failed to analyze transactions" }, { status: 500 })
  }
}
