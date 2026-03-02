import React from 'react';
import { Globe, Search, Hash, Terminal, ChevronRight } from 'lucide-react';

// --- Types ---
interface ToolCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  colorClass: string;
}

export default function ToolsCatalog() {
  // Sadece belirlediğimiz 4 canavar aracı listeliyoruz
  const tools: ToolCard[] = [
    { 
      id: 'ip-intelligence', 
      name: 'IP Intelligence', 
      icon: <Globe className="w-6 h-6" />, 
      description: 'Advanced IP tracking, ASN details, and VPN/Proxy detection. Auto-detects client origin.', 
      path: '/tools/ip-intelligence',
      colorClass: 'text-cyan-500' 
    },
    { 
      id: 'domain-analyzer', 
      name: 'Domain Analyzer', 
      icon: <Search className="w-6 h-6" />, 
      description: 'Comprehensive DNS lookup, WHOIS records, and email security (SPF/DMARC) checks.', 
      path: '/tools/domain-analyzer',
      colorClass: 'text-purple-500' 
    },
    { 
      id: 'hash-generator', 
      name: 'Hash Generator', 
      icon: <Hash className="w-6 h-6" />, 
      description: 'Bulk generate secure hashes (MD5, SHA-1, SHA-256) for data integrity verification.', 
      path: '/tools/hash-generator',
      colorClass: 'text-blue-500' 
    },
    { 
      id: 'base64 Codec', 
      name: 'Base64 Codec', 
      icon: <Terminal className="w-6 h-6" />, 
      description: 'Encode and decode Base64 strings safely within your local browser environment.', 
      path: '/tools/base64',
      colorClass: 'text-slate-400' 
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* --- Catalog Header --- */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Security Protocol <span className="text-cyan-500">Toolkit</span></h2>
        <p className="text-slate-400 font-mono text-sm">Select a module to initiate standalone analysis interface.</p>
      </div>

      {/* --- Tools Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (

          <a 
            key={tool.id}
            href={tool.path}
            className="group bg-slate-900/40 border border-slate-800/50 p-8 rounded-3xl hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer block relative overflow-hidden"
          >
            {/* Arka plan efekti */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              {React.cloneElement(tool.icon as React.ReactElement, { className: "w-32 h-32" })}
            </div>

            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg ${tool.colorClass}`}>
                {tool.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                {tool.name}
                <ChevronRight className="w-5 h-5 text-cyan-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              
              <p className="text-sm text-slate-400 leading-relaxed max-w-[85%]">
                {tool.description}
              </p>
            </div>
          </a>
        ))}
      </div>

    </div>
  );
}