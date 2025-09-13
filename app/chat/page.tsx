"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, FileText, Clock, AlertTriangle, Lightbulb, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "suggestion" | "document-analysis"
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "नमस्ते! मैं आपका AI कानूनी सहायक हूँ। आपके दस्तावेज़ों के बारे में कोई भी प्रश्न पूछें।",
      sender: "ai",
      timestamp: new Date(),
      type: "text",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestedQuestions = ["मुख्य जोखिम क्या है?", "समय सीमा कब तक है?", "भुगतान की शर्तें क्या हैं?"]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        content: getAIResponse(inputMessage),
        sender: "ai",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getAIResponse = (question: string): string => {
    const responses = {
      "मुख्य जोखिम":
        "आपके सेवा समझौते में मुख्य जोखिम यह है कि रद्दीकरण की नीति स्पष्ट नहीं है। यदि आप सेवा रद्द करना चाहते हैं, तो आपको 30 दिन का नोटिस देना होगा।",
      "समय सीमा":
        "आपके दस्तावेज़ के अनुसार, भुगतान की समय सीमा 15 दिन है। यदि आप इस समय सीमा का पालन नहीं करते हैं, तो 2% प्रति माह का जुर्माना लगेगा।",
      भुगतान: "भुगतान की शर्तें: मासिक आधार पर ₹5,000, 15 दिन के भीतर भुगतान करना आवश्यक है। देर से भुगतान पर 2% मासिक जुर्माना।",
    }

    for (const [key, response] of Object.entries(responses)) {
      if (question.toLowerCase().includes(key.toLowerCase())) {
        return response
      }
    }

    return "मैं आपके प्रश्न को समझने की कोशिश कर रहा हूँ। कृपया अधिक विशिष्ट जानकारी दें या अपने दस्तावेज़ के बारे में पूछें।"
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("hi-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Page Title */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI सहायक से पूछें</h1>
                <p className="text-gray-600">अपने दस्तावेज़ों के बारे में कोई भी प्रश्न पूछें और तुरंत उत्तर प्राप्त करें</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Bot className="h-4 w-4 mr-1" />
                ऑनलाइन
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-3 max-w-2xl ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={
                        message.sender === "user" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                      }
                    >
                      {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-4 ${
                      message.sender === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-2xl">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">सुझाए गए प्रश्न:</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-sm"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="अपना प्रश्न यहाँ लिखें..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="pr-12"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="space-y-6">
            {/* Current Document */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  कानूनी दस्तावेज़ चैट सहायक
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Bot className="h-4 w-4" />
                  <span>नमस्ते! मैं आपका AI कानूनी सहायक हूँ। आपके दस्तावेज़ों के बारे में कोई भी प्रश्न पूछें।</span>
                </div>
                <p className="text-xs text-gray-500">02:37 pm</p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">त्वरित कार्य</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  दस्तावेज़ विश्लेषण
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  जोखिम मूल्यांकन
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  AI सहायक
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Clock className="h-4 w-4 mr-2" />
                  अनुबंध समीक्षा
                </Button>
              </CardContent>
            </Card>

            {/* Recent Chats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">हाल की चर्चाएं</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">सेवा समझौता प्रश्न</span>
                  </div>
                  <p className="text-xs text-gray-500">2 घंटे पहले</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">किराया अनुबंध समीक्षा</span>
                  </div>
                  <p className="text-xs text-gray-500">1 दिन पहले</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
