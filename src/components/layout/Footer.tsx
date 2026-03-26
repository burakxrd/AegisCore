import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
    const location = useLocation();
    const isFullscreenPage = location.pathname === '/ai' || location.pathname === '/tools/ctf-workspace';

    // Eğer sayfa tam ekransa footer'ı hiç render etme
    if (isFullscreenPage) return null;

    return (
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
    );
}