import React from 'react';
import type { ThemeColor } from './types';

// ─── Static Color Map (Tailwind JIT Safe) ────────────────────────
const colorVariants: Record<ThemeColor, string> = {
    cyan:   'bg-cyan-500',
    purple: 'bg-purple-500',
    red:    'bg-red-500',
    yellow: 'bg-yellow-500',
};

// ─── Props ────────────────────────────────────────────────────────
interface ToggleSwitchProps {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
    color?: ThemeColor;
}

// ─── Component ────────────────────────────────────────────────────
export function ToggleSwitch({ checked, onChange, label, color = 'cyan' }: ToggleSwitchProps) {
    const activeBg = colorVariants[color];

    return (
        <div
            onClick={() => onChange(!checked)}
            className="flex items-center gap-2 cursor-pointer group"
        >
            <div className={`w-8 h-4 rounded-full transition-all relative ${checked ? activeBg : 'bg-slate-700'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-slate-400 font-mono group-hover:text-slate-300 transition-colors">
                {label}
            </span>
        </div>
    );
}
