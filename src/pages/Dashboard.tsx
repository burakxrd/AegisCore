import React, { useState } from 'react';
import { Globe, Search, Hash, Terminal, Sparkles, ArrowRight, Crosshair, Network } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [quickIp, setQuickIp] = useState('');
  const [quickDomain, setQuickDomain] = useState('');
  const navigate = useNavigate();

  const tools = [
    {
      id: 'ip',
      title: 'IP Intelligence',
      description: 'Trace origin, ASN, and ISP',
      icon: Globe,
      color: 'cyan',
      path: '/tools/ip-intelligence',
    },
    {
      id: 'domain',
      title: 'Domain Analyzer',
      description: 'DNS, SSL, and security posture',
      icon: Search,
      color: 'blue',
      path: '/tools/domain-analyzer',
    },
    {
      id: 'hash',
      title: 'Hash Generator',
      description: 'MD5, SHA-1, SHA-256 and more',
      icon: Hash,
      color: 'purple',
      path: '/tools/hash-generator',
    },
    {
      id: 'base64',
      title: 'Base64 Codec',
      description: 'Encode and decode with file support',
      icon: Terminal,
      color: 'emerald',
      path: '/tools/base64-codec',
    },
  ];

  const colorMap: Record<string, { border: string; bg: string; text: string; glow: string; hoverBorder: string }> = {
    cyan: { border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', text: 'text-cyan-500', glow: 'bg-cyan-500/5', hoverBorder: 'hover:border-cyan-500/40' },
    blue: { border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-500', glow: 'bg-blue-500/5', hoverBorder: 'hover:border-blue-500/40' },
    purple: { border: 'border-purple-500/20', bg: 'bg-purple-500/10', text: 'text-purple-500', glow: 'bg-purple-500/5', hoverBorder: 'hover:border-purple-500/40' },
    emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-500', glow: 'bg-emerald-500/5', hoverBorder: 'hover:border-emerald-500/40' },
  };

  return (
    <div className="space-y-10">

      {/* WELCOME HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md p-10 md:p-14">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src="/favicon.ico"
            alt="AEGIS CORE"
            className="w-16 h-16 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
          />
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Welcome to <span className="text-cyan-500">AEGIS CORE</span>
            </h1>
            <p className="text-slate-400 font-mono text-sm max-w-2xl leading-relaxed">
              Your centralized cybersecurity intelligence interface. Analyze IPs, inspect domains, generate hashes, and query AI-powered threat intelligence — all in one place.
            </p>
          </div>

          <Link
            to="/ai"
            className="shrink-0 flex items-center gap-3 px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm tracking-wider transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 group"
          >
            <Sparkles className="w-5 h-5" />
            ASK AI
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* QUICK ACCESS — IP & DOMAIN */}
      <h2 className="sr-only">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Quick IP Lookup */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <Crosshair className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Quick IP Lookup</h3>
              <p className="text-slate-400 text-xs font-mono">Instant geolocation & ISP data</p>
            </div>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={quickIp}
              aria-label="Enter IP address for quick lookup" 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.a-fA-F:]/g, '');
                if (val.length <= 45) setQuickIp(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && quickIp.trim()) {
                  navigate(`/tools/ip-intelligence?q=${encodeURIComponent(quickIp.trim())}`);
                }
              }}
              placeholder="e.g. 8.8.8.8"
              className="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl pl-4 pr-12 py-3 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-colors"
            />
            <button
              onClick={() => {
                if (quickIp.trim()) navigate(`/tools/ip-intelligence?q=${encodeURIComponent(quickIp.trim())}`);
                else navigate('/tools/ip-intelligence');
              }}
              aria-label="Search IP" 
              className="absolute right-2 p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-white transition-all"
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Quick Domain Lookup */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Network className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Quick Domain Scan</h3>
              <p className="text-slate-400 text-xs font-mono">DNS, SSL & security analysis</p>
            </div>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={quickDomain}
              aria-label="Enter domain name for quick scan"
              onChange={(e) => setQuickDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && quickDomain.trim()) {
                  navigate(`/tools/domain-analyzer?q=${encodeURIComponent(quickDomain.trim())}`);
                }
              }}
              placeholder="e.g. google.com"
              className="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl pl-4 pr-12 py-3 text-sm font-mono text-blue-400 focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600 transition-colors"
            />
            <button
              onClick={() => {
                if (quickDomain.trim()) navigate(`/tools/domain-analyzer?q=${encodeURIComponent(quickDomain.trim())}`);
                else navigate('/tools/domain-analyzer');
              }}
              aria-label="Scan Domain"
              className="absolute right-2 p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TOOL CARDS */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-6 h-px bg-slate-700" />
          All Tools
          <div className="flex-1 h-px bg-slate-800/50" />
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const colors = colorMap[tool.color];
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className={`group bg-slate-900/40 border border-slate-800/50 p-6 rounded-2xl ${colors.hoverBorder} transition-all hover:shadow-lg cursor-pointer block relative overflow-hidden`}
              >
                <div className={`absolute -right-6 -top-6 w-20 h-20 ${colors.glow} rounded-full blur-2xl group-hover:scale-150 transition-transform`} />

                <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center ${colors.border} border mb-4`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>

                <h3 className="text-white font-bold text-sm mb-1 group-hover:text-cyan-400 transition-colors">{tool.title}</h3>
                <p className="text-slate-400 text-xs font-mono">{tool.description}</p>

                <ArrowRight className="absolute bottom-6 right-6 w-4 h-4 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}