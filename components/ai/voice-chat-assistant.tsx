"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Mic, MicOff, X, Send, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIAPI } from "@/lib/api"
import { useRestaurantStore } from "@/store/restaurant-store"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  isVoice?: boolean
}

// Declare SpeechRecognition interface
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    SpeechSynthesisUtterance: any
  }
}

export function VoiceChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your voice assistant. I can help you with menu recommendations, dietary information, or answer any questions about our dishes. What would you like to know?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { restaurant } = useRestaurantStore()
  const recognitionRef = useRef<any | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Speech Recognition setup
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
          // Auto-send voice message
          handleSend(transcript, true)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      // Speech Synthesis setup
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis
      }
    }

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      setIsListening(false)
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
          setIsListening(true)
        } catch (error) {
          console.error("Speech recognition error:", error)
        }
      } else {
        alert("Speech recognition is not supported in your browser.")
      }
    }
  }

  const speakText = (text: string) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      if (synthRef.current.speaking) {
        synthRef.current.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSend = async (messageText = input, isVoiceMessage = false) => {
    if (!messageText.trim() || !restaurant) return

    const userMessage = messageText.trim()
    if (!isVoiceMessage) {
      setInput("")
    }

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage, isVoice: isVoiceMessage }])

    // Show loading state
    setIsLoading(true)

    try {
      // Call AI API
      const response = await AIAPI.askQuestion(restaurant.id, userMessage)

      // Add assistant response
      setMessages((prev) => [...prev, { role: "assistant", content: response }])

      // Speak the response if it was a voice message
      if (isVoiceMessage) {
        speakText(response)
      }
    } catch (error) {
      console.error("AI Assistant error:", error)
      // Add error message
      const errorMessage = "Sorry, I encountered an error. Please try again later."
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ])

      if (isVoiceMessage) {
        speakText(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <Button
        className="fixed bottom-20 right-4 rounded-full h-12 w-12 shadow-ios-lg z-40"
        onClick={() => setOpen(true)}
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="ios-card fixed bottom-0 left-0 right-0 sm:relative sm:max-w-md w-full sm:h-[600px] h-[70vh] flex flex-col rounded-t-xl sm:rounded-xl overflow-hidden z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h2 className="font-medium">Voice Assistant</h2>
              </div>
              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <Button variant="ghost" size="icon" onClick={stopSpeaking} className="h-8 w-8 rounded-full">
                    <VolumeX className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-50">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl p-3",
                        message.role === "user"
                          ? "bg-ios-blue text-white"
                          : "bg-white/90 dark:bg-black/90 backdrop-blur-md border border-ios-gray-5/50 dark:border-white/10",
                      )}
                    >
                      {message.content}
                      {message.isVoice && (
                        <div className="flex items-center mt-1 text-xs opacity-70">
                          <Mic className="h-3 w-3 mr-1" />
                          <span>Voice message</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-xl p-3 bg-white/90 dark:bg-black/90 backdrop-blur-md border border-ios-gray-5/50 dark:border-white/10">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-ios-gray-1 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-ios-gray-1 animate-bounce delay-75" />
                        <div className="w-2 h-2 rounded-full bg-ios-gray-1 animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-ios-gray-5/50 dark:border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder={isListening ? "Listening..." : "Ask me anything..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading || isListening}
                  className="rounded-full border-ios-gray-5/50"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={toggleListening}
                  className={cn("rounded-full", isListening ? "bg-ios-red text-white" : "bg-ios-blue text-white")}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

