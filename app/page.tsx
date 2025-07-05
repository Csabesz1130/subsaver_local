import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, TrendingUp, Bot, CreditCard, PieChart } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SubSaver</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              How it Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Bot className="w-4 h-4 mr-1" />
            AI-Powered Subscription Management
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Stop Paying for
            <span className="text-blue-600 block">Forgotten Subscriptions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Our AI analyzes your bank transactions, identifies recurring subscriptions, and automatically cancels the
            ones you don't use. Save hundreds every month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg px-8 py-6"
              asChild
            >
              <Link href="/dashboard" className="flex items-center justify-center">
                <span className="relative z-10 flex items-center">
                  Start Saving Money
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group border-2 border-blue-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm hover:bg-white text-blue-700 hover:text-blue-800 text-lg px-8 py-6 transition-all duration-300 hover:shadow-lg"
            >
              <span className="flex items-center">
                Watch Demo
                <div className="ml-2 w-5 h-5 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors duration-300">
                  <div className="w-0 h-0 border-l-[6px] border-l-blue-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5" />
                </div>
              </span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">$247</div>
              <div className="text-gray-600">Average monthly savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">12.3</div>
              <div className="text-gray-600">Subscriptions found per user</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">98%</div>
              <div className="text-gray-600">Success rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Smart Savings</h2>
            <p className="text-xl text-gray-600">Everything you need to take control of your recurring expenses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>AI Transaction Analysis</CardTitle>
                <CardDescription>
                  Advanced AI categorizes and identifies recurring charges automatically
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Bank-Grade Security</CardTitle>
                <CardDescription>256-bit encryption and read-only access to your financial data</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Auto-Cancellation</CardTitle>
                <CardDescription>RPA technology cancels unwanted subscriptions automatically</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-orange-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Cashflow Projections</CardTitle>
                <CardDescription>Predict future expenses and optimize your spending patterns</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <PieChart className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Spending Insights</CardTitle>
                <CardDescription>Detailed analytics and recommendations for better financial health</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-indigo-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Multi-Bank Support</CardTitle>
                <CardDescription>Connect multiple accounts from 10,000+ financial institutions</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How SubSaver Works</h2>
            <p className="text-xl text-gray-600">Get started in minutes and start saving immediately</p>
          </div>
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Accounts</h3>
                <p className="text-gray-600 text-lg">
                  Securely link your bank accounts and credit cards using bank-grade encryption. We only need read-only
                  access to analyze your transactions.
                </p>
              </div>
              <div className="flex-1 bg-white p-8 rounded-xl shadow-lg">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-16 h-16 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analyzes Your Data</h3>
                <p className="text-gray-600 text-lg">
                  Our advanced AI scans your transaction history, identifies recurring charges, and categorizes all your
                  subscriptions with 98% accuracy.
                </p>
              </div>
              <div className="flex-1 bg-white p-8 rounded-xl shadow-lg">
                <div className="h-32 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <Bot className="w-16 h-16 text-green-600" />
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Auto-Cancel Unwanted Subs</h3>
                <p className="text-gray-600 text-lg">
                  Review your subscriptions and let our RPA technology automatically cancel the ones you don't want. We
                  handle the entire process for you.
                </p>
              </div>
              <div className="flex-1 bg-white p-8 rounded-xl shadow-lg">
                <div className="h-32 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <Zap className="w-16 h-16 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Stop Wasting Money?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have saved over $2.4M in subscription fees
          </p>
          <Button
            size="lg"
            className="group relative overflow-hidden bg-white text-blue-600 hover:text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg px-8 py-6"
            asChild
          >
            <Link href="/dashboard" className="flex items-center justify-center">
              <span className="relative z-10 flex items-center font-semibold">
                Start Your Free Analysis
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">SubSaver</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 SubSaver. All rights reserved. Bank-grade security guaranteed.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
