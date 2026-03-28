import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { CollapsibleSection } from './CollapsibleSection';
import type { ThemeColor } from './types';

// ─── Static Color Map (Tailwind JIT Safe) ────────────────────────
const colorVariants: Record<ThemeColor, string> = {
    cyan:   'text-cyan-400/70',
    purple: 'text-purple-400/70',
    red:    'text-red-400/70',
    yellow: 'text-yellow-400/70',
};

// ─── Props ────────────────────────────────────────────────────────
interface CommandListSectionProps {
    title: string;
    icon?: LucideIcon;
    commands: { label: string; cmd: string; note: string }[];
    color?: ThemeColor;
    defaultOpen?: boolean;
}

// ─── Component ────────────────────────────────────────────────────
export function CommandListSection({ title, icon, commands, color = 'cyan', defaultOpen = false }: CommandListSectionProps) {
    const labelColor = colorVariants[color];

    return (
        <CollapsibleSection title={title} icon={icon} defaultOpen={defaultOpen}>
            <div className="space-y-2">
                {commands.map(src => (
                    <div key={src.label} className="bg-[#0b0f19] border border-slate-800/50 rounded-xl px-4 py-3 group/cmd">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-bold font-mono ${labelColor} uppercase tracking-widest`}>{src.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-600 font-mono hidden sm:block">{src.note}</span>
                                <CopyButton text={src.cmd} />
                            </div>
                        </div>
                        <code className="text-xs font-mono text-green-400/80 break-all leading-relaxed">{src.cmd}</code>
                    </div>
                ))}
            </div>
        </CollapsibleSection>
    );
}
