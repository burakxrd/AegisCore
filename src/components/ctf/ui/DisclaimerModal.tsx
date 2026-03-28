import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export default function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-[0_0_50px_-12px_rgba(239,68,68,0.2)]">
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Legal Disclaimer</h2>
            <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest">Authorized Use Only</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300 mb-8 max-h-[40vh] overflow-y-auto pr-2 hide-scrollbar">
          <p>
            The tools provided in the <span className="text-cyan-400 font-semibold">CTF Workspace</span> are designed strictly for educational, research, and authorized security auditing purposes.
          </p>
          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg space-y-3">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
              <span>You must have explicit, mutual consent from the target system's owner before running any exploits, payloads, or scans.</span>
            </p>
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
              <span>The developer(s) of Aegis Core assume <strong className="text-red-400">NO liability</strong> and are not responsible for any misuse, damage, or illegal activities caused by this software.</span>
            </p>
          </div>
          <p>
            By clicking "I Agree", you acknowledge that you are using this platform responsibly, understand the legal boundaries of your jurisdiction, and accept full legal responsibility for your actions.
          </p>
        </div>

        <button
          onClick={onAccept}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_-5px_rgba(239,68,68,0.6)] outline-none"
        >
          <span>I Understand and Agree</span>
        </button>
        <p className="text-center text-[10px] text-slate-500 mt-4 font-mono">
          If you do not agree, please close this tab immediately.
        </p>

      </div>
    </div>
  );
}
