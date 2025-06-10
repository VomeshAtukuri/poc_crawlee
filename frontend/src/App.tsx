"use client"

import type React from "react"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUp, Globe, Loader2, Sparkles, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type Message = {
  text: string
  id: string
  isUser: boolean
}

export default function EnhancedChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your AI assistant. How can I help you today?", id: uuidv4(), isUser: false },
  ])
  const [question, setQuestion] = useState("")
  const [url, setUrl] = useState("")
  const [crawling, setCrawling] = useState(false)
  const [done, setDone] = useState(false)

  const quickPrompts = [
    "What can you help me with?",
    "Explain this topic to me",
    "Summarize the main points",
    "What are the key insights?",
    "Help me understand this better",
  ]

  const handleSendMessage = () => {
    if (!question.trim()) return

    const userMessage: Message = {
      text: question,
      id: uuidv4(),
      isUser: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setQuestion("")
    handleSendRandomAnswer(userMessage.text)
  }

  const handleSendRandomAnswer = async (query: string) => {
    try {
      const response = await fetch("http://localhost:5570/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: query, url }),
      }).then((res) => res.json())

      if (response?.text) {
        setMessages((prev) => [...prev, { text: response.text, id: uuidv4(), isUser: false }])
      } else {
        throw new Error("No response text")
      }
    } catch (err) {
      console.error("Chat error:", err)
      setMessages((prev) => [
        ...prev,
        {
          text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          id: uuidv4(),
          isUser: false,
        },
      ])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendUrl = async () => {
    try {
      setCrawling(true)
      const response = await fetch("http://localhost:5570/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }).then((res) => res.json())

      console.log("Crawl response:", response.message)
      setDone(true)
    } catch (err) {
      console.error("Crawl error:", err)
    } finally {
      setCrawling(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setQuestion(prompt)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-3xl w-full h-[700px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CrawlKit AI</h1>
                <p className="text-blue-100 text-sm">Intelligent web analysis assistant</p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Globe className="h-4 w-4 mr-2" />
                  Crawl Website
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Website Crawler
                  </DialogTitle>
                  <DialogDescription>Enter a website URL to analyze and chat about its content.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-2 py-4">
                    <label className="text-sm font-medium">Website URL</label>
                    <Input
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        setDone(false)
                      }}
                      className="w-full"
                    />
                  {done && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓ Website successfully crawled
                    </Badge>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleSendUrl} disabled={!url.trim() || crawling}>
                    {crawling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing website...
                      </>
                    ) : done ? (
                      <>✓ Crawled Successfully</>
                    ) : (
                      <>
                        <Globe className="h-4 w-4" />
                        Start Crawling
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.isUser ? "flex-row-reverse" : ""}`}>
                <Avatar
                  className={"bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm"}
                >
                  <AvatarFallback
                    className={message.isUser ? "text-gray-800 font-semibold" : "text-slate-600 font-semibold"}
                  >
                    {message.isUser ? <User className="h-4 w-4"/> : <Sparkles className="h-4 w-4"/>}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[75%] shadow-sm ${
                    message.isUser
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-md"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>


        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-slate-600 mb-3 font-medium">Quick prompts to get started:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-xs bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

      
        <div className="p-4 bg-slate-50/50 border-t border-slate-200">
          <div className="relative">
            <div className="flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              <Input
                className="flex-1 border-0 bg-transparent px-6 py-4 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about the website or any topic..."
              />
              <Button
                className="m-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm"
                size="icon"
                onClick={handleSendMessage}
                disabled={!question.trim()}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 px-2">Press Enter to send • Shift + Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  )
}
