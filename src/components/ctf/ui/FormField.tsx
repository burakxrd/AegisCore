import React from 'react';
import type { ThemeColor } from './types';

// ─── Static Color Map (Tailwind JIT Safe) ────────────────────────
const colorVariants: Record<ThemeColor, { text: string; focusBorder: string; focusShadow: string }> = {
    cyan: {
        text: 'text-cyan-400',
        focusBorder: 'focus:border-cyan-500/50',
        focusShadow: 'focus:shadow-[0_0_15px_-4px_rgba(6,182,212,0.2)]',
    },
    purple: {
        text: 'text-purple-400',
        focusBorder: 'focus:border-purple-500/50',
        focusShadow: 'focus:shadow-[0_0_15px_-4px_rgba(168,85,247,0.2)]',
    },
    red: {
        text: 'text-red-400',
        focusBorder: 'focus:border-red-500/50',
        focusShadow: 'focus:shadow-[0_0_15px_-4px_rgba(239,68,68,0.2)]',
    },
    yellow: {
        text: 'text-yellow-400',
        focusBorder: 'focus:border-yellow-500/50',
        focusShadow: 'focus:shadow-[0_0_15px_-4px_rgba(234,179,8,0.2)]',
    },
};

// ─── Props ────────────────────────────────────────────────────────
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    hint?: string;
    color?: ThemeColor;
}

// ─── Component ────────────────────────────────────────────────────
export function FormField({ label, hint, color = 'cyan', className, ...rest }: FormFieldProps) {
    const cv = colorVariants[color];

    return (
        <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                {label}
            </label>
            <input
                {...rest}
                className={`w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono ${cv.text} placeholder-slate-600 focus:outline-none ${cv.focusBorder} ${cv.focusShadow} transition-all ${className ?? ''}`}
            />
            {hint && <p className="text-[10px] text-slate-600 font-mono mt-1">{hint}</p>}
        </div>
    );
}
