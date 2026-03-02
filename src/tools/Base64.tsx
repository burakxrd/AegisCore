import React, { useState, useEffect } from 'react';
import { Terminal, ArrowRightLeft, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Base64Encoder() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<'ENCODE' | 'DECODE'>('ENCODE');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setError(null);
    if (!input) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'ENCODE') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(input)));
        setOutput(decoded);
      }
    } catch (err) {
      setError(mode === 'DECODE' ? 'Invalid Base64 string.' : 'Encoding error occurred.');
      setOutput('');
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMode = () => {
    setMode(prev => prev === 'ENCODE' ? 'DECODE' : 'ENCODE');
    setInput(output); 
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Terminal className="w-8 h-8 text-cyan-500" />
            Base64 <span className="text-cyan-500">Codec</span>
          </h2>
          <p className="text-slate-400 font-mono text-sm mt-2">Safely encode or decode strings with UTF-8 support.</p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-700/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setMode('ENCODE')}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'ENCODE' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-white'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('DECODE')}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'DECODE' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-white'
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch relative">
        
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {mode === 'ENCODE' ? 'Plain Text Input' : 'Base64 Input'}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'ENCODE' ? "Enter text to encode..." : "Paste Base64 here..."}
            className="w-full flex-1 bg-transparent border-none p-6 text-sm font-mono text-slate-300 focus:outline-none focus:ring-0 resize-none min-h-75"
          />
        </div>

        <button 
          onClick={toggleMode}
          className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 border-4 border-slate-950 rounded-full items-center justify-center text-slate-400 hover:text-cyan-400 hover:scale-110 transition-all z-10"
          title="Swap Input & Output"
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>

        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md relative">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/50 flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">
              {mode === 'ENCODE' ? 'Base64 Output' : 'Plain Text Output'}
            </span>
            <button 
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-30"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
          
          <div className="flex-1 p-6 relative">
            {error ? (
              <div className="flex items-center gap-2 text-red-400 font-mono text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            ) : (
              <textarea
                readOnly
                value={output}
                placeholder="Result will appear here..."
                className="w-full h-full bg-transparent border-none text-sm font-mono text-cyan-400 focus:outline-none focus:ring-0 resize-none"
              />
            )}
          </div>
        </div>

      </div>

    </div>
  );
}