'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, ShieldCheck, Send, User } from 'lucide-react'

interface Message {
  user: string
  bot: string
}

export default function ComplianceChatbot() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    setMessages((prevMessages) => [...prevMessages, { user: message, bot: '' }])

    try {
      const response = await axios.post('http://localhost:7000/chat', { message })
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { user: message, bot: response.data.message },
      ])
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { user: message, bot: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-xl">
        {/* Chat Header */}
        <CardHeader className="border-b border-gray-200 p-4">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-700 font-semibold">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            Compliance Assistant
          </CardTitle>
        </CardHeader>

        {/* Chat Content */}
        <CardContent className="p-4">
          <ScrollArea className="h-[400px] overflow-y-auto pr-2" ref={scrollAreaRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-4">
                {/* User Message */}
                <div className="flex justify-end items-center space-x-2">
                  <div className="bg-blue-500 text-white rounded-xl px-3 py-2 max-w-[75%] text-sm shadow">
                    {msg.user}
                  </div>
                  <User className="h-5 w-5 text-blue-600" />
                </div>

                {/* Bot Message */}
                {msg.bot && (
                  <div className="flex justify-start items-center space-x-2 mt-2">
                    <Bot className="h-5 w-5 text-gray-500" />
                    <div className="bg-gray-200 text-gray-800 rounded-xl px-3 py-2 max-w-[75%] text-sm shadow">
                      {msg.bot}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>

        {/* Chat Input */}
        <CardFooter className="border-t border-gray-200 p-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }} 
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Ask about policies or reimbursements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !message.trim()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
