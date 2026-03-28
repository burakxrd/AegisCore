import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import type { ThemeColor } from './types';

// ─── Static Color Map (Tailwind JIT Safe) ────────────────────────
const colorVariants: Record<ThemeColor, string> = {
    cyan:   'text-cyan-500/60',
    purple: 'text-purple-500/60',
    red:    'text-red-500/60',
    yellow: 'text-yellow-500/60',
};

// ─── Props ────────────────────────────────────────────────────────
interface TipsSectionProps {
    title: string;
    tips: string[];
    color?: ThemeColor;
    defaultOpen?: boolean;
    className?: string;
}

// ─── Component ────────────────────────────────────────────────────
export function TipsSection({ title, tips, color = 'cyan', defaultOpen = false, className = '' }: TipsSectionProps) {
    const iconColor = colorVariants[color];

    return (
        <CollapsibleSection title={title} defaultOpen={defaultOpen} className={className}>
            <div className="space-y-2">
                {tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-900/30 border border-slate-800/30 rounded-xl p-4">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${iconColor} flex-shrink-0 mt-0.5`} />
                        <p className="text-xs text-slate-400 leading-relaxed">{tip}</p>
                    </div>
                ))}
            </div>
        </CollapsibleSection>
    );
}
