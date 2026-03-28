import React from 'react';
import { Globe, Crosshair } from 'lucide-react';
import { isValidIpInput } from '../../utils/validators';

function formatIPv4Input(value: string): string {
  let val = value.replace(/[^0-9.]/g, '');

  if (val.startsWith('.')) {
    val = val.substring(1);
  }

  val = val.replace(/\.\.+/g, '.');

  let parts = val.split('.');
  if (parts.length > 4) {
    parts = parts.slice(0, 4);
  }

  const validParts = parts.map(part => {
    if (part !== '' && parseInt(part, 10) > 255) {
      return part.slice(0, -1);
    }
    return part;
  });

  return validParts.join('.');
}

// ─── Props ────────────────────────────────────────────────────────
interface TargetConfigBarProps {
  lhost: string;
  rhost: string;
  onLhostChange: (value: string) => void;
  onRhostChange: (value: string) => void;
}

export default function TargetConfigBar({ lhost, rhost, onLhostChange, onRhostChange }: TargetConfigBarProps) {
  const lhostError = lhost && !isValidIpInput(lhost);
  const rhostError = rhost && !isValidIpInput(rhost);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 group">
        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
          LHOST <span className="text-slate-600">// Your IP</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={lhost}
            onChange={(e) => onLhostChange(formatIPv4Input(e.target.value))}
            placeholder="10.10.14.xx"
            className={`w-full bg-slate-900/70 border rounded-xl px-4 py-3 text-sm font-mono text-cyan-400 placeholder-slate-600 focus:outline-none transition-all ${lhostError
              ? 'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_15px_-4px_rgba(239,68,68,0.2)]'
              : 'border-slate-700/60 focus:border-cyan-500/50 focus:shadow-[0_0_15px_-4px_rgba(6,182,212,0.2)]'
              }`}
          />
          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        </div>
      </div>
      <div className="flex-1 group">
        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
          RHOST <span className="text-slate-600">// Target IP</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={rhost}
            onChange={(e) => onRhostChange(formatIPv4Input(e.target.value))}
            placeholder="10.10.10.xx"
            className={`w-full bg-slate-900/70 border rounded-xl px-4 py-3 text-sm font-mono text-red-400 placeholder-slate-600 focus:outline-none transition-all ${rhostError
              ? 'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_15px_-4px_rgba(239,68,68,0.2)]'
              : 'border-slate-700/60 focus:border-red-500/50 focus:shadow-[0_0_15px_-4px_rgba(239,68,68,0.2)]'
              }`}
          />
          <Crosshair className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        </div>
      </div>
    </div>
  );
}
