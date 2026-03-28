import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ThemeColor } from './types';

// ─── Static Color Map (Tailwind JIT Safe) ────────────────────────
const colorVariants: Record<ThemeColor, { bg: string; border: string; text: string }> = {
    cyan:   { bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   text: 'text-cyan-400'   },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400'    },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
};

// ─── Props ────────────────────────────────────────────────────────
interface ToolPageHeaderProps {
    icon: LucideIcon;
    title: string;
    highlight: string;
    subtitle: string;
    color: ThemeColor;
}

// ─── Component ────────────────────────────────────────────────────
export function ToolPageHeader({ icon: Icon, title, highlight, subtitle, color }: ToolPageHeaderProps) {
    const cv = colorVariants[color];

    return (
        <div className="flex items-center gap-3 pt-2">
            <div className={`w-9 h-9 rounded-xl ${cv.bg} ${cv.border} border flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${cv.text}`} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                    {title} <span className={cv.text}>{highlight}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">{subtitle}</p>
            </div>
        </div>
    );
}
