"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bot,
  PieChartIcon as RechartsPieChart,
  Target,
} from "lucide-react"
import AIChat from "@/components/AIChat"
import SavingsTracker from "@/components/SavingsTracker"
import NotificationSystem from "@/components/NotificationSystem"
import BudgetRecommendations from "@/components/BudgetRecommendations"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  Pie,
} from "recharts"

// Mock data for demonstration
const mockSubscriptions = [
  {
    id: 1,
    name: "Netflix",
    amount: 15.99,
    category: "Entertainment",
    status: "active",
    lastCharge: "2024-01-15",
    nextCharge: "2024-02-15",
    usage: "high",
  },
  {
    id: 2,
    name: "Spotify Premium",
    amount: 9.99,
    category: "Entertainment",
    status: "active",
    lastCharge: "2024-01-10",
    nextCharge: "2024-02-10",
    usage: "high",
  },
  {
    id: 3,
    name: "Adobe Creative Suite",
    amount: 52.99,
    category: "Software",
    status: "active",
    lastCharge: "2024-01-05",
    nextCharge: "2024-02-05",
    usage: "medium",
  },
  {
    id: 4,
    name: "Gym Membership",
    amount: 29.99,
    category: "Health",
    status: "unused",
    lastCharge: "2024-01-01",
    nextCharge: "2024-02-01",
    usage: "low",
  },
  {
    id: 5,
    name: "Cloud Storage",
    amount: 4.99,
    category: "Software",
    status: "active",
    lastCharge: "2024-01-12",
    nextCharge: "2024-02-12",
    usage: "medium",
  },
  {
    id: 6,
    name: "News Subscription",
    amount: 12.99,
    category: "News",
    status: "unused",
    lastCharge: "2024-01-08",
    nextCharge: "2024-02-08",
    usage: "low",
  },
]

const cashflowData = [
  { month: "Jan", income: 5000, expenses: 3200, subscriptions: 180 },
  { month: "Feb", income: 5200, expenses: 3100, subscriptions: 175 },
  { month: "Mar", income: 5100, expenses: 3300, subscriptions: 165 },
  { month: "Apr", income: 5300, expenses: 3250, subscriptions: 160 },
  { month: "May", income: 5150, expenses: 3180, subscriptions: 155 },
  { month: "Jun", income: 5400, expenses: 3220, subscriptions: 150 },
]

const categoryData = [
  { name: "Entertainment", value: 25.98, color: "#8884d8" },
  { name: "Software", value: 57.98, color: "#82ca9d" },
  { name: "Health", value: 29.99, color: "#ffc658" },
  { name: "News", value: 12.99, color: "#ff7300" },
]

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [totalSavings, setTotalSavings] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const totalMonthlySpend = mockSubscriptions.reduce((sum, sub) => sum + sub.amount, 0)
  const unusedSubscriptions = mockSubscriptions.filter((sub) => sub.status === "unused")
  const potentialSavings = unusedSubscriptions.reduce((sum, sub) => sum + sub.amount, 0)

  const handleCancelSubscription = async (subscriptionId: number) => {
    setIsAnalyzing(true)
    // Simulate AI-powered cancellation process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setTotalSavings((prev) => prev + unusedSubscriptions.find((sub) => sub.id === subscriptionId)?.amount || 0)
    setIsAnalyzing(false)
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
            <span className="text-xl font-bold text-gray-900">SubSaver Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />3 Accounts Connected
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setSelectedTab("insights")}>
              <Bot className="w-4 h-4 mr-2" />
              AI Chat
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedTab("savings")}>
              <Target className="w-4 h-4 mr-2" />
              Megtakarítások
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Subscriptions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMonthlySpend.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline w-3 h-3 mr-1 text-green-600" />
                12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${potentialSavings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{unusedSubscriptions.length} unused subscriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${totalSavings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockSubscriptions.filter((sub) => sub.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Out of {mockSubscriptions.length} total</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="cashflow">Cashflow</TabsTrigger>
            <TabsTrigger value="insights">AI Chat</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="recommendations">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Categories</CardTitle>
                  <CardDescription>Breakdown of your monthly spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value}`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Recommended actions to save money</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unusedSubscriptions.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{sub.name}</div>
                        <div className="text-sm text-gray-500">${sub.amount}/month • Unused</div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelSubscription(sub.id)}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Bot className="w-4 h-4 mr-2 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>Manage your recurring payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSubscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{sub.name}</div>
                          <div className="text-sm text-gray-500">{sub.category}</div>
                          <div className="text-sm text-gray-500">Next charge: {sub.nextCharge}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">${sub.amount}/month</div>
                          <Badge variant={sub.status === "active" ? "default" : "destructive"}>{sub.status}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={sub.usage === "high" ? 80 : sub.usage === "medium" ? 50 : 20}
                            className="w-16"
                          />
                          <span className="text-xs text-gray-500 w-12">{sub.usage}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cashflow Projection</CardTitle>
                <CardDescription>6-month financial overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                    <Line
                      type="monotone"
                      dataKey="subscriptions"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Subscriptions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AIChat />
          </TabsContent>

          <TabsContent value="savings" className="space-y-6">
            <SavingsTracker />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <BudgetRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
