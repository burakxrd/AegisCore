import React, { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/50"
      title="Copy to clipboard"
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
    >
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
    </button>
  );
}

export function CopyAllButton({ items, label }: { items: string[]; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!items.length) return;
    navigator.clipboard.writeText(items.join('\r\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!items.length) return null;

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800/50 uppercase tracking-wider"
      title={`Copy all ${label}`}
      aria-label={copied ? `All ${label} copied` : `Copy all ${label}`}
    >
      {copied ? <CheckCircle className="w-3 h-3 text-green-500" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
      {copied ? 'COPIED' : 'COPY ALL'}
    </button>
  );
}