import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Message } from '../types';

export type ThinkingStep = 'analyzing' | 'retrieving' | 'generating' | null;

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  thinkingStep: ThinkingStep;
  selectedDocName: string | null;
  streamingMessageId: string | null;
}

const ThinkingIndicator = ({ step }: { step: ThinkingStep }) => {
  const steps = {
    analyzing: "Analyzing document structure...",
    retrieving: "Retrieving relevant context...",
    generating: "Generating response..."
  };

  if (!step) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center gap-3 px-4 py-2 bg-indigo-50/50 rounded-full border border-indigo-100/50 max-w-fit"
    >
      <div className="flex gap-1">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-1.5 h-1.5 bg-indigo-400 rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          className="w-1.5 h-1.5 bg-indigo-400 rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          className="w-1.5 h-1.5 bg-indigo-400 rounded-full" 
        />
      </div>
      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
        {steps[step]}
      </span>
    </motion.div>
  );
};

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading, 
  thinkingStep,
  selectedDocName,
  streamingMessageId
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, thinkingStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FCFCFD] relative">
      {/* Header */}
      <header className="h-16 border-b border-zinc-100 flex items-center px-8 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors duration-500",
            isLoading ? "bg-indigo-500 animate-pulse" : "bg-emerald-500 shadow-sm shadow-emerald-200"
          )} />
          <h2 className="text-sm font-semibold text-zinc-900">
            {selectedDocName ? `Chatting with ${selectedDocName}` : 'Select a document to start'}
          </h2>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6"
            >
              <div className="w-16 h-16 bg-indigo-50/50 rounded-2xl flex items-center justify-center border border-indigo-100/50">
                <Sparkles className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Ask anything</h3>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                  I can help you summarize, extract key points, or answer specific questions about your uploaded documents.
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-3xl mx-auto w-full group",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm",
                  message.role === 'user' ? "bg-zinc-900" : "bg-white border border-zinc-200"
                )}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  message.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all border",
                    message.role === 'user' 
                      ? "bg-white text-zinc-800 border-zinc-200 rounded-tr-none hover:border-zinc-300" 
                      : "bg-indigo-50/50 text-zinc-800 border-indigo-100/50 rounded-tl-none hover:bg-indigo-50"
                  )}>
                    <div className="markdown-body">
                      <Markdown>{message.content}</Markdown>
                      {message.id === streamingMessageId && (
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="inline-block w-1.5 h-4 bg-indigo-400 ml-1 align-middle"
                        />
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    {message.timestamp}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 max-w-3xl mx-auto w-full"
            >
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-indigo-600 animate-pulse" />
                </div>
                <div className="flex flex-col gap-3">
                  <ThinkingIndicator step={thinkingStep} />
                  {!thinkingStep && (
                    <div className="bg-white border border-zinc-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm w-fit">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-zinc-100 shrink-0">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!selectedDocName || isLoading}
            placeholder={selectedDocName ? "Ask something about your document..." : "Select a document first"}
            className="w-full bg-white border border-zinc-200 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-400 shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:scale-95 active:scale-90 shadow-md shadow-indigo-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-zinc-400 mt-4 font-bold uppercase tracking-widest">
          DocuChat AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
