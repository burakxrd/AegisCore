import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { LangLink } from './LangLink';
import { useLanguage, useTranslation, SUPPORTED_LANGUAGES, type Language } from '../../i18n';

const FLAG_EMOJI: Record<Language, string> = {
  en: '🇬🇧',
  tr: '🇹🇷',
};

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const location = useLocation();
    const { language, setLanguage, localePath } = useLanguage();
    const { t } = useTranslation();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsLangDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { path: '/', label: t('header.nav.dashboard') },
        { path: '/ai', label: t('header.nav.ai') },
        { path: '/tools', label: t('header.nav.tools') },
        { path: '/blog', label: t('header.nav.blogs') }
    ];

    const checkIsActive = (path: string) => {
        const localizedPath = localePath(path);
        if (path === '/') return location.pathname === localizedPath;
        return location.pathname === localizedPath || location.pathname.startsWith(`${localizedPath}/`);
    };

    return (
        <>
            <header className="relative z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center">
                <LangLink to="/" className="flex items-center gap-4 group">
                    <div className="relative">
                        <img src="/favicon.ico" alt="AEGIS" className="w-10 h-10 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white">AEGIS <span className="text-cyan-500">CORE</span></h1>
                        <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest hidden sm:block">{t('header.subtitle')}</p>
                    </div>
                </LangLink>

                <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/50 backdrop-blur-md">
                    {navLinks.map((link) => (
                        <LangLink
                            key={link.path}
                            to={link.path}
                            className={`px-6 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${checkIsActive(link.path)
                                ? 'bg-slate-800 text-cyan-400 shadow-inner'
                                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            {link.label}
                        </LangLink>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    {/* ── Language Switcher ── */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-800/50 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all backdrop-blur-md"
                            aria-label="Change language"
                        >
                            <span className="text-sm">{FLAG_EMOJI[language]}</span>
                            <span>{language.toUpperCase()}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isLangDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-slate-900/95 border border-slate-700/60 rounded-xl backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => {
                                            setLanguage(lang);
                                            setIsLangDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${language === lang
                                                ? 'bg-cyan-500/10 text-cyan-400'
                                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-base">{FLAG_EMOJI[lang]}</span>
                                        <span>{t(`languageSwitcher.${lang}` as any)}</span>
                                        {language === lang && (
                                            <div className="ml-auto w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-px bg-slate-800" />
                    <div className="flex flex-col items-end">
                        <span className="text-[11px] text-slate-400 font-mono">{t('header.uplink')}</span>
                        <span className="text-xs font-bold text-cyan-500">98.2 MS</span>
                    </div>
                </div>

                <button
                    className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
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
                            <LangLink
                                key={link.path}
                                to={link.path}
                                className={`p-4 rounded-xl text-center text-sm font-bold uppercase tracking-wider transition-all ${checkIsActive(link.path)
                                    ? 'bg-slate-800 border border-slate-700 text-cyan-400'
                                    : 'bg-slate-900/50 text-slate-400 border border-transparent'
                                    }`}
                            >
                                {link.label}
                            </LangLink>
                        ))}

                        {/* Mobile Language Switcher */}
                        <div className="mt-4 pt-4 border-t border-slate-800/50">
                            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5" /> Language
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => {
                                            setLanguage(lang);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${language === lang
                                            ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                                            : 'bg-slate-900/50 border border-slate-800/50 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-lg">{FLAG_EMOJI[lang]}</span>
                                        {t(`languageSwitcher.${lang}` as any)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
}