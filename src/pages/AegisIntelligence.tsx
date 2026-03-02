import React, { useState, useEffect, useRef } from 'react';
import { Zap, Send } from 'lucide-react';

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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'AEGIS Neural Interface established. Systems nominal. How can I assist your operation?' }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="max-w-4xl mx-auto h-175 bg-slate-900/40 border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md shadow-2xl">
      
      {/* --- Chat Header --- */}
      <div className="px-8 py-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-cyan-500" />
          </div>
          <div>
            <span className="text-sm font-bold text-white uppercase tracking-widest">AEGIS Intelligence</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[9px] text-slate-500 font-mono">NEURAL_LINK_ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Message List --- */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                : 'bg-slate-800/80 border border-slate-700/50 text-slate-200'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 p-4 rounded-2xl flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* --- Input Area --- */}
      <div className="p-6 bg-slate-950/50 border-t border-slate-800/50">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Query the core intelligence..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-6 pr-16 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading}
            className="absolute right-2 p-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}