"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  CreditCard
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: Array<{
    type: "cancel_subscription" | "view_details" | "find_alternatives"
    label: string
    subscriptionId?: string
    subscriptionName?: string
  }>
}

interface ProactiveInsight {
  type: "price_increase" | "unused_subscription" | "duplicate_service" | "savings_opportunity"
  title: string
  description: string
  amount?: number
  subscriptionName?: string
  action?: {
    type: "cancel_subscription" | "view_details" | "find_alternatives"
    label: string
    subscriptionId?: string
  }
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [proactiveInsights, setProactiveInsights] = useState<ProactiveInsight[]>([])
  const [showProactiveInsights, setShowProactiveInsights] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate proactive insights on component mount
    const mockProactiveInsights: ProactiveInsight[] = [
      {
        type: "price_increase",
        title: "Spotify díj emelkedés",
        description: "Észrevettem, hogy a Spotify előfizetése 2 dollárral drágult a múlt hónapban.",
        amount: 2,
        subscriptionName: "Spotify Premium",
        action: {
          type: "find_alternatives",
          label: "Keresés alternatívákért",
          subscriptionId: "spotify-premium"
        }
      },
      {
        type: "unused_subscription",
        title: "Nem használt edzőterem tagság",
        description: "3 hónapja nem használta az edzőterem tagságát. Havi $29.99 megtakarítás lehetséges.",
        amount: 29.99,
        subscriptionName: "Gym Membership",
        action: {
          type: "cancel_subscription",
          label: "Lemondás most",
          subscriptionId: "gym-membership"
        }
      }
    ]
    setProactiveInsights(mockProactiveInsights)

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content: "Jó reggelt! 👋 Én vagyok a SubSaver AI asszisztense. Segítek elemezni az előfizetéseit és megtakarítási lehetőségeket találni. Feltehetsz kérdéseket az előfizetéseiddel kapcsolatban, vagy használhatod a javasolt akciókat.",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        actions: data.actions
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sajnálom, hiba történt. Kérlek, próbáld újra később.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAction = async (action: any) => {
    if (action.type === "cancel_subscription") {
      setIsLoading(true)
      
      // Simulate cancellation process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const confirmationMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `✅ Sikeresen lemondtam a ${action.subscriptionName} előfizetését. Mostantól nem fogsz fizetni érte.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, confirmationMessage])
      setIsLoading(false)
    } else if (action.type === "find_alternatives") {
      const alternativesMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant", 
        content: `🔍 Alternatívákat keresek a ${action.subscriptionName} helyett...`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, alternativesMessage])
    }
  }

  const dismissProactiveInsight = (index: number) => {
    setProactiveInsights((prev: ProactiveInsight[]) => prev.filter((_, i: number) => i !== index))
  }

  const getInsightIcon = (type: ProactiveInsight['type']) => {
    switch (type) {
      case "price_increase":
        return <TrendingUp className="w-4 h-4" />
      case "unused_subscription":
        return <AlertTriangle className="w-4 h-4" />
      case "duplicate_service":
        return <CreditCard className="w-4 h-4" />
      case "savings_opportunity":
        return <DollarSign className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
    }
  }

  const getInsightColor = (type: ProactiveInsight['type']) => {
    switch (type) {
      case "price_increase":
        return "bg-orange-50 border-orange-200 text-orange-800"
      case "unused_subscription":
        return "bg-red-50 border-red-200 text-red-800"
      case "duplicate_service":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "savings_opportunity":
        return "bg-green-50 border-green-200 text-green-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          AI Chat Asszisztens
        </CardTitle>
        <CardDescription>
          Kérdezz az előfizetéseidről, kiadásaidról és megtakarítási lehetőségekről
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Proactive Insights */}
        {showProactiveInsights && proactiveInsights.length > 0 && (
          <div className="px-6 pb-4 space-y-3">
            {proactiveInsights.map((insight: ProactiveInsight, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-sm mt-1">{insight.description}</div>
                      {insight.amount && (
                        <Badge variant="outline" className="mt-2">
                          ${insight.amount}/hó megtakarítás
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissProactiveInsight(index)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
                {insight.action && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAction(insight.action)}
                      disabled={isLoading}
                    >
                      {insight.action.label}
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <Separator />
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  {message.actions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(action)}
                          disabled={isLoading}
                          className="bg-white"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Gondolkozom...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-6 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Kérdezz az előfizetéseidről..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Példa kérdések: "Melyik a legdrágább előfizetésem?" • "Vannak nem használt előfizetéseim?" • "Találj olcsóbb alternatívákat a Netflix-hez"
          </div>
        </div>
      </CardContent>
    </Card>
  )
}