import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
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

    return (
        <>
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

            {/* Mobile Menu Overlay */}
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
        </>
    );
}