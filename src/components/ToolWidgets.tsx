import React from 'react';
import { FileUp, ShieldCheck } from 'lucide-react';
import { CopyButton } from './CopyButtons';

// --- Drag & Drop Overlay ---
interface DragOverlayProps {
  visible: boolean;
}

export function DragOverlay({ visible }: DragOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-500 rounded-3xl flex items-center justify-center z-20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <FileUp className="w-10 h-10 text-cyan-400 animate-bounce" />
        <span className="text-cyan-400 font-mono text-sm font-bold tracking-wider">DROP FILE HERE</span>
      </div>
    </div>
  );
}

// --- Security Notice Footer ---
interface SecurityNoticeProps {
  message: string;
}

export function SecurityNotice({ message }: SecurityNoticeProps) {
  return (
    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-center gap-3">
      <ShieldCheck className="w-5 h-5 text-blue-500/50" aria-hidden="true" />
      <p className="text-[10px] text-blue-400/60 font-mono uppercase tracking-widest text-center">
        {message}
      </p>
    </div>
  );
}

// --- Target Locked Banner ---
interface TargetLockedBannerProps {
  query: string;
  showCopy?: boolean;
}

export function TargetLockedBanner({ query, showCopy = true }: TargetLockedBannerProps) {
  return (
    <div className="flex items-center gap-3 bg-cyan-950/30 border border-cyan-500/30 py-3 px-5 rounded-xl">
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,1)]" />
      <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Target Locked:</span>
      <span className="text-cyan-400 font-mono font-bold tracking-wider">{query}</span>
      {showCopy && <CopyButton text={query} />}
    </div>
  );
}
