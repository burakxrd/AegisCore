import React, { useState, useEffect } from 'react';
import { Hash, Copy, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function HashGenerator() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-512' | 'SHA-1'>('SHA-256');
  const [copied, setCopied] = useState<boolean>(false);

  // Modern tarayıcıların "SubtleCrypto" motorunu kullanan yüksek performanslı hash fonksiyonu
  useEffect(() => {
    const generateHash = async () => {
      if (!input) {
        setOutput('');
        return;
      }

      // Satır satır (Bulk) işlem desteği
      const lines = input.split('\n');
      const hashedLines = await Promise.all(
        lines.map(async (line) => {
          if (!line.trim()) return '';
          const msgUint8 = new TextEncoder().encode(line);
          const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        })
      );

      setOutput(hashedLines.join('\n'));
    };

    generateHash();
  }, [input, algorithm]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Hash className="w-8 h-8 text-cyan-500" />
            Hash <span className="text-cyan-500">Generator</span>
          </h2>
          <p className="text-slate-400 font-mono text-sm mt-2">Generate cryptographically secure digests for data integrity.</p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-700/50 p-1 rounded-xl w-fit">
          {['SHA-256', 'SHA-512', 'SHA-1'].map((alg) => (
            <button
              key={alg}
              onClick={() => setAlgorithm(alg as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                algorithm === alg ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              {alg}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/50 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Input Strings (Line by line)</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text(s) to hash..."
            className="w-full flex-1 bg-transparent border-none p-6 text-sm font-mono text-slate-300 focus:outline-none focus:ring-0 resize-none min-h-87.5"
          />
        </div>

        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">{algorithm} Output</span>
            </div>
            <button 
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-30"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'COPIED' : 'COPY ALL'}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Hash results will appear here..."
            className="w-full h-full bg-transparent border-none p-6 text-sm font-mono text-cyan-400 focus:outline-none focus:ring-0 resize-none overflow-x-auto"
          />
        </div>

      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl">
        <p className="text-[10px] text-blue-400/60 font-mono text-center uppercase tracking-widest">
          All processing is performed locally in-browser using Web Crypto API. No data is sent to server.
        </p>
      </div>

    </div>
  );
}