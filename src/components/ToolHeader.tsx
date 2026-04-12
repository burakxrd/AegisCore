import React from 'react';
import { Network, ChevronRight, LucideIcon } from 'lucide-react';
import { LangLink } from './layout/LangLink';
import { useTranslation } from '../i18n';

// --- Breadcrumb ---
interface ToolBreadcrumbProps {
  toolName: string;
}

export function ToolBreadcrumb({ toolName }: ToolBreadcrumbProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 text-sm font-mono tracking-wider text-slate-400 mb-6 uppercase">
      <LangLink to="/tools" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
        <Network className="w-4 h-4" />
        {t('breadcrumb.tools')}
      </LangLink>
      <ChevronRight className="w-4 h-4 text-slate-600" />
      <span className="text-cyan-500/70">{toolName}</span>
    </div>
  );
}

// --- Page Header ---
interface ToolPageHeaderProps {
  icon: LucideIcon;
  title: string;
  highlight: string;
  description: string;
}

export function ToolPageHeader({ icon: Icon, title, highlight, description }: ToolPageHeaderProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
        <Icon className="w-8 h-8 text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
        {title} <span className="text-cyan-500">{highlight}</span>
      </h2>
      <p className="text-slate-400 font-mono text-sm mt-2">{description}</p>
    </div>
  );
}
