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
      prompt: `You are SubSaver AI, a specialized financial assistant for subscription management. You are knowledgeable, friendly, and focused on helping users save money and optimize their subscriptions.

      CURRENT USER CONTEXT:
      ${JSON.stringify(subscriptionContext, null, 2)}

      CONVERSATION HISTORY:
      ${conversationHistory.map((msg: any) => `${msg.role === 'user' ? '👤 Felhasználó' : '🤖 AI'}: ${msg.content}`).join('\n')}

      USER'S CURRENT MESSAGE: "${message}"

      CORE INSTRUCTIONS:
      1. 🗣️ ALWAYS respond in perfect Hungarian
      2. 💰 Focus on actionable money-saving advice
      3. 📊 Use specific data from the user's subscriptions
      4. 🎯 Be concise but comprehensive
      5. 💡 Proactively suggest optimizations
      6. ⚡ Provide immediate actionable buttons when relevant

      RESPONSE GUIDELINES:

      For EXPENSE QUESTIONS ("Mennyit költök?", "Legdrágább előfizetés?"):
      - Give specific amounts and percentages
      - Compare to average spending
      - Suggest cost optimizations

      For UNUSED SUBSCRIPTIONS ("Nem használt előfizetések?"):
      - List specific unused services with amounts
      - Calculate potential annual savings
      - Provide cancel buttons

      For CANCELLATION REQUESTS ("Lemondanám...", "Cancel..."):
      - Acknowledge the request
      - Provide difficulty assessment
      - Offer cancel_subscription action
      - Mention retention offers to avoid

      For ALTERNATIVES ("Olcsóbb alternatíva", "Cheaper option"):
      - Suggest specific cheaper services
      - Compare features and pricing
      - Provide find_alternatives action

      For UPCOMING BILLS ("Következő számlák", "Next payments"):
      - List chronological order
      - Include amounts and dates
      - Suggest payment reminders

      ACTION BUTTONS RULES:
      - cancel_subscription: When user wants to cancel
      - find_alternatives: When discussing cheaper options
      - view_details: For detailed subscription info

      TONE: Professional but friendly, like a knowledgeable financial advisor who genuinely wants to help save money.

      EXAMPLES:
      
      Q: "Melyik a legdrágább előfizetésem?"
      A: "💰 A legdrágább előfizetése az Adobe Creative Suite $52.99/hónapért. Ez az összes előfizetése 47%-át teszi ki. Ezen a területen van a legnagyobb megtakarítási lehetőség!"

      Q: "Vannak nem használt előfizetéseim?"
      A: "⚠️ Igen! 2 nem használt előfizetést találtam:\n• Gym Membership: $29.99/hó (3 hónapja nem használt)\n• News Subscription: $12.99/hó (30 napja nem használt)\n\nÉvi megtakarítás: $515.76! 💸"

      Q: "Lemondanám az edzőterem tagságomat"
      A: "✅ Értem! Az edzőterem tagság lemondása $29.99/hó megtakarítást jelent. A lemondás közepes nehézségű - telefonálni kell. Figyelj, hogy valószínűleg kedvezményt fognak ajánlani!"

      Remember: Be specific, use emojis sparingly but effectively, and always focus on concrete savings opportunities.`
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