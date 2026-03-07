import React, { useState, useEffect, useRef } from 'react';
import { Zap, Send, Sparkles, User, Trash2 } from 'lucide-react';

// --- Types ---
interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface ApiResponse {
  text?: string;
  error?: string;
}

export default function AegisIntelligence() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Textarea auto-resize
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = (await response.json()) as ApiResponse;

      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'ai', text: data.text || 'Interface error.' }]);
    } catch (error: unknown) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Neural link severed. Retry connection.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-4xl mx-auto w-full px-4 sm:px-6">

      {/* Empty State — sohbet yokken */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="relative">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
              <Sparkles className="w-10 h-10 text-cyan-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-950 rounded-full" />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              AEGIS <span className="text-cyan-500">Intelligence</span>
            </h2>
            <p className="text-slate-500 font-mono text-sm max-w-md">
              Cybersecurity expert AI. Ask about threats, network analysis, vulnerability assessment, and more.
            </p>
          </div>

          {/* Öneri butonları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 w-full max-w-lg">
            {[
              "Explain SQL injection attacks",
              "How does a VPN protect my traffic?",
              "What is a zero-day vulnerability?",
              "Best practices for API security"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  inputRef.current?.focus();
                }}
                className="text-left px-4 py-3 bg-slate-900/60 border border-slate-800/50 rounded-xl text-sm text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-slate-800/60 transition-all font-mono"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Chat mesajları */
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-6 space-y-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {/* AI Avatar */}
              {msg.role === 'ai' && (
                <div className="shrink-0 w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20 mt-1">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                </div>
              )}

              <div className={`max-w-[80%] ${msg.role === 'user'
                ? 'bg-cyan-600 text-white rounded-2xl rounded-br-md px-5 py-3.5 shadow-lg shadow-cyan-900/20'
                : 'text-slate-200'
                }`}>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'ai' ? 'text-slate-300' : ''
                  }`}>{msg.text}</p>
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="shrink-0 w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20 mt-1">
                <Sparkles className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="flex items-center gap-1.5 py-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Input Area — her zaman altta */}
      <div className="shrink-0 pt-4 pb-2">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-2 backdrop-blur-md focus-within:border-cyan-500/30 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.08)] transition-all">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AEGIS anything about cybersecurity..."
              rows={1}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white focus:outline-none resize-none max-h-[150px] placeholder:text-slate-600 font-mono"
            />

            <div className="flex items-center gap-1 pb-1 pr-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="p-2.5 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:hover:bg-cyan-500 shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-600 font-mono mt-2">
          AEGIS may produce inaccurate information. Verify critical security advice independently.
        </p>
      </div>

    </div>
  );
}