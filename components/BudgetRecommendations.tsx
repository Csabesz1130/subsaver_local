"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calculator,
  Lightbulb,
  PieChart,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface BudgetCategory {
  name: string
  current: number
  recommended: number
  industry_average: number
  color: string
  optimization_potential: number
}

interface BudgetRecommendation {
  id: string
  type: "reduce" | "optimize" | "eliminate" | "consolidate"
  title: string
  description: string
  current_cost: number
  potential_savings: number
  difficulty: "easy" | "medium" | "hard"
  timeline: string
  priority: "high" | "medium" | "low"
  action_steps: string[]
}

const mockBudgetData: BudgetCategory[] = [
  {
    name: "Szórakozás",
    current: 27.98,
    recommended: 25.00,
    industry_average: 35.00,
    color: "#8884d8",
    optimization_potential: 2.98
  },
  {
    name: "Szoftver",
    current: 57.98,
    recommended: 35.00,
    industry_average: 45.00,
    color: "#82ca9d",
    optimization_potential: 22.98
  },
  {
    name: "Egészség",
    current: 29.99,
    recommended: 0.00,
    industry_average: 25.00,
    color: "#ffc658",
    optimization_potential: 29.99
  },
  {
    name: "Hírek",
    current: 12.99,
    recommended: 0.00,
    industry_average: 8.00,
    color: "#ff7300",
    optimization_potential: 12.99
  }
]

const mockRecommendations: BudgetRecommendation[] = [
  {
    id: "gym-cancel",
    type: "eliminate",
    title: "Edzőterem tagság lemondása",
    description: "3 hónapja nem használt edzőterem tagság - azonnali megtakarítás",
    current_cost: 29.99,
    potential_savings: 359.88,
    difficulty: "medium",
    timeline: "Azonnali",
    priority: "high",
    action_steps: [
      "Hívd fel az edzőtermet",
      "Kérd a lemondást",
      "Kerüld el a megtartási ajánlatokat",
      "Kérj írásos megerősítést"
    ]
  },
  {
    id: "adobe-downgrade",
    type: "optimize",
    title: "Adobe előfizetés csökkentése",
    description: "Váltás Photography Plan-re a teljes Creative Suite helyett",
    current_cost: 52.99,
    potential_savings: 516.00,
    difficulty: "easy",
    timeline: "Következő számlázási ciklus",
    priority: "high",
    action_steps: [
      "Értékeld a használt Adobe alkalmazásokat",
      "Váltás Photography Plan-re ($9.99/hó)",
      "Alternatív ingyenes szoftverek keresése",
      "Data exportálása váltás előtt"
    ]
  },
  {
    id: "streaming-consolidate",
    type: "consolidate",
    title: "Streaming szolgáltatások optimalizálása",
    description: "Netflix + Spotify bundle vagy alternatív szolgáltatók",
    current_cost: 27.98,
    potential_savings: 84.00,
    difficulty: "easy",
    timeline: "1-2 hét",
    priority: "medium",
    action_steps: [
      "Családi Netflix előfizetés megosztása",
      "YouTube Premium váltás Spotify helyett",
      "Ingyen streaming alternatívák tesztelése",
      "Havonta váltogatás különböző szolgáltatók között"
    ]
  },
  {
    id: "news-eliminate",
    type: "eliminate",
    title: "Hírek előfizetés lemondása",
    description: "Ingyenes híroldalak használata a fizetős helyett",
    current_cost: 12.99,
    potential_savings: 155.88,
    difficulty: "easy",
    timeline: "Azonnali",
    priority: "medium",
    action_steps: [
      "Ingyenes híroldalak listázása",
      "RSS feed beállítása",
      "Könyvtári hozzáférés ellenőrzése",
      "Előfizetés lemondása"
    ]
  }
]

