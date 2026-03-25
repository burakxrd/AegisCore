import React from 'react';
import { Shield } from 'lucide-react';
import { KILL_CHAIN } from '../../../data/ctf-menu';

// ─── Props ────────────────────────────────────────────────────────
interface ComingSoonProps {
  activePanel: string;
}

export default function ComingSoon({ activePanel }: ComingSoonProps) {
  const panelLabel = KILL_CHAIN
    .flatMap((c) => c.items)
    .find((i) => i.id === activePanel)?.label ?? 'Module';

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-center mb-6">
        <Shield className="w-10 h-10 text-slate-600" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{panelLabel}</h3>
      <p className="text-sm text-slate-500 font-mono max-w-md">
        This module is under development. Stay tuned for upcoming CTF toolkit features.
      </p>
      <div className="mt-6 inline-block px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
        Coming Soon
      </div>
    </div>
  );
}
