import React, { useState, useCallback, useMemo } from 'react';
import { Terminal, Zap, Shield, RefreshCw } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { ToolPageHeader, SectionCard, FormField, CollapsibleSection } from '../ui';

// ─── Props ────────────────────────────────────────────────────────
interface ReverseShellProps {
    rhost: string;
    lhost: string;
}

import { Category, ShellEntry, SHELLS, STABILIZE_STEPS, LISTENERS, CATEGORIES } from '../../../data/ctf-reverse-shells';

// ─── Component ────────────────────────────────────────────────────
export default function ReverseShell({ rhost, lhost }: ReverseShellProps) {
    const [port, setPort] = useState('4444');
    const [customLhost, setCustomLhost] = useState('');
    const [activeCategory, setActiveCategory] = useState<Category>('bash');
    const [osFilter, setOsFilter] = useState<'all' | 'linux' | 'windows'>('all');
    const [selectedShell, setSelectedShell] = useState<ShellEntry | null>(null);

    const effectiveLhost = customLhost || lhost || '$LHOST';
    const effectivePort = port || '4444';

    const filteredShells = useMemo(() => {
        return SHELLS.filter(s => {
            if (s.category !== activeCategory) return false;
            if (osFilter === 'linux' && !s.linux) return false;
            if (osFilter === 'windows' && !s.windows) return false;
            return true;
        });
    }, [activeCategory, osFilter]);

    // Auto-select first shell when category/filter changes
    React.useEffect(() => {
        setSelectedShell(filteredShells[0] ?? null);
    }, [filteredShells]);

    const generatedCommand = selectedShell
        ? selectedShell.cmd(effectiveLhost, effectivePort)
        : '';

    return (
        <>
            <ToolPageHeader
                icon={Terminal}
                title="Reverse Shell"
                highlight="Generator"
                subtitle="PAYLOAD_BUILDER & LISTENER_REFERENCE"
                color="red"
            />

            {/* ── Connection Config ── */}
            <SectionCard title="Connection Config">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* LHOST override */}
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                            LHOST <span className="text-slate-600">// Your IP</span>
                        </label>
                        <input
                            type="text"
                            value={customLhost}
                            onChange={e => setCustomLhost(e.target.value.replace(/[^0-9a-fA-F.:]/g, ''))}
                            placeholder={lhost || '10.10.14.xx'}
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_-4px_rgba(6,182,212,0.2)] transition-all"
                        />
                        {!customLhost && lhost && (
                            <p className="text-[10px] font-mono text-slate-600 mt-1">
                                Using RHOST bar value: <span className="text-cyan-500/60">{lhost}</span>
                            </p>
                        )}
                    </div>

                    {/* Port */}
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                            LPORT <span className="text-slate-600">// Listener port</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={port}
                                onChange={e => setPort(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                placeholder="4444"
                                className="flex-1 bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-red-400 placeholder-slate-600 focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_15px_-4px_rgba(239,68,68,0.2)] transition-all"
                            />
                            {/* Quick port presets */}
                            <div className="flex gap-1">
                                {['443', '80', '1337', '9001'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPort(p)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border ${port === p
                                                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                                : 'bg-slate-800/50 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* OS Filter */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">OS Target:</span>
                    <div className="flex bg-slate-900 border border-slate-700/50 p-1 rounded-xl">
                        {(['all', 'linux', 'windows'] as const).map(os => (
                            <button
                                key={os}
                                onClick={() => setOsFilter(os)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${osFilter === os
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {os.charAt(0).toUpperCase() + os.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* ── Category Tabs ── */}
            <SectionCard title="Language / Tool">
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => {
                        const count = SHELLS.filter(s => {
                            if (s.category !== cat.id) return false;
                            if (osFilter === 'linux' && !s.linux) return false;
                            if (osFilter === 'windows' && !s.windows) return false;
                            return true;
                        }).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border ${activeCategory === cat.id
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_16px_-4px_rgba(239,68,68,0.3)]'
                                        : 'bg-slate-900/40 border-slate-700/30 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                    }`}
                            >
                                {cat.label}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${activeCategory === cat.id ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-600'
                                    }`}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Shell variants within category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredShells.map(shell => (
                        <button
                            key={shell.id}
                            onClick={() => setSelectedShell(shell)}
                            className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl text-left transition-all border ${selectedShell?.id === shell.id
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-slate-900/30 border-slate-800/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-2 w-full">
                                <span className="text-xs font-bold font-mono">{shell.label}</span>
                                <div className="flex gap-1 ml-auto">
                                    {shell.linux && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">Linux</span>
                                    )}
                                    {shell.windows && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-500/70 font-mono">Win</span>
                                    )}
                                    {shell.encode && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-900/20 text-yellow-500/70 font-mono">URL-enc</span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-600 leading-relaxed">{shell.description}</span>
                        </button>
                    ))}
                </div>
            </SectionCard>

            {/* ── Generated Payload ── */}
            {selectedShell && (
                <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-5 space-y-3 shadow-[0_0_30px_-8px_rgba(239,68,68,0.15)]">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" />
                            {selectedShell.label}
                        </h4>
                        <div className="flex items-center gap-2">
                            {selectedShell.encode && (
                                <span className="text-[10px] font-mono text-yellow-500/70 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg">
                                    URL-encode before injecting
                                </span>
                            )}
                            <CopyButton text={generatedCommand} />
                        </div>
                    </div>
                    <div className="bg-[#0b0f19] border border-red-500/10 rounded-xl p-4">
                        <pre className="text-sm font-mono text-green-400/90 whitespace-pre-wrap break-all leading-relaxed select-all">
                            {generatedCommand}
                        </pre>
                    </div>

                    {/* URL-encoded version */}
                    {selectedShell.encode && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">URL-encoded:</p>
                            <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-4 flex items-start gap-2">
                                <pre className="flex-1 text-xs font-mono text-yellow-400/80 whitespace-pre-wrap break-all leading-relaxed">
                                    {encodeURIComponent(generatedCommand)}
                                </pre>
                                <CopyButton text={encodeURIComponent(generatedCommand)} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Listener Commands ── */}
            <CollapsibleSection title="Start Your Listener" icon={Shield} defaultOpen={true}>
                <div className="space-y-2">
                    {LISTENERS.map(listener => {
                        const cmd = listener.cmd(effectivePort);
                        return (
                            <div key={listener.label} className="bg-[#0b0f19] border border-slate-800/50 rounded-xl px-4 py-3 flex items-center gap-3 group/cmd">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest w-24 flex-shrink-0">{listener.label}</span>
                                <code className="flex-1 text-xs font-mono text-green-400/80 break-all">{cmd}</code>
                                <CopyButton text={cmd} />
                            </div>
                        );
                    })}
                </div>
            </CollapsibleSection>

            {/* ── Shell Stabilization ── */}
            <CollapsibleSection title="Shell Stabilization" icon={RefreshCw}>
                <div className="space-y-3">
                    <p className="text-[11px] text-slate-500 font-mono">
                        Raw reverse shells break on Ctrl+C and lack tab completion. Stabilize immediately after catching the shell.
                    </p>
                    {STABILIZE_STEPS.map((step, i) => (
                        <div key={i} className="bg-slate-900/30 border border-slate-800/30 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold font-mono text-cyan-500/60 bg-cyan-500/10 border border-cyan-500/20 w-5 h-5 rounded-md flex items-center justify-center">{i + 1}</span>
                                    <span className="text-xs font-bold text-white">{step.title}</span>
                                </div>
                                <CopyButton text={step.cmd} />
                            </div>
                            <div className="bg-[#0b0f19] border border-slate-800/50 rounded-lg px-3 py-2">
                                <pre className="text-xs font-mono text-green-400/80 whitespace-pre-wrap">{step.cmd}</pre>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono">{step.note}</p>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
        </>
    );
}