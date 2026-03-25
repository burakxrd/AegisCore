import React from 'react';
import { Globe, Search, Hash, Terminal, ChevronRight, Shield, ArrowRight, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const tools: ToolCard[] = [
    {
      id: 'ip-intelligence',
      name: 'IP Intelligence',
      icon: <Globe className="w-6 h-6" />,
      description: 'Advanced IP tracking, geolocation, ASN details, and ISP identification.',
      path: '/tools/ip-intelligence',
      colorClass: 'text-cyan-500'
    },
    {
      id: 'domain-analyzer',
      name: 'Domain Analyzer',
      icon: <Search className="w-6 h-6" />,
      description: 'Comprehensive DNS lookup and email security (SPF/DMARC) checks.',
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
      id: 'base64-codec',
      name: 'Base64 Codec',
      icon: <Terminal className="w-6 h-6" />,
      description: 'Encode and decode Base64 strings safely within your local browser environment.',
      path: '/tools/base64-codec',
      colorClass: 'text-slate-400'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* --- Catalog Header --- */}
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Security Protocol <span className="text-cyan-500">Toolkit</span></h2>
        <p className="text-slate-400 font-mono text-sm">Select a module to initiate standalone analysis interface.</p>
      </div>

      {/* --- CTF Hero Card / Banner --- */}
      <div className="group relative w-full rounded-3xl border border-slate-700/60 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-800/50 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_40px_-12px_rgba(6,182,212,0.25)]">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(6,182,212,0.15) 30px, rgba(6,182,212,0.15) 31px),
                              repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(6,182,212,0.15) 30px, rgba(6,182,212,0.15) 31px)`
          }}
        />
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all duration-700 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/8 transition-all duration-700 translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-6 sm:p-8">
          {/* Left — Animated Icon Cluster */}
          <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            {/* Outer ring pulse */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" style={{ animationDuration: '3s' }} />
            {/* Static outer ring */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/30" />
            {/* Inner shield */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/10 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:scale-110 group-hover:shadow-cyan-500/20 transition-all duration-500">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
              {/* Small crosshair accent */}
              <Crosshair className="absolute -top-2 -right-2 w-5 h-5 text-cyan-500/60 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-700" />
            </div>
          </div>

          {/* Center — Text Content */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <span className="inline-block px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">Coming Soon</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
              CTF & Red Team Ops <span className="text-cyan-400">Workspace</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Interactive kill chain visualization, automated Nmap vector analysis, and payload generation for CTF environments.
            </p>
          </div>

          {/* Right — CTA Button */}
          <div className="flex-shrink-0">
            <Link
              to="/tools/ctf-workspace"
              className="group/btn relative inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-cyan-500/10 border border-cyan-500/30
                         text-cyan-400 font-semibold text-sm tracking-wide
                         transition-all duration-300
                         hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:text-cyan-300
                         hover:shadow-[0_0_24px_-4px_rgba(6,182,212,0.4)]
                         active:scale-95"
            >
              Launch Workspace
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* --- Tools Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (

          <Link
            key={tool.id}
            to={tool.path}
            className="group bg-slate-900/40 border border-slate-800/50 p-8 rounded-3xl hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer block relative overflow-hidden"
          >
            {/* Arka plan efekti */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              {React.cloneElement(tool.icon as React.ReactElement<any>, { className: "w-32 h-32" })}
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
          </Link>
        ))}
      </div>

    </div>
  );
}