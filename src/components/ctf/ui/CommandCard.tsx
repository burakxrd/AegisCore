import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import type { ThemeColor } from './types';

// ─── Static Color Map (Tailwind JIT Safe) ────────────────────────
const colorVariants: Record<ThemeColor, { text: string; hoverBorder: string }> = {
    cyan:   { text: 'text-cyan-400',   hoverBorder: 'hover:border-cyan-500/30'   },
    purple: { text: 'text-purple-400', hoverBorder: 'hover:border-purple-500/30' },
    red:    { text: 'text-red-400',    hoverBorder: 'hover:border-red-500/30'    },
    yellow: { text: 'text-yellow-400', hoverBorder: 'hover:border-yellow-500/30' },
};

// ─── Props ────────────────────────────────────────────────────────
interface CommandCardProps {
    icon?: LucideIcon;
    label: string;
    note?: string;
    command: string;
    color?: ThemeColor;
}

// ─── Component ────────────────────────────────────────────────────
export function CommandCard({ icon: Icon, label, note, command, color = 'purple' }: CommandCardProps) {
    const cv = colorVariants[color];

    return (
        <div className={`bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden group/cmd transition-colors ${cv.hoverBorder}`}>
            <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className={`w-4 h-4 ${cv.text}`} />}
                    <span className={`text-sm font-bold font-mono ${cv.text}`}>{label}</span>
                </div>
                {note && <span className="text-[10px] text-slate-500 font-mono hidden sm:block">{note}</span>}
            </div>
            <div className="p-5 flex flex-col gap-4">
                <code className="text-xs font-mono text-green-400/90 break-all leading-relaxed whitespace-pre-wrap">
                    {command}
                </code>
                <div className="flex justify-end">
                    <CopyButton text={command} />
                </div>
            </div>
        </div>
    );
}