export default function BudgetRecommendations() {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)
  const [implementedRecommendations, setImplementedRecommendations] = useState<string[]>([])

  const totalCurrentSpend = mockBudgetData.reduce((sum, cat) => sum + cat.current, 0)
  const totalRecommendedSpend = mockBudgetData.reduce((sum, cat) => sum + cat.recommended, 0)
  const totalPotentialSavings = mockRecommendations.reduce((sum, rec) => sum + rec.potential_savings, 0)
  const industryAverage = mockBudgetData.reduce((sum, cat) => sum + cat.industry_average, 0)

  const getDifficultyColor = (difficulty: BudgetRecommendation['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: BudgetRecommendation['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: BudgetRecommendation['type']) => {
    switch (type) {
      case 'eliminate': return <TrendingDown className="h-4 w-4" />
      case 'optimize': return <Target className="h-4 w-4" />
      case 'consolidate': return <PieChart className="h-4 w-4" />
      case 'reduce': return <Calculator className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const implementRecommendation = (id: string) => {
    setImplementedRecommendations(prev => [...prev, id])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jelenlegi költés</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentSpend)}</div>
            <p className="text-xs text-muted-foreground">
              Havonta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ajánlott költés</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRecommendedSpend)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalRecommendedSpend / totalCurrentSpend) * 100).toFixed(0)}% a jelenlegi költésből
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lehetséges megtakarítás</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPotentialSavings)}</div>
            <p className="text-xs text-muted-foreground">
              Évente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Iparági átlag</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(industryAverage)}</div>
            <p className="text-xs text-muted-foreground">
              {totalCurrentSpend < industryAverage ? 'Átlag alatt' : 'Átlag felett'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Javaslatok</TabsTrigger>
          <TabsTrigger value="categories">Kategóriák</TabsTrigger>
          <TabsTrigger value="comparison">Összehasonlítás</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Személyre szabott javaslatok
              </CardTitle>
              <CardDescription>
                Ezek az AI által generált javaslatok segítenek optimalizálni a költségvetést
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecommendations.map((recommendation) => {
                  const isImplemented = implementedRecommendations.includes(recommendation.id)
                  
                  return (
                    <div
                      key={recommendation.id}
                      className={`p-4 border rounded-lg transition-all ${
                        selectedRecommendation === recommendation.id ? 'ring-2 ring-blue-500' : ''
                      } ${isImplemented ? 'opacity-50 bg-gray-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getTypeIcon(recommendation.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{recommendation.title}</h3>
                              <Badge className={getPriorityColor(recommendation.priority)}>
                                {recommendation.priority === 'high' ? 'Magas' : recommendation.priority === 'medium' ? 'Közepes' : 'Alacsony'}
                              </Badge>
                              <Badge className={getDifficultyColor(recommendation.difficulty)}>
                                {recommendation.difficulty === 'easy' ? 'Könnyű' : recommendation.difficulty === 'medium' ? 'Közepes' : 'Nehéz'}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Jelenlegi költés:</span>
                                <div className="font-medium">{formatCurrency(recommendation.current_cost)}/hó</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Éves megtakarítás:</span>
                                <div className="font-medium text-green-600">{formatCurrency(recommendation.potential_savings)}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Időkeret:</span>
                                <div className="font-medium">{recommendation.timeline}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isImplemented ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRecommendation(
                                  selectedRecommendation === recommendation.id ? null : recommendation.id
                                )}
                              >
                                {selectedRecommendation === recommendation.id ? 'Bezárás' : 'Részletek'}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => implementRecommendation(recommendation.id)}
                              >
                                Megvalósítás
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {selectedRecommendation === recommendation.id && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Megvalósítási lépések:</h4>
                          <ol className="space-y-2">
                            {recommendation.action_steps.map((step, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kategóriánkénti elemzés</CardTitle>
              <CardDescription>
                Költségeid kategóriák szerint bontva és optimalizálási lehetőségek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="current" fill="#8884d8" name="Jelenlegi" />
                  <Bar dataKey="recommended" fill="#82ca9d" name="Ajánlott" />
                  <Bar dataKey="industry_average" fill="#ffc658" name="Iparági átlag" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Jelenlegi vs Ajánlott</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Jelenlegi', value: totalCurrentSpend, fill: '#ef4444' },
                        { name: 'Ajánlott', value: totalRecommendedSpend, fill: '#22c55e' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }: { name: string; value: number }) => `${name}: ${formatCurrency(value)}`}
                    >
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Megtakarítási potential</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockBudgetData.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category.name}</span>
                      <span className="font-medium">{formatCurrency(category.optimization_potential)}</span>
                    </div>
                    <Progress 
                      value={(category.optimization_potential / category.current) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}