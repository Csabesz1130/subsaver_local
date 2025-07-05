"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Download, 
  FileText, 
  Mail, 
  Share, 
  Calendar,
  CheckCircle,
  ExternalLink
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: Array<{
    type: string
    label: string
    subscriptionId?: string
    subscriptionName?: string
  }>
}

interface ChatHistoryExportProps {
  messages: ChatMessage[]
  onExport?: (format: string, data: any) => void
}

export default function ChatHistoryExport({ messages, onExport }: ChatHistoryExportProps) {
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "txt" | "pdf">("json")
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  const formatChatForExport = (format: string) => {
    switch (format) {
      case "json":
        return JSON.stringify(messages, null, 2)
      
      case "csv":
        const csvHeader = "Timestamp,Role,Content,Actions\n"
        const csvRows = messages.map(msg => {
          const actions = msg.actions?.map(a => `${a.type}:${a.label}`).join(";") || ""
          return `"${msg.timestamp.toISOString()}","${msg.role}","${msg.content.replace(/"/g, '""')}","${actions}"`
        }).join("\n")
        return csvHeader + csvRows
      
      case "txt":
        return messages.map(msg => {
          const timestamp = msg.timestamp.toLocaleString("hu-HU")
          const role = msg.role === "user" ? "Felhasználó" : "AI Asszisztens"
          const actions = msg.actions?.map(a => `[${a.label}]`).join(" ") || ""
          return `[${timestamp}] ${role}:\n${msg.content}\n${actions ? `Műveletek: ${actions}\n` : ""}\n`
        }).join("\n")
      
      case "pdf":
        // PDF export would require a PDF library like jsPDF
        return "PDF export feature coming soon"
      
      default:
        return JSON.stringify(messages, null, 2)
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    if (messages.length === 0) {
      alert("Nincs exportálható beszélgetés!")
      return
    }

    setIsExporting(true)
    
    try {
      const content = formatChatForExport(exportFormat)
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `subsaver-chat-${timestamp}.${exportFormat}`
      
      const mimeTypes = {
        json: "application/json",
        csv: "text/csv",
        txt: "text/plain",
        pdf: "application/pdf"
      }
      
      downloadFile(content, filename, mimeTypes[exportFormat])
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setExportComplete(true)
      onExport?.(exportFormat, content)
      
      setTimeout(() => setExportComplete(false), 3000)
      
    } catch (error) {
      console.error("Export error:", error)
      alert("Hiba történt az exportálás során!")
    } finally {
      setIsExporting(false)
    }
  }

  const shareViaEmail = () => {
    const content = formatChatForExport("txt")
    const subject = "SubSaver Chat Előzmények"
    const body = encodeURIComponent(`Kedves Címzett,\n\nItt vannak a SubSaver AI chat előzményeim:\n\n${content}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const getFileIcon = (format: string) => {
    switch (format) {
      case "json":
        return <FileText className="h-4 w-4" />
      case "csv":
        return <FileText className="h-4 w-4" />
      case "txt":
        return <FileText className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getExportStats = () => {
    const totalMessages = messages.length
    const userMessages = messages.filter(m => m.role === "user").length
    const aiMessages = messages.filter(m => m.role === "assistant").length
    const actionsCount = messages.reduce((sum, m) => sum + (m.actions?.length || 0), 0)
    
    return {
      totalMessages,
      userMessages,
      aiMessages,
      actionsCount,
      dateRange: messages.length > 0 ? {
        start: messages[0].timestamp,
        end: messages[messages.length - 1].timestamp
      } : null
    }
  }

  const stats = getExportStats()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat előzmények exportálása</DialogTitle>
          <DialogDescription>
            Töltsd le a beszélgetés előzményeit különböző formátumokban
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Statisztika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Összes üzenet:</span>
                <span className="font-medium">{stats.totalMessages}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Felhasználói üzenetek:</span>
                <span className="font-medium">{stats.userMessages}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>AI válaszok:</span>
                <span className="font-medium">{stats.aiMessages}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Műveletek:</span>
                <span className="font-medium">{stats.actionsCount}</span>
              </div>
              {stats.dateRange && (
                <div className="flex justify-between text-sm">
                  <span>Időszak:</span>
                  <span className="font-medium text-xs">
                    {stats.dateRange.start.toLocaleDateString("hu-HU")} - {stats.dateRange.end.toLocaleDateString("hu-HU")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export formátum</label>
            <Select value={exportFormat} onValueChange={(value: "json" | "csv" | "txt" | "pdf") => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON - Strukturált adatok</SelectItem>
                <SelectItem value="csv">CSV - Táblázat</SelectItem>
                <SelectItem value="txt">TXT - Egyszerű szöveg</SelectItem>
                <SelectItem value="pdf">PDF - Formázott dokumentum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleExport} 
              disabled={isExporting || messages.length === 0}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Exportálás...
                </>
              ) : exportComplete ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Sikeres!
                </>
              ) : (
                <>
                  {getFileIcon(exportFormat)}
                  <span className="ml-2">Letöltés ({exportFormat.toUpperCase()})</span>
                </>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={shareViaEmail}
                disabled={messages.length === 0}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email küldése
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  const content = formatChatForExport("txt")
                  navigator.clipboard.writeText(content)
                  alert("Beszélgetés másolva a vágólapra!")
                }}
                disabled={messages.length === 0}
                className="flex-1"
              >
                <Share className="h-4 w-4 mr-2" />
                Másolás
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>JSON:</strong> Teljes adatstruktúra fejlesztők számára</p>
            <p><strong>CSV:</strong> Táblázatkezelő alkalmazásokhoz</p>
            <p><strong>TXT:</strong> Egyszerű szövegformátum</p>
            <p><strong>PDF:</strong> Nyomtatható dokumentum</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}