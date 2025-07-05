import { openai } from "@ai-sdk/openai"
import { generateObject, generateText } from "ai"
import { z } from "zod"

// Mock subscription data - in real app, this would come from Supabase
const mockSubscriptions = [
  {
    id: "netflix-1",
    name: "Netflix",
    amount: 15.99,
    category: "Entertainment",
    status: "active",
    lastCharge: "2024-01-15",
    nextCharge: "2024-02-15",
    usage: "high",
    cancellationUrl: "https://netflix.com/cancel",
    cancellationDifficulty: "medium"
  },
  {
    id: "spotify-premium",
    name: "Spotify Premium",
    amount: 11.99,
    category: "Entertainment",
    status: "active",
    lastCharge: "2024-01-10",
    nextCharge: "2024-02-10",
    usage: "high",
    cancellationUrl: "https://spotify.com/cancel",
    cancellationDifficulty: "easy"
  },
  {
    id: "adobe-creative",
    name: "Adobe Creative Suite",
    amount: 52.99,
    category: "Software",
    status: "active",
    lastCharge: "2024-01-05",
    nextCharge: "2024-02-05",
    usage: "medium",
    cancellationUrl: "https://adobe.com/cancel",
    cancellationDifficulty: "hard"
  },
  {
    id: "gym-membership",
    name: "Gym Membership",
    amount: 29.99,
    category: "Health",
    status: "unused",
    lastCharge: "2024-01-01",
    nextCharge: "2024-02-01",
    usage: "low",
    cancellationUrl: "https://gym.com/cancel",
    cancellationDifficulty: "medium"
  },
  {
    id: "cloud-storage",
    name: "Cloud Storage",
    amount: 4.99,
    category: "Software",
    status: "active",
    lastCharge: "2024-01-12",
    nextCharge: "2024-02-12",
    usage: "medium",
    cancellationUrl: "https://cloudstorage.com/cancel",
    cancellationDifficulty: "easy"
  },
  {
    id: "news-subscription",
    name: "News Subscription",
    amount: 12.99,
    category: "News",
    status: "unused",
    lastCharge: "2024-01-08",
    nextCharge: "2024-02-08",
    usage: "low",
    cancellationUrl: "https://news.com/cancel",
    cancellationDifficulty: "medium"
  }
]

const ChatResponseSchema = z.object({
  response: z.string(),
  actions: z.array(
    z.object({
      type: z.enum(["cancel_subscription", "view_details", "find_alternatives"]),
      label: z.string(),
      subscriptionId: z.string().optional(),
      subscriptionName: z.string().optional(),
    })
  ).optional(),
  needsFollowUp: z.boolean().optional(),
})

export async function POST(req: Request) {
  try {
    const { message, conversationHistory } = await req.json()

    // Prepare context about user's subscriptions
    const subscriptionContext = {
      subscriptions: mockSubscriptions,
      totalMonthlySpend: mockSubscriptions.reduce((sum, sub) => sum + sub.amount, 0),
      unusedSubscriptions: mockSubscriptions.filter(sub => sub.status === "unused"),
      highUsageSubscriptions: mockSubscriptions.filter(sub => sub.usage === "high"),
      categories: [...new Set(mockSubscriptions.map(sub => sub.category))],
      upcomingBills: mockSubscriptions.map(sub => ({
        name: sub.name,
        amount: sub.amount,
        nextCharge: sub.nextCharge
      }))
    }

    // Check if the message is a cancellation request
    const isCancellationRequest = message.toLowerCase().includes("cancel") || 
                                message.toLowerCase().includes("lemondás") ||
                                message.toLowerCase().includes("lemondanám")

    if (isCancellationRequest) {
      // Try to identify which subscription to cancel
      const subscriptionToCancel = mockSubscriptions.find(sub => 
        message.toLowerCase().includes(sub.name.toLowerCase()) ||
        message.toLowerCase().includes(sub.category.toLowerCase())
      )

      if (subscriptionToCancel) {
        return Response.json({
          response: `Értem, hogy le szeretnéd mondani a ${subscriptionToCancel.name} előfizetést ($${subscriptionToCancel.amount}/hó). Segítek ebben! A lemondás ${subscriptionToCancel.cancellationDifficulty === 'easy' ? 'egyszerű' : subscriptionToCancel.cancellationDifficulty === 'medium' ? 'közepes nehézségű' : 'nehéz'} ennél a szolgáltatónál.`,
          actions: [
            {
              type: "cancel_subscription",
              label: "Lemondás most",
              subscriptionId: subscriptionToCancel.id,
              subscriptionName: subscriptionToCancel.name
            },
            {
              type: "view_details",
              label: "Részletek megtekintése",
              subscriptionId: subscriptionToCancel.id,
              subscriptionName: subscriptionToCancel.name
            }
          ]
        })
      }
    }

    // Generate AI response using OpenAI
    const { object: aiResponse } = await generateObject({
      model: openai("gpt-4o"),
      schema: ChatResponseSchema,
      prompt: `You are a helpful AI assistant for a subscription management app called SubSaver. 
      You help users understand their subscriptions and find ways to save money.
      
      Context about the user's subscriptions:
      ${JSON.stringify(subscriptionContext, null, 2)}
      
      Previous conversation:
      ${conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}
      
      User's current message: "${message}"
      
      Instructions:
      1. Respond in Hungarian language
      2. Be helpful and friendly
      3. Focus on subscription management and money-saving tips
      4. If the user asks about specific subscriptions, provide detailed information
      5. If appropriate, suggest actionable buttons (actions) for cancel_subscription, view_details, or find_alternatives
      6. Use the subscription data provided to give accurate information
      7. If the user asks about canceling subscriptions, provide helpful guidance
      8. If the user asks about alternatives, suggest cheaper or better options
      
      Examples of good responses:
      - For "Which subscription is the most expensive?": "A legdrágább előfizetése az Adobe Creative Suite $52.99/hónapért..."
      - For "Are there any subscriptions I don't use often?": "Igen, két nem használt előfizetést találtam..."
      - For "What are my upcoming bills?": "A következő hónapban ezek a számlák várhatóak..."
      
      Provide actions array only if the response would benefit from actionable buttons.`
    })

    return Response.json(aiResponse)
  } catch (error) {
    console.error("AI Chat error:", error)
    return Response.json({ 
      response: "Sajnálom, hiba történt a válasz generálása során. Kérlek, próbáld újra később.",
      actions: []
    }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ 
    message: "AI Chat API endpoint is running",
    availableEndpoints: {
      POST: "Send a chat message and get AI response"
    }
  })
}