import React, { useState, useEffect, useRef } from 'react';
import { Hash, Copy, CheckCircle2, ShieldCheck, Zap, FileUp, Trash2, Check, X, Network, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HashGenerator() {
  const [input, setInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-384' | 'SHA-512' | 'SHA-1'>('SHA-256');
  const [copied, setCopied] = useState<boolean>(false);
  const [expectedHash, setExpectedHash] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modern tarayıcıların "SubtleCrypto" motorunu kullanan yüksek performanslı hash fonksiyonu
  useEffect(() => {
    const generateHash = async () => {
      // 1. DOSYA HASHING MODU
      if (file) {
        try {
          const buffer = await file.arrayBuffer();
          const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          setOutput(hashHex);
        } catch (error) {
          setOutput("ERROR: Unable to read file or file is too large.");
        }
        return;
      }

      // 2. METİN HASHING MODU (Satır satır)
      if (!input) {
        setOutput('');
        return;
      }

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
  }, [input, file, algorithm]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setFile(null);
    setExpectedHash('');
    setOutput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Doğrulama Kontrolü (Verification)
  const cleanExpected = expectedHash.trim().toLowerCase();
  const isMatch = cleanExpected ? output.toLowerCase().includes(cleanExpected) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ÜST BİLGİ VE GERİ DÖNÜŞ LİNKİ */}
      <div>
        <div className="flex items-center gap-2 text-sm font-mono tracking-wider text-slate-400 mb-6 uppercase">
          <Link to="/tools" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
            <Network className="w-4 h-4" />
            Tools
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-cyan-500/70">Hash Generator</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Hash className="w-8 h-8 text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              Hash <span className="text-cyan-500">Generator</span>
            </h2>
            <p className="text-slate-400 font-mono text-sm mt-2">Generate cryptographically secure digests for data & file integrity.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Algoritma Seçici */}
            <div className="flex items-center bg-slate-900 border border-slate-700/50 p-1 rounded-xl shadow-inner">
              {['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'].map((alg) => (
                <button
                  key={alg}
                  onClick={() => setAlgorithm(alg as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    algorithm === alg ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {alg}
                </button>
              ))}
            </div>

            {/* Temizle Butonu */}
            <button 
              onClick={handleClear}
              className="p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 flex items-center gap-2 text-xs font-bold"
              title="Clear All Inputs"
            >
              <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">CLEAR</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch animate-in fade-in slide-in-from-bottom-4">
        
        {/* INPUT BÖLÜMÜ */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md relative group">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Input Data</span>
            </div>
            
            {/* Gizli Dosya Inputu */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                  setInput(''); // Dosya yüklendiğinde metni temizle
                }
              }} 
              className="hidden" 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-[10px] font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-cyan-900 hover:text-cyan-400 transition-colors border border-slate-700 hover:border-cyan-700"
            >
              <FileUp className="w-3 h-3" /> SELECT FILE
            </button>
          </div>

          {/* Dosya yüklüyse metin alanı yerine dosya bilgisini göster */}
          {file ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/30 m-6 rounded-2xl bg-cyan-950/20">
              <FileUp className="w-12 h-12 text-cyan-500 mb-4 opacity-80" />
              <p className="text-white font-mono font-bold text-center break-all">{file.name}</p>
              <p className="text-slate-400 font-mono text-xs mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste text strings (line by line) OR click 'Select File' to hash a document..."
              className="w-full flex-1 bg-transparent border-none p-6 text-sm font-mono text-slate-300 focus:outline-none focus:ring-0 resize-none min-h-75 custom-scrollbar placeholder:text-slate-600"
            />
          )}
        </div>

        {/* OUTPUT BÖLÜMÜ */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md relative">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">{algorithm} Output</span>
            </div>
            <button 
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-2 text-[10px] font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800"
            >
              {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Hash results will appear here..."
            className="w-full h-full bg-transparent border-none p-6 text-sm font-mono text-cyan-400 focus:outline-none focus:ring-0 resize-none min-h-75 custom-scrollbar selection:bg-cyan-900 selection:text-cyan-100"
          />
        </div>

      </div>

      {/* YENİ EKLENEN: HASH DOĞRULAMA (VERIFY) BÖLÜMÜ */}
      <div className={`p-1 rounded-3xl transition-all duration-500 bg-linear-to-r ${
        isMatch === true ? 'from-green-500/40 via-green-500/10 to-transparent' : 
        isMatch === false ? 'from-red-500/40 via-red-500/10 to-transparent' : 
        'from-slate-800/50 to-transparent'
      }`}>
        <div className="bg-slate-950 rounded-[22px] p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-400" /> Hash Verification
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">Paste an expected hash to compare.</p>
          </div>
          
          <div className="w-full md:w-2/3 relative flex items-center">
            <input 
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="Paste original hash here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {/* Doğrulama İkonu */}
            {isMatch === true && <Check className="absolute right-4 w-5 h-5 text-green-500 animate-in zoom-in" />}
            {isMatch === false && <X className="absolute right-4 w-5 h-5 text-red-500 animate-in zoom-in" />}
          </div>
        </div>
      </div>

      {/* GÜVENLİK BİLDİRİMİ */}
      <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-center gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-500/50" />
        <p className="text-[10px] text-blue-400/60 font-mono uppercase tracking-widest text-center">
          Terminal operates in offline mode. Cryptographic operations are performed locally via Web Crypto API. Zero data leaves this machine.
        </p>
      </div>

    </div>
  );
}