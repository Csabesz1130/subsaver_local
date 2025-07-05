"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Volume2, 
  VolumeX,
  AlertCircle 
} from "lucide-react"

interface VoiceInputProps {
  onTranscription: (text: string) => void
  onStart?: () => void
  onStop?: () => void
  isDisabled?: boolean
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new(): SpeechRecognition
    }
  }
}

export default function VoiceInput({ onTranscription, onStart, onStop, isDisabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
      }
    }
  }, [])

  const initializeAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      
      microphoneRef.current.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average)
          requestAnimationFrame(updateAudioLevel)
        }
      }
      
      updateAudioLevel()
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Mikrofon hozzáférés megtagadva')
    }
  }

  const startListening = async () => {
    if (!isSupported) {
      setError('Hangfelismerés nem támogatott ebben a böngészőben')
      return
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'hu-HU' // Hungarian language
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError(null)
        onStart?.()
      }
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript)
          onTranscription(finalTranscript)
        }
        
        setInterimTranscript(interimTranscript)
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setError(`Hiba a hangfelismerésben: ${event.error}`)
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
        setInterimTranscript('')
        onStop?.()
      }
      
      await initializeAudioContext()
      recognitionRef.current.start()
      
    } catch (err) {
      console.error('Error starting speech recognition:', err)
      setError('Nem sikerült elindítani a hangfelismerést')
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    // Clean up audio context
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    setIsListening(false)
    setAudioLevel(0)
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <MicOff className="h-4 w-4" />
        <span className="text-sm">Hangfelismerés nem támogatott</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={toggleListening}
        disabled={isDisabled}
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        className="relative"
      >
        {isListening ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Leállítás
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Beszéd
          </>
        )}
      </Button>
      
      {isListening && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Volume2 className="h-3 w-3" />
            <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
              />
            </div>
          </Badge>
          
          {interimTranscript && (
            <Badge variant="secondary" className="max-w-xs truncate">
              {interimTranscript}
            </Badge>
          )}
        </div>
      )}
      
      {error && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </Badge>
      )}
    </div>
  )
}