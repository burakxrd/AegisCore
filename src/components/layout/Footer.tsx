import React from 'react';
import { useLocation } from 'react-router-dom';
import { LangLink } from './LangLink';
import { useTranslation } from '../../i18n';

export default function Footer() {
    const location = useLocation();
    const { t } = useTranslation();

    // Strip /:lang prefix for page logic
    const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}/, '');
    const isFullscreenPage = pathWithoutLang === '/ai' || pathWithoutLang === '/tools/ctf-workspace';

    if (isFullscreenPage) return null;

    return (
        <footer className="relative z-10 border-t border-slate-800/50 py-8 px-6 bg-slate-950/80 backdrop-blur-md mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <img src="/favicon.ico" alt="AEGIS" className="w-8 h-8 rounded-lg" />
                    <span className="font-bold text-white tracking-tight">AEGIS CORE</span>
                </div>
                <div className="flex gap-8 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                    <LangLink to="/tools" className="hover:text-cyan-500 transition-colors">{t('footer.documentation')}</LangLink>
                    <LangLink to="/privacy-policy" className="hover:text-cyan-500 transition-colors">{t('footer.privacy')}</LangLink>
                    <LangLink to="/terms-of-service" className="hover:text-cyan-500 transition-colors">{t('footer.terms')}</LangLink>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                    © {new Date().getFullYear()} AEGIS_CORE
                </div>
            </div>
        </footer>
    );
}