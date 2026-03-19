import React from 'react';
import { LucideIcon } from 'lucide-react';

type CardColor = 'cyan' | 'blue' | 'purple' | 'emerald' | 'green' | 'slate';

interface InfoCardProps {
  color?: CardColor;
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<CardColor, { hover: string; glow: string; glowHover: string; iconColor: string }> = {
  cyan:    { hover: 'hover:border-cyan-500/30',    glow: 'bg-cyan-500/5',    glowHover: 'group-hover:bg-cyan-500/10',    iconColor: 'text-cyan-500' },
  blue:    { hover: 'hover:border-blue-500/30',    glow: 'bg-blue-500/5',    glowHover: 'group-hover:bg-blue-500/10',    iconColor: 'text-blue-500' },
  purple:  { hover: 'hover:border-purple-500/30',  glow: 'bg-purple-500/5',  glowHover: 'group-hover:bg-purple-500/10',  iconColor: 'text-purple-500' },
  emerald: { hover: 'hover:border-emerald-500/30', glow: 'bg-emerald-500/5', glowHover: 'group-hover:bg-emerald-500/10', iconColor: 'text-emerald-500' },
  green:   { hover: 'hover:border-green-500/30',   glow: 'bg-green-500/5',   glowHover: 'group-hover:bg-green-500/10',   iconColor: 'text-green-500' },
  slate:   { hover: 'hover:border-slate-500/30',   glow: 'bg-slate-500/5',   glowHover: 'group-hover:bg-slate-500/10',   iconColor: 'text-slate-400' },
};

export function InfoCard({ color = 'cyan', title, icon: Icon, children, className = '' }: InfoCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group ${colors.hover} transition-colors ${className}`}>
      <div className={`absolute -right-10 -top-10 w-32 h-32 ${colors.glow} rounded-full blur-2xl ${colors.glowHover} transition-colors`} />

      {title && Icon && (
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colors.iconColor}`} /> {title}
        </h3>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
