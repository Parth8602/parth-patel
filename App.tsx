import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GenerateContentResponse } from "@google/genai";
import { Sparkles, Trash2, Menu } from 'lucide-react';
import { Message, Role } from './types';
import { geminiService } from './services/geminiService';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef(geminiService.startChat());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const greeting: Message = {
      id: uuidv4(),
      role: Role.MODEL,
      text: "Hello! I am your AI assistant. I can help you with questions, problems, or creative tasks in any language. How can I assist you today?",
      timestamp: Date.now(),
    };
    setMessages([greeting]);
  }, []);

  const handleClearChat = useCallback(() => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      chatInstance.current = geminiService.startChat(); // Reset Gemini Chat History
      setMessages([{
        id: uuidv4(),
        role: Role.MODEL,
        text: "Conversation cleared. How can I help you now?",
        timestamp: Date.now(),
      }]);
      setIsSidebarOpen(false);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
    };

    // Optimistically add user message
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const modelMessageId = uuidv4();
      const initialModelMessage: Message = {
        id: modelMessageId,
        role: Role.MODEL,
        text: "",
        isStreaming: true,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, initialModelMessage]);

      const result = await chatInstance.current.sendMessageStream({ message: text });

      let fullText = "";

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || "";
        fullText += chunkText;

        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMessageId 
              ? { ...msg, text: fullText } 
              : msg
          )
        );
      }

      // Finalize message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: Role.MODEL,
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        error: true,
        timestamp: Date.now(),
      };
      setMessages(prev => prev.filter(m => m.isStreaming !== true).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between z-30 shadow-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 leading-tight">Gemini Assistant</h1>
            <p className="text-xs text-slate-500 font-medium">Professional AI Helper</p>
          </div>
        </div>
        
        <button 
          onClick={handleClearChat}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Clear Conversation"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden flex flex-col relative">
        
        {/* Messages List */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end">
             {/* Spacer for top */}
            <div className="h-4"></div>
            
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && messages[messages.length - 1]?.role === Role.USER && (
               <div className="flex w-full justify-start mb-6">
                 <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                 </div>
               </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;
