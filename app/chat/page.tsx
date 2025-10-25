// app/chat/page.tsx
"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react"; // Added useCallback
import { useSearchParams, useRouter } from 'next/navigation'; // Import useRouter
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { Send, Bot, User, FileText, Clock, AlertTriangle, Lightbulb, MessageSquare, BookOpen, ChevronDown, Copy, Check, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react"; // Added Copy, Check, Thumbs icons, Trash2
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"; // Import Collapsible
import { toast } from "sonner"; // Import toast for copy feedback

// --- Constants ---
const LOCALSTORAGE_CONTEXT_KEY = 'nyaySaarthi_chatContextFile';

interface Message {
  id: number | string; // Allow string IDs for potential future use
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  type?: "text" | "suggestion" | "document-analysis" | "context-info"; // Added context-info
  sources?: { content: string; page: number | string }[]; // Allow page number to be string or number
}

// Wrap the main component logic in a new component to use Suspense
function ChatComponent() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize useRouter if needed for other actions
  const urlContextFile = searchParams.get('contextFile');
  const [contextFileName, setContextFileName] = useState<string | null>(null);

  // State for copy button feedback
  const [copiedMessageId, setCopiedMessageId] = useState<string | number | null>(null);

  // --- Context Persistence Logic ---
  useEffect(() => {
    let initialContext: string | null = null;
    // 1. Prioritize URL parameter
    if (urlContextFile) {
      initialContext = decodeURIComponent(urlContextFile);
      // Store it in localStorage for persistence
      try {
        localStorage.setItem(LOCALSTORAGE_CONTEXT_KEY, initialContext);
        console.log("Context set from URL:", initialContext); // Debug log
      } catch (e) {
        console.warn("localStorage not available or failed to set item.");
      }
    } else {
      // 2. Fallback to localStorage if no URL param
      try {
        initialContext = localStorage.getItem(LOCALSTORAGE_CONTEXT_KEY);
        console.log("Context read from localStorage:", initialContext); // Debug log
      } catch (e) {
        console.warn("localStorage not available or failed to get item.");
      }
    }
    setContextFileName(initialContext);
  }, [urlContextFile]); // Re-run only if URL parameter changes

  // --- Initial Messages Logic ---
  const getInitialMessages = useCallback((): Message[] => {
    console.log("getInitialMessages called with context:", contextFileName); // Debug log
    const baseMessages: Message[] = [
      {
        id: 1,
        content: "नमस्ते! मैं आपका AI कानूनी सहायक हूँ। आपके दस्तावेज़ों के बारे में कोई भी प्रश्न पूछें।",
        sender: "ai",
        timestamp: new Date(),
        type: "text",
      }
    ];
    if (contextFileName) { // Use state variable here
      return [
        ...baseMessages,
        {
          id: 'context-info',
          content: `फ़ाइल "${contextFileName}" के संदर्भ में पूछ रहे हैं।`,
          sender: "ai" as const,
          timestamp: new Date(),
          type: "context-info" as const,
        }
      ];
    }
    return baseMessages;
  }, [contextFileName]); // Re-run when contextFileName changes

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set initial messages once context is determined and changes
  useEffect(() => {
    setMessages(getInitialMessages());
  }, [getInitialMessages]); // Dependency on the memoized function

  // --- Other Functions (scrollToBottom, handleSendMessage, etc.) ---
  const suggestedQuestions = ["मुख्य जोखिम क्या है?", "समय सीमा कब तक है?", "भुगतान की शर्तें क्या हैं?"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message sending (API call)
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(), // Use timestamp string for unique ID
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage; // Store input before clearing
    setInputMessage("");
    setIsTyping(true);

    try {
      // **IMPORTANT**: You might need to send contextFileName or a relevant ID to the backend
      const requestBody = {
        question: currentInput,
        // contextId: backendFileId // Example if you stored an ID
        // contextFileName: contextFileName // Send filename if backend expects it
      };
      console.log("Sending to API:", requestBody); // Debug log

      const response = await fetch("https://parrth020-nyay-saarthi-ai-agent.hf.space/ask/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("API Response Status:", response.status); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText); // Debug log
        throw new Error(`API Error: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response Data:", data); // Debug log

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(), // Unique ID
        content: data.answer || "मुझे उत्तर नहीं मिल सका।", // Fallback message
        sender: "ai",
        timestamp: new Date(),
        type: "text",
        sources: data.sources?.map((s: any) => ({ // Safely map sources
            content: s.content || "N/A",
            // Adapt based on actual backend response structure for page number
            page: s.page ?? s.metadata?.page_number ?? "N/A"
        })) || [],
      };
      setMessages((prev) => [...prev, aiResponse]);

    } catch (error: any) {
      console.error("API Fetch Error:", error); // Log the error
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(), // Unique ID
        content: `क्षमा करें, मुझे एक त्रुटि आई (${error.message || 'Unknown error'}). कृपया पुनः प्रयास करें।`,
        sender: "ai",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    // Optionally trigger send directly by uncommenting the line below
    // handleSendMessage();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("hi-IN", { // Use hi-IN for Hindi locale time
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // --- End Functions ---

  // --- Copy Function ---
  const handleCopy = (content: string, messageId: string | number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      toast.success("Message copied to clipboard!");
      setTimeout(() => setCopiedMessageId(null), 1500); // Reset icon after 1.5s
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error("Failed to copy message.");
    });
  };

  // --- Clear Chat Function ---
  const handleClearChat = () => {
    // Optional: Clear context from localStorage too
     try {
         localStorage.removeItem(LOCALSTORAGE_CONTEXT_KEY);
         console.log("Cleared context from localStorage"); // Debug log
     } catch (e) {
         console.warn("localStorage not available or failed to remove item.");
     }
     setContextFileName(null); // Clear context state immediately
    // Reset messages based on the now-cleared context
    setMessages(getInitialMessages());
    toast.info("Chat history and context cleared.");
  };

  // --- Placeholder Feedback Function ---
  const handleFeedback = (messageId: string | number, feedback: 'good' | 'bad') => {
      console.log(`Feedback for message ${messageId}: ${feedback}`);
      toast.info("धन्यवाद! आपका फ़ीडबैक दर्ज कर लिया गया है।"); // Simple feedback
      // Here you would typically send this feedback to your backend API
  };

  // --- JSX ---
  return (
    <div className="flex h-[calc(100vh-80px)]"> {/* Main container */}
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Page Title */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-grow min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">AI सहायक से पूछें</h1>
              <p className="text-gray-600 text-xs md:text-sm truncate">
                {contextFileName
                  ? `"${contextFileName}" के बारे में प्रश्न पूछें`
                  : "अपने दस्तावेज़ों के बारे में प्रश्न पूछें"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Clear Chat Button */}
               <Tooltip>
                   <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" onClick={handleClearChat} className="text-gray-500 hover:text-red-600 h-8 w-8">
                           <Trash2 className="h-4 w-4" />
                       </Button>
                   </TooltipTrigger>
                   <TooltipContent side="bottom" className="text-xs">
                       Clear Chat & Context
                   </TooltipContent>
               </Tooltip>

              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Bot className="h-4 w-4 mr-1" />
                ऑनलाइन
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start gap-3 max-w-xl md:max-w-2xl ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "flex items-center justify-center rounded-full", // Base styles
                    message.sender === "user" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                  )}>
                    {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                {/* Message Bubble Group */}
                <div className="group relative"> {/* Add group relative for positioning buttons */}
                  <div className={cn(
                    "rounded-lg p-3 md:p-4 shadow-sm",
                    message.sender === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-800",
                    message.type === 'context-info' ? 'bg-amber-50 border-amber-200 text-amber-800 italic' : ''
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    {/* Collapsible Sources Section */}
                    {message.sender === "ai" && message.sources && message.sources.length > 0 && (
                      <Collapsible className="mt-3">
                        <CollapsibleTrigger asChild>
                           <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-700">
                              <BookOpen className="h-3 w-3 mr-1"/>
                              स्रोत देखें ({message.sources.length})
                             <ChevronDown className="h-3 w-3 ml-1 transition-transform duration-200 data-[state=open]:rotate-180" />
                           </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2 animate-accordion-down overflow-hidden">
                          <div className="border-l-2 border-gray-300 pl-3 space-y-2">
                              {message.sources.map((source, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200 text-xs text-gray-700">
                                  <p className="line-clamp-3 mb-1 italic">"{source.content}"</p>
                                  <p className="font-medium">पृष्ठ: {source.page}</p>
                                </div>
                              ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Timestamp & Action Buttons (only for AI text messages) */}
                    {message.sender === 'ai' && message.type === 'text' && (
                        <div className="flex justify-end items-center gap-1 mt-2 pt-1 border-t border-gray-200/50"> {/* Reduced gap */}
                            {/* Feedback Buttons */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-green-600" onClick={() => handleFeedback(message.id, 'good')}>
                                        <ThumbsUp className="h-3.5 w-3.5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">अच्छा जवाब</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={() => handleFeedback(message.id, 'bad')}>
                                        <ThumbsDown className="h-3.5 w-3.5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">खराब जवाब</TooltipContent>
                            </Tooltip>

                            {/* Copy Button */}
                            <Tooltip>
                               <TooltipTrigger asChild>
                                   <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-6 w-6 text-gray-400 hover:text-blue-600"
                                       onClick={() => handleCopy(message.content, message.id)}
                                   >
                                       {copiedMessageId === message.id ? <Check className="h-3.5 w-3.5 text-green-600"/> : <Copy className="h-3.5 w-3.5"/>}
                                   </Button>
                               </TooltipTrigger>
                               <TooltipContent side="bottom" className="text-xs">Copy</TooltipContent>
                             </Tooltip>
                              {/* Timestamp */}
                             <p className="text-xs text-gray-400 ml-auto pl-2">
                                {formatTime(message.timestamp)}
                              </p>
                        </div>
                    )}
                    {/* Timestamp for User messages */}
                     {message.sender === 'user' && (
                         <p className={`text-xs mt-2 text-right text-blue-100 opacity-80`}>
                            {formatTime(message.timestamp)}
                          </p>
                     )}
                     {/* Timestamp for AI Context message */}
                     {message.type === 'context-info' && (
                         <p className={`text-xs mt-2 text-right text-amber-600 opacity-80`}>
                            {formatTime(message.timestamp)}
                          </p>
                     )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
             <div className="flex justify-start">
               <div className="flex items-start gap-3 max-w-2xl">
                 <Avatar className="h-8 w-8 flex-shrink-0">
                   <AvatarFallback className="bg-green-100 text-green-600">
                     <Bot className="h-4 w-4" />
                   </AvatarFallback>
                 </Avatar>
                 <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                   <div className="flex space-x-1.5">
                     <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                     <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                   </div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {(messages.length === 1 || (messages.length === 2 && messages[1]?.type === 'context-info')) && !isTyping && (
          <div className="px-6 pb-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
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
        <div className="border-t border-gray-200 bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="अपना प्रश्न यहाँ लिखें..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } } }
                className="pr-12 h-10 md:h-11"
                disabled={isTyping}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Sidebar with Tooltips --- */}
      <TooltipProvider delayDuration={100}> {/* Wrap sidebar content in provider */}
        <div className="w-64 md:w-80 bg-white border-l border-gray-200 p-4 md:p-6 hidden lg:block overflow-y-auto"> {/* Adjusted width, hide on smaller screens, added scroll */}
          <div className="space-y-6">
            {/* Current Document (Shows contextFileName) */}
             <Card>
               <CardHeader className="pb-3">
                 <CardTitle className="text-base md:text-lg flex items-center gap-2">
                   <FileText className="h-5 w-5" />
                   चैट संदर्भ
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {contextFileName ? (
                   <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-gray-600 truncate cursor-help">
                            फ़ाइल: {contextFileName} {/* No need to decode here if already decoded */}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start">
                        {contextFileName} {/* Show full name on hover */}
                      </TooltipContent>
                   </Tooltip>
                 ) : (
                   <p className="text-sm text-gray-500 italic">
                     कोई विशिष्ट दस्तावेज़ चयनित नहीं है।
                   </p>
                 )}
               </CardContent>
             </Card>

            {/* Quick Actions with Tooltips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">त्वरित कार्य</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent font-normal text-sm" onClick={() => alert('Start Document Analysis...')}>
                          <FileText className="h-4 w-4 mr-2" />
                          दस्तावेज़ विश्लेषण
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                        दस्तावेज़ का विस्तृत विश्लेषण शुरू करें।
                    </TooltipContent>
                  </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent font-normal text-sm" onClick={() => alert('Start Risk Assessment...')}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          जोखिम मूल्यांकन
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                        दस्तावेज़ में संभावित जोखिमों की पहचान करें।
                    </TooltipContent>
                  </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent font-normal text-sm" onClick={() => alert('Get AI Suggestions...')}>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          AI सुझाव
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                        दस्तावेज़ में सुधार के लिए AI सुझाव प्राप्त करें।
                    </TooltipContent>
                  </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent font-normal text-sm" onClick={() => alert('Start Contract Review...')}>
                          <Clock className="h-4 w-4 mr-2" />
                          अनुबंध समीक्षा
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                        अनुबंध की शर्तों और समय-सीमाओं की समीक्षा करें।
                    </TooltipContent>
                  </Tooltip>
              </CardContent>
            </Card>

            {/* Recent Chats (Placeholder with Empty State) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">हाल की चर्चाएं</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 {/* --- Empty State for Recent Chats --- */}
                 <div className="text-center py-4">
                     <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                     <p className="text-sm text-gray-500 italic">कोई हाल की चर्चा नहीं।</p>
                 </div>
                 {/* --- End Empty State --- */}
                 {/* Add dynamic recent chats here later */}
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
      {/* --- End Sidebar --- */}
    </div>
  );
}

// Export default wrapper using Suspense for useSearchParams
export default function ChatPage() {
    return (
        // Added Suspense wrapper for ChatComponent
        <Suspense fallback={<div className="flex h-[calc(100vh-80px)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}>
            <ChatComponent />
        </Suspense>
    );
}

// NO DUPLICATED AccountSettingsPage function should be below this line