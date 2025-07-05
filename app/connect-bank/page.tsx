"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, CreditCard, CheckCircle, ArrowRight, Lock, Eye, Zap, AlertCircle } from "lucide-react"
import { usePlaidLink } from "react-plaid-link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ConnectBank() {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStep, setConnectionStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      // Create link token
      try {
        const response = await fetch("/api/plaid/link-token", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to create link token")
        }

        const data = await response.json()
        setLinkToken(data.link_token)
      } catch (err) {
        setError("Failed to initialize bank connection")
        console.error("Link token error:", err)
      }
    }

    checkAuth()
  }, [router])

  const onSuccess = async (public_token: string, metadata: any) => {
    setIsConnecting(true)
    setConnectionStep(2)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_token }),
      })

      if (!response.ok) {
        throw new Error("Failed to connect bank account")
      }

      const result = await response.json()
      setConnectionStep(3)

      // Redirect to dashboard after successful connection
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError("Failed to connect bank account. Please try again.")
      setConnectionStep(1)
      console.error("Token exchange error:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  const onExit = (err: any, metadata: any) => {
    if (err) {
      setError("Bank connection was cancelled or failed")
      console.error("Plaid Link error:", err)
    }
  }

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  })

  const handleConnect = () => {
    if (ready) {
      open()
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Connection Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => {
                setError(null)
                setConnectionStep(1)
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SubSaver</span>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <Shield className="w-4 h-4 mr-1" />
            Bank-Grade Security
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                connectionStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div className={`w-16 h-1 ${connectionStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                connectionStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <div className={`w-16 h-1 ${connectionStep >= 3 ? "bg-blue-600" : "bg-gray-200"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                connectionStep >= 3 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {connectionStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Bank Account</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Securely connect your bank accounts to start analyzing your subscriptions. We use read-only access with
                bank-grade encryption powered by Plaid.
              </p>
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">256-bit Encryption</h3>
                  <p className="text-sm text-gray-600">Your data is protected with the same security banks use</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Read-Only Access</h3>
                  <p className="text-sm text-gray-600">We can only view your transactions, never move money</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Lock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Plaid Secured</h3>
                  <p className="text-sm text-gray-600">Powered by Plaid, trusted by millions of users</p>
                </CardContent>
              </Card>
            </div>

            {/* Connect Button */}
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Secure Bank Connection</CardTitle>
                <CardDescription>Connect with 10,000+ financial institutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Read-only access to transactions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No access to move or transfer money</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Encrypted data transmission</span>
                  </div>
                </div>
                <Button className="w-full" onClick={handleConnect} disabled={!ready || !linkToken}>
                  {!ready || !linkToken ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      Connect Securely
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {connectionStep === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Connecting Your Account</h1>
              <p className="text-lg text-gray-600 mb-8">
                Please wait while we securely connect your bank account and analyze your transactions.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Processing Connection
                </CardTitle>
                <CardDescription>This may take a few moments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Verifying bank connection...</span>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fetching transaction history...</span>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analyzing spending patterns...</span>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {connectionStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Successfully Connected!</h1>
              <p className="text-lg text-gray-600 mb-8">
                Your bank account is now connected. We're analyzing your transactions to find recurring subscriptions.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Connection Complete
                </CardTitle>
                <CardDescription>Your data is secure and ready for analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bank account connected</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transaction history imported</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI analysis in progress</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-600 mb-4">Redirecting to your dashboard...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
