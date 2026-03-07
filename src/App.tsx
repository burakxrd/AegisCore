import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import AegisIntelligence from './pages/AegisIntelligence';
import ToolsCatalog from './pages/ToolsCatalog';

import IpIntelligence from './tools/IpIntelligence';
import DomainAnalyzer from './tools/DomainAnalyzer';
import Base64 from './tools/Base64';
import HashGenerator from './tools/HashGenerator';


function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'DASHBOARD' },
    { path: '/ai', label: 'AI' },
    { path: '/tools', label: 'TOOLS' }
  ];

  const checkIsActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };
  const isAiPage = location.pathname === '/ai';

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 flex flex-col relative overflow-x-hidden ${isAiPage ? 'overflow-hidden h-screen' : ''}`}>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <img src="/favicon.ico" alt="AEGIS" className="w-10 h-10 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">AEGIS <span className="text-cyan-500">CORE</span></h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">Advanced Defense Protocol</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/50 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-6 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${checkIsActive(link.path)
                ? 'bg-slate-800 text-cyan-400 shadow-inner'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-mono">UPLINK_STABLE</span>
            <span className="text-xs font-bold text-cyan-500">98.2 MS</span>
          </div>
        </div>

        <button
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-24 px-6">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`p-4 rounded-xl text-center text-sm font-bold uppercase tracking-wider transition-all ${checkIsActive(link.path)
                  ? 'bg-slate-800 border border-slate-700 text-cyan-400'
                  : 'bg-slate-900/50 text-slate-400 border border-transparent'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main className={`relative z-10 flex-1 w-full max-w-7xl mx-auto ${isAiPage ? 'p-0 flex flex-col overflow-hidden' : 'p-4 sm:p-6 md:p-10'
        }`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai" element={<AegisIntelligence />} />
          <Route path="/tools" element={<ToolsCatalog />} />

          <Route path="/tools/ip-intelligence" element={<IpIntelligence />} />
          <Route path="/tools/domain-analyzer" element={<DomainAnalyzer />} />
          <Route path="/tools/hash-generator" element={<HashGenerator />} />
          <Route path="/tools/base64" element={<Base64 />} />
        </Routes>
      </main>

      {!isAiPage && (
        <footer className="relative z-10 border-t border-slate-800/50 py-8 px-6 bg-slate-950/80 backdrop-blur-md mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="AEGIS" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-white tracking-tight">AEGIS CORE</span>
            </div>
            <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              <Link to="/" className="hover:text-cyan-500 transition-colors">Documentation</Link>
              <Link to="/" className="hover:text-cyan-500 transition-colors">Privacy</Link>
            </div>
            <div className="text-[10px] font-mono text-slate-600">
              © 2026 AEGIS_CORE
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}