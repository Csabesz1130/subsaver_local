"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Calendar,
  Trophy,
  PiggyBank,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SavingsData {
  month: string
  totalSaved: number
  subscriptionsCancelled: number
  targetAmount: number
}

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  description: string
  priority: "high" | "medium" | "low"
}

const mockSavingsData: SavingsData[] = [
  { month: "Jan", totalSaved: 0, subscriptionsCancelled: 0, targetAmount: 100 },
  { month: "Feb", totalSaved: 29.99, subscriptionsCancelled: 1, targetAmount: 100 },
  { month: "Mar", totalSaved: 59.98, subscriptionsCancelled: 2, targetAmount: 100 },
  { month: "Apr", totalSaved: 89.97, subscriptionsCancelled: 3, targetAmount: 100 },
  { month: "May", totalSaved: 119.96, subscriptionsCancelled: 4, targetAmount: 100 },
  { month: "Jun", totalSaved: 149.95, subscriptionsCancelled: 5, targetAmount: 100 },
]

const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "emergency-fund",
    name: "Vészhelyzeti alap",
    targetAmount: 1000,
    currentAmount: 456,
    targetDate: "2024-12-31",
    description: "3 havi kiadás fedezése",
    priority: "high"
  },
  {
    id: "vacation",
    name: "Nyaralás",
    targetAmount: 2000,
    currentAmount: 680,
    targetDate: "2024-08-15",
    description: "Európai körutazás",
    priority: "medium"
  },
  {
    id: "tech-upgrade",
    name: "Laptop csere",
    targetAmount: 1500,
    currentAmount: 230,
    targetDate: "2024-10-01",
    description: "Új MacBook Pro",
    priority: "low"
  }
]

export default function SavingsTracker() {
  const [totalSaved, setTotalSaved] = useState(149.95)
  const [monthlyTarget, setMonthlyTarget] = useState(200)
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(mockSavingsGoals)
  const [selectedTimeframe, setSelectedTimeframe] = useState<"month" | "quarter" | "year">("month")

  const currentMonth = new Date().getMonth() + 1
  const progressPercentage = Math.min((totalSaved / monthlyTarget) * 100, 100)
  const isAheadOfTarget = totalSaved > monthlyTarget * 0.8

  const getPriorityColor = (priority: SavingsGoal['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const calculateProjection = () => {
    const monthlyAverage = totalSaved / 6 // 6 months of data
    const remainingMonths = 12 - currentMonth
    return monthlyAverage * remainingMonths
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összesen megtakarítva</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSaved)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              +{formatCurrency(29.99)} ez a hónapban
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Havi cél</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyTarget)}</div>
            <Progress value={progressPercentage} className="mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {progressPercentage.toFixed(0)}% teljesítve
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Éves prognózis</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalSaved + calculateProjection())}
            </div>
            <div className="text-xs text-muted-foreground">
              Jelenlegi ütem alapján
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Megtakarítások trendje</CardTitle>
          <CardDescription>
            Havi megtakarítások és lemondott előfizetések száma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockSavingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  formatCurrency(Number(value)), 
                  name === 'totalSaved' ? 'Megtakarítás' : 'Lemondott előfizetések'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="totalSaved" 
                stroke="#10b981" 
                strokeWidth={3}
                name="totalSaved"
              />
              <Line 
                type="monotone" 
                dataKey="subscriptionsCancelled" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="subscriptionsCancelled"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Savings Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Megtakarítási célok
          </CardTitle>
          <CardDescription>
            Állítsd be és kövesd a pénzügyi céljaidat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {savingsGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const daysRemaining = Math.ceil(
                (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              )
              
              return (
                <div key={goal.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{goal.name}</div>
                        <div className="text-sm text-gray-500">{goal.description}</div>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                        {goal.priority === 'high' ? 'Magas' : goal.priority === 'medium' ? 'Közepes' : 'Alacsony'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {daysRemaining > 0 ? `${daysRemaining} nap hátra` : 'Lejárt'}
                      </div>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {progress.toFixed(0)}% teljesítve
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Gyors műveletek</CardTitle>
          <CardDescription>
            Javítsd a megtakarításaidat ezekkel a javaslatokkal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div className="font-medium">Automatikus megtakarítás</div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Állíts be automatikus átutalást a megtakarítási céljaiddal.
              </p>
              <Button size="sm" variant="outline">
                Beállítás
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div className="font-medium">Havi áttekintés</div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Kapj értesítést a havi megtakarítások teljesítményéről.
              </p>
              <Button size="sm" variant="outline">
                Értesítés bekapcsolása
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}