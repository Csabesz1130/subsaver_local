"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Bell, 
  BellOff, 
  Mail, 
  Smartphone, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  Settings
} from "lucide-react"

interface Notification {
  id: string
  type: "info" | "warning" | "success" | "error"
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
  actionLabel?: string
  category: "subscription" | "savings" | "payment" | "system"
}

interface NotificationSettings {
  email: boolean
  push: boolean
  inApp: boolean
  priceChanges: boolean
  unusedSubscriptions: boolean
  paymentReminders: boolean
  savingsGoals: boolean
  weeklyReports: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "Spotify díjemelés",
    message: "A Spotify Premium előfizetés ára 2 dollárral nőtt",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    category: "subscription",
    actionUrl: "/dashboard",
    actionLabel: "Részletek"
  },
  {
    id: "2",
    type: "success",
    title: "Megtakarítási cél elérve",
    message: "Gratulálunk! Elérted az Emergency Fund cél 50%-át",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    category: "savings",
    actionUrl: "/dashboard",
    actionLabel: "Megtekintés"
  },
  {
    id: "3",
    type: "info",
    title: "Heti összefoglaló",
    message: "Ez a hét 42.99 dollár megtakarítás",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    category: "savings",
    actionUrl: "/dashboard",
    actionLabel: "Jelentés"
  },
  {
    id: "4",
    type: "warning",
    title: "Nem használt előfizetés",
    message: "30 napja nem használtad az edzőterem tagságodat",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    isRead: true,
    category: "subscription",
    actionUrl: "/dashboard",
    actionLabel: "Lemondás"
  }
]

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    inApp: true,
    priceChanges: true,
    unusedSubscriptions: true,
    paymentReminders: true,
    savingsGoals: true,
    weeklyReports: false
  })
  const [showSettings, setShowSettings] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes} perce`
    } else if (hours < 24) {
      return `${hours} órája`
    } else {
      return `${days} napja`
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        console.log('Notification permission granted')
      }
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  if (showSettings) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Értesítési beállítások
          </CardTitle>
          <CardDescription>
            Testreszabhatod, milyen értesítéseket szeretnél kapni
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="font-medium">Értesítési csatornák</div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Alkalmazáson belüli értesítések</span>
                </div>
                <Switch
                  checked={settings.inApp}
                  onCheckedChange={(checked) => updateSettings('inApp', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email értesítések</span>
                </div>
                <Switch
                  checked={settings.email}
                  onCheckedChange={(checked) => updateSettings('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Push értesítések</span>
                </div>
                <Switch
                  checked={settings.push}
                  onCheckedChange={(checked) => updateSettings('push', checked)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-medium">Értesítési típusok</div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Díjváltozások</span>
                </div>
                <Switch
                  checked={settings.priceChanges}
                  onCheckedChange={(checked) => updateSettings('priceChanges', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Nem használt előfizetések</span>
                </div>
                <Switch
                  checked={settings.unusedSubscriptions}
                  onCheckedChange={(checked) => updateSettings('unusedSubscriptions', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Fizetési emlékeztetők</span>
                </div>
                <Switch
                  checked={settings.paymentReminders}
                  onCheckedChange={(checked) => updateSettings('paymentReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Megtakarítási célok</span>
                </div>
                <Switch
                  checked={settings.savingsGoals}
                  onCheckedChange={(checked) => updateSettings('savingsGoals', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Heti összefoglalók</span>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => updateSettings('weeklyReports', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowSettings(false)}>
              Mentés
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Mégse
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Értesítések
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mind olvasott
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Legfrissebb értesítések az előfizetéseidről és megtakarításaidról
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BellOff className="h-8 w-8 mx-auto mb-2" />
              Nincs új értesítés
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} ${
                  !notification.isRead ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {notification.actionUrl && notification.actionLabel && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm">
                      {notification.actionLabel}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}