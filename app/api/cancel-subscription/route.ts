import { NextRequest, NextResponse } from 'next/server'

interface CancelSubscriptionRequest {
  subscriptionId: string
  subscriptionName: string
  reason?: string
  userId?: string
}

interface CancelSubscriptionResponse {
  success: boolean
  message: string
  savedAmount?: number
  cancellationConfirmation?: string
  nextSteps?: string[]
}

// Mock subscription data with cancellation info
const mockSubscriptions: Record<string, any> = {
  'gym-membership': {
    id: 'gym-membership',
    name: 'Gym Membership',
    amount: 29.99,
    provider: 'FitnessPro',
    cancellationMethod: 'phone',
    cancellationPhone: '+1-800-555-0123',
    cancellationUrl: 'https://fitnesspro.com/cancel',
    cancellationDifficulty: 'medium',
    retentionOffers: ['50% off for 3 months', 'Free personal training session']
  },
  'netflix-1': {
    id: 'netflix-1',
    name: 'Netflix',
    amount: 15.99,
    provider: 'Netflix',
    cancellationMethod: 'online',
    cancellationUrl: 'https://netflix.com/cancel',
    cancellationDifficulty: 'easy',
    retentionOffers: ['Free month', 'Lower tier subscription']
  },
  'spotify-premium': {
    id: 'spotify-premium',
    name: 'Spotify Premium',
    amount: 11.99,
    provider: 'Spotify',
    cancellationMethod: 'online',
    cancellationUrl: 'https://spotify.com/cancel',
    cancellationDifficulty: 'easy',
    retentionOffers: ['3 months free', 'Student discount']
  },
  'adobe-creative': {
    id: 'adobe-creative',
    name: 'Adobe Creative Suite',
    amount: 52.99,
    provider: 'Adobe',
    cancellationMethod: 'phone',
    cancellationPhone: '+1-800-833-6687',
    cancellationUrl: 'https://adobe.com/cancel',
    cancellationDifficulty: 'hard',
    retentionOffers: ['Photography plan for $9.99', '20% discount for 6 months']
  },
  'news-subscription': {
    id: 'news-subscription',
    name: 'News Subscription',
    amount: 12.99,
    provider: 'NewsDaily',
    cancellationMethod: 'email',
    cancellationEmail: 'cancel@newsdaily.com',
    cancellationUrl: 'https://newsdaily.com/cancel',
    cancellationDifficulty: 'medium',
    retentionOffers: ['Weekend only subscription', '50% off for 6 months']
  }
}

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, subscriptionName, reason, userId }: CancelSubscriptionRequest = await req.json()

    if (!subscriptionId || !subscriptionName) {
      return NextResponse.json(
        { success: false, message: 'Hiányzó adatok: subscriptionId és subscriptionName kötelező' },
        { status: 400 }
      )
    }

    const subscription = mockSubscriptions[subscriptionId]
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Előfizetés nem található' },
        { status: 404 }
      )
    }

    // Simulate cancellation process delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Determine cancellation steps based on provider
    const nextSteps: string[] = []
    let cancellationConfirmation = ''

    switch (subscription.cancellationMethod) {
      case 'online':
        nextSteps.push(`Látogasd meg: ${subscription.cancellationUrl}`)
        nextSteps.push('Jelentkezz be a fiókodba')
        nextSteps.push('Keresd meg a "Lemondás" vagy "Cancel" gombot')
        nextSteps.push('Kövesd a lemondási lépéseket')
        cancellationConfirmation = `Online lemondás elindítva: ${subscription.name}`
        break
      
      case 'phone':
        nextSteps.push(`Hívd a következő számot: ${subscription.cancellationPhone}`)
        nextSteps.push('Készítsd elő a fiók adataidat')
        nextSteps.push('Mondd meg, hogy le szeretnéd mondani az előfizetést')
        if (subscription.retentionOffers.length > 0) {
          nextSteps.push('Figyelj a megtartási ajánlatokra - döntsd el előre, hogy elfogadod-e')
        }
        cancellationConfirmation = `Telefonos lemondás szükséges: ${subscription.name}`
        break
      
      case 'email':
        nextSteps.push(`Írj emailt a következő címre: ${subscription.cancellationEmail}`)
        nextSteps.push('Tárgy: Előfizetés lemondása')
        nextSteps.push('Írd bele a fiók adataidat és a lemondás okát')
        nextSteps.push('Várd meg a megerősítő emailt')
        cancellationConfirmation = `Email lemondás elindítva: ${subscription.name}`
        break
      
      default:
        nextSteps.push('Lépj kapcsolatba az ügyfélszolgálattal')
        cancellationConfirmation = `Lemondás folyamatban: ${subscription.name}`
    }

    // Calculate annual savings
    const monthlySavings = subscription.amount
    const annualSavings = monthlySavings * 12

    // Log cancellation (in real app, this would go to database)
    console.log(`Cancellation initiated: ${subscriptionName} (${subscriptionId}) - Reason: ${reason || 'Not specified'}`)

    const response: CancelSubscriptionResponse = {
      success: true,
      message: `Sikeres lemondás: ${subscriptionName}. Havi megtakarítás: $${monthlySavings}, éves megtakarítás: $${annualSavings}`,
      savedAmount: monthlySavings,
      cancellationConfirmation,
      nextSteps
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Cancellation error:', error)
    return NextResponse.json(
      { success: false, message: 'Szerver hiba történt a lemondás során' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Subscription Cancellation API',
    endpoints: {
      'POST /api/cancel-subscription': 'Cancel a subscription',
    },
    supportedMethods: ['online', 'phone', 'email'],
    availableSubscriptions: Object.keys(mockSubscriptions)
  })
}
