import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Loader2 } from 'lucide-react'; 

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AegisIntelligence = lazy(() => import('./pages/AegisIntelligence'));
const ToolsCatalog = lazy(() => import('./pages/ToolsCatalog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogList = lazy(() => import('./pages/BlogList'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

const IpIntelligence = lazy(() => import('./tools/IpIntelligence'));
const DomainAnalyzer = lazy(() => import('./tools/DomainAnalyzer'));
const Base64 = lazy(() => import('./tools/Base64'));
const HashGenerator = lazy(() => import('./tools/HashGenerator'));


function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'DASHBOARD' },
    { path: '/ai', label: 'AI' },
    { path: '/tools', label: 'TOOLS' },
    { path: '/blog', label: 'BLOGS' }
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
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest hidden sm:block">Advanced Defense Protocol</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/50 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-6 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${checkIsActive(link.path)
                ? 'bg-slate-800 text-cyan-400 shadow-inner'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-slate-400 font-mono">UPLINK_STABLE</span>
            <span className="text-xs font-bold text-cyan-500">98.2 MS</span>
          </div>
        </div>

        <button
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
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
        <div key={location.pathname} className="animate-page-in flex-1 flex flex-col min-h-0">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-cyan-500 font-mono"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ai" element={<AegisIntelligence />} />
            <Route path="/tools" element={<ToolsCatalog />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            <Route path="/tools/ip-intelligence" element={<IpIntelligence />} />
            <Route path="/tools/domain-analyzer" element={<DomainAnalyzer />} />
            <Route path="/tools/hash-generator" element={<HashGenerator />} />
            <Route path="/tools/base64-codec" element={<Base64 />} />
          </Routes>
          </Suspense>
        </div>
      </main>

      {!isAiPage && (
        <footer className="relative z-10 border-t border-slate-800/50 py-8 px-6 bg-slate-950/80 backdrop-blur-md mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="AEGIS" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-white tracking-tight">AEGIS CORE</span>
            </div>
            <div className="flex gap-8 text-[11px] uppercase font-bold tracking-widest text-slate-400">
              <Link to="/tools" className="hover:text-cyan-500 transition-colors">Documentation</Link>
              <Link to="/privacy-policy" className="hover:text-cyan-500 transition-colors">Privacy</Link>
              <Link to="/terms-of-service" className="hover:text-cyan-500 transition-colors">Terms</Link>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              © {new Date().getFullYear()} AEGIS_CORE
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