import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────
interface CollapsibleSectionProps {
    title: string;
    icon?: LucideIcon;
    defaultOpen?: boolean;
    children: React.ReactNode;
    className?: string;
}

// ─── Component ────────────────────────────────────────────────────
export function CollapsibleSection({ title, icon: Icon, defaultOpen = false, children, className = '' }: CollapsibleSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={`bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden ${className}`}>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/20 transition-colors cursor-pointer"
            >
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                    {title}
                </h4>
                {open
                    ? <ChevronUp className="w-4 h-4 text-slate-500" />
                    : <ChevronDown className="w-4 h-4 text-slate-500" />
                }
            </button>
            {open && (
                <div className="px-5 pb-5 animate-page-in">
                    {children}
                </div>
            )}
        </div>
    );
}
