import React, { useState, useEffect, useRef } from 'react';
import { Hash, CheckCircle2, ShieldCheck, Zap, FileUp, Trash2, Check, X, Network, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CopyButton } from '../components/CopyButtons';

function md5(input: Uint8Array): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
  function add32(a: number, b: number) { return (a + b) & 0xFFFFFFFF; }

  const n = input.length;
  let state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (i = 64; i <= n; i += 64) {
    const block: number[] = [];
    for (let j = 0; j < 16; j++) {
      const off = i - 64 + j * 4;
      block[j] = input[off] | (input[off + 1] << 8) | (input[off + 2] << 16) | (input[off + 3] << 24);
    }
    md5cycle(state, block);
  }

  const remaining = n - (i - 64);
  for (let j = 0; j < 16; j++) tail[j] = 0;
  for (let j = 0; j < remaining; j++) {
    tail[j >> 2] |= input[i - 64 + j] << ((j % 4) << 3);
  }
  tail[remaining >> 2] |= 0x80 << ((remaining % 4) << 3);

  if (remaining > 55) {
    md5cycle(state, tail);
    for (let j = 0; j < 16; j++) tail[j] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);

  const hex = '0123456789abcdef';
  let s = '';
  for (i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const byte = (state[i] >> (j * 8)) & 0xFF;
      s += hex.charAt((byte >> 4) & 0xF) + hex.charAt(byte & 0xF);
    }
  }
  return s;
}

type Algorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

async function computeHash(data: Uint8Array, algorithm: Algorithm): Promise<string> {
  if (algorithm === 'MD5') {
    return md5(data);
  }
  const hashBuffer = await crypto.subtle.digest(algorithm, data.buffer as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const [input, setInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256');
  const [expectedHash, setExpectedHash] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget === e.target) setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) { setFile(droppedFile); setInput(''); }
  };

  useEffect(() => {
    const generateHash = async () => {
      // 1. DOSYA HASHING MODU
      if (file) {
        try {
          const buffer = await file.arrayBuffer();
          const hashHex = await computeHash(new Uint8Array(buffer), algorithm);
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
          return computeHash(msgUint8, algorithm);
        })
      );

      setOutput(hashedLines.join('\n'));
    };

    generateHash();
  }, [input, file, algorithm]);

  const handleClear = () => {
    setInput('');
    setFile(null);
    setExpectedHash('');
    setOutput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Doğrulama Kontrolü
  const cleanExpected = expectedHash.trim().toLowerCase();
  const isMatch = cleanExpected ? output.toLowerCase().includes(cleanExpected) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ÜST BİLGİ */}
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
            <div className="flex items-center bg-slate-900 border border-slate-700/50 p-1 rounded-xl shadow-inner flex-wrap">
              {(['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as Algorithm[]).map((alg) => (
                <button
                  key={alg}
                  onClick={() => setAlgorithm(alg)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${algorithm === alg ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-white'
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

        {/* INPUT */}
        <div
          className={`bg-slate-900/40 border rounded-3xl flex flex-col overflow-hidden backdrop-blur-md relative group transition-colors ${isDragging ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-slate-800/50'
            }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-500 rounded-3xl flex items-center justify-center z-20 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <FileUp className="w-10 h-10 text-cyan-400 animate-bounce" />
                <span className="text-cyan-400 font-mono text-sm font-bold tracking-wider">DROP FILE HERE</span>
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Input Data</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                  setInput('');
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
              placeholder="Paste text, drag & drop a file, or click 'Select File'..."
              className="w-full flex-1 bg-transparent border-none p-6 text-sm font-mono text-slate-300 focus:outline-none focus:ring-0 resize-none min-h-75 custom-scrollbar placeholder:text-slate-600"
            />
          )}
        </div>

        {/* OUTPUT */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md relative">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">{algorithm} Output</span>
            </div>
            <CopyButton text={output} />
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Hash results will appear here..."
            className="w-full h-full bg-transparent border-none p-6 text-sm font-mono text-cyan-400 focus:outline-none focus:ring-0 resize-none min-h-75 custom-scrollbar selection:bg-cyan-900 selection:text-cyan-100"
          />
        </div>

      </div>

      {/* HASH DOĞRULAMA */}
      <div className={`p-1 rounded-3xl transition-all duration-500 bg-linear-to-r ${isMatch === true ? 'from-green-500/40 via-green-500/10 to-transparent' :
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