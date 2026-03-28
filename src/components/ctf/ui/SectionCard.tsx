import React from 'react';

// ─── Props ────────────────────────────────────────────────────────
interface SectionCardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

// ─── Component ────────────────────────────────────────────────────
export function SectionCard({ title, children, className = '' }: SectionCardProps) {
    return (
        <div className={`bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4 ${className}`}>
            {title && (
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</h4>
            )}
            {children}
        </div>
    );
}
