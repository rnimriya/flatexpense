"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { Bot, User, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AssistantPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-500" />
          Financial Assistant
        </h1>
        <p className="text-muted-foreground mt-1">Ask questions about your apartment's spending, chores, and balances.</p>
      </div>

      <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
              <Bot className="w-16 h-16 text-indigo-500" />
              <div>
                <p className="text-xl font-medium">Hello! I'm your AI roommate.</p>
                <p className="text-sm">Try asking: "Who spent the most this month?" or "Do I have any pending chores?"</p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-white/10 border border-white/10 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-black/20 border-t border-white/5">
          <form 
            onSubmit={handleSubmit}
            className="flex gap-2"
          >
            <Input 
              value={input}
              onChange={handleInputChange}
              placeholder="Ask anything about your apartment..."
              className="flex-1 bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-indigo-500"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input?.trim()}
              className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
