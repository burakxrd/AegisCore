import React, { useState } from 'react';
import { Unlock, Terminal, FileCode, Search, ChevronDown, ChevronUp, CheckCircle2, Zap, Flame } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';

// ─── Props ────────────────────────────────────────────────────────
interface HashCrackingProps {
    lhost?: string;
    rhost?: string;
}

// ─── Hash Types Database ──────────────────────────────────────────
const HASH_TYPES = [
    { label: 'MD5', hc: '0', john: 'Raw-MD5', example: '8743b52063cd84097a65d1633f5c74f5' },
    { label: 'SHA1', hc: '100', john: 'Raw-SHA1', example: 'b89eaac7e61417341b710b727768294d0e6a277b' },
    { label: 'SHA256', hc: '1400', john: 'Raw-SHA256', example: '127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935' },
    { label: 'SHA512', hc: '1700', john: 'Raw-SHA512', example: '... (very long)' },
    { label: 'NTLM (Windows)', hc: '1000', john: 'NT', example: 'b4b9b02e6f09a9bd760f388b67351e2b' },
    { label: 'NetNTLMv2', hc: '5600', john: 'netntlmv2', example: 'admin::domain:1122334455667788:0000...:0101...' },
    { label: 'Bcrypt', hc: '3200', john: 'bcrypt', example: '$2a$05$LhayLxezLhK1LhWvKxCyLOj0j1u.Kj0jZ0pEjj11YIl/Z5k1k...' },
    { label: 'Kerberos 5 AS-REP (Roasting)', hc: '18200', john: 'krb5asrep', example: '$krb5asrep$23$user@domain:...' },
    { label: 'Kerberos 5 TGS-REP (Roasting)', hc: '13100', john: 'krb5tgs', example: '$krb5tgs$23$*user$domain$test/spn*$' },
    { label: 'Linux /etc/shadow (SHA512)', hc: '1800', john: 'sha512crypt', example: '$6$rounds=...$...' }
];

// ─── Wordlists ────────────────────────────────────────────────────
const WORDLISTS = [
    { label: 'rockyou.txt', path: '/usr/share/wordlists/rockyou.txt', note: 'Standard CTF list (14M words)' },
    { label: 'fasttrack.txt', path: '/usr/share/wordlists/fasttrack.txt', note: 'Very fast, common passwords' },
    { label: 'SecLists (Passwords)', path: '/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-100000.txt', note: 'Top 100k passwords' }
];

// ─── Tips ─────────────────────────────────────────────────────────
const TIPS = [
    'File paths in commands are automatically enclosed in quotes to handle spaces in Windows or Linux paths seamlessly.',
    'If cracking Linux /etc/shadow, remember to run "unshadow /etc/passwd /etc/shadow > unshadowed.txt" first for John The Ripper.',
    'If hashcat throws a "Line-length exception", you likely selected the wrong hash mode (-m).',
    'For Kerberoasting, you can save the direct output of Rubeus or Impacket to a text file and provide its path here.',
];

// ─── Component ────────────────────────────────────────────────────
export default function HashCracking({ rhost }: HashCrackingProps) {
    const [hashPath, setHashPath] = useState('');
    const [wordlist, setWordlist] = useState('/usr/share/wordlists/rockyou.txt');
    const [hashIndex, setHashIndex] = useState(0);
    const [useRules, setUseRules] = useState(false);
    const [showWordlists, setShowWordlists] = useState(false);
    const [showTips, setShowTips] = useState(false);

    const activeHash = HASH_TYPES[hashIndex];

    // Format paths securely (prevent duplicate quotes)
    const formatPath = (p: string, defaultPath: string) => {
        if (!p) return `"${defaultPath}"`;
        const cleaned = p.trim().replace(/^["']|["']$/g, '');
        return `"${cleaned}"`;
    };

    const safeHashPath = formatPath(hashPath, 'hashes.txt');
    const safeWordlist = formatPath(wordlist, '/usr/share/wordlists/rockyou.txt');
    const ruleFlag = useRules ? ' -r /usr/share/hashcat/rules/best64.rule' : '';

    // Command Builders
    const hashcatCmd = `hashcat -m ${activeHash.hc} -a 0 ${safeHashPath} ${safeWordlist}${ruleFlag}`;
    const johnCmd = `john --format=${activeHash.john} --wordlist=${safeWordlist} ${safeHashPath}`;

    return (
        <div className="space-y-6">
            {/* ── Section Title ── */}
            <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Unlock className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Hash <span className="text-purple-400">Cracking</span></h3>
                    <p className="text-[11px] text-slate-500 font-mono">HASHCAT & JOHN_THE_RIPPER</p>
                </div>
            </div>

            {/* ── Configuration ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">File Paths</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Hash File Path</label>
                        <input
                            type="text"
                            value={hashPath}
                            onChange={e => setHashPath(e.target.value)}
                            placeholder="C:\Users\Target\hashes.txt or /tmp/hashes.txt"
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-purple-400 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_15px_-4px_rgba(168,85,247,0.2)] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Wordlist Path</label>
                        <input
                            type="text"
                            value={wordlist}
                            onChange={e => setWordlist(e.target.value)}
                            placeholder="/usr/share/wordlists/rockyou.txt"
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-purple-400 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_15px_-4px_rgba(168,85,247,0.2)] transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center pt-2">
                    <div
                        onClick={() => setUseRules(!useRules)}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <div className={`w-8 h-4 rounded-full transition-all relative ${useRules ? 'bg-purple-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${useRules ? 'left-[18px]' : 'left-0.5'}`} />
                        </div>
                        <span className="text-xs text-slate-400 font-mono group-hover:text-slate-300 transition-colors">
                            Apply Hashcat Rules (best64.rule)
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Hash Type Selector ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Hash Type Identifier</h4>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                        Selected: -m {activeHash.hc}
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {HASH_TYPES.map((ht, idx) => (
                        <button
                            key={idx}
                            onClick={() => setHashIndex(idx)}
                            className={`px-3 py-2 rounded-xl text-left transition-all cursor-pointer border ${hashIndex === idx
                                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_15px_-4px_rgba(168,85,247,0.2)]'
                                    : 'bg-slate-900/40 border-slate-700/30 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                }`}
                        >
                            <span className="block text-xs font-bold font-mono">{ht.label}</span>
                            <span className="block text-[9px] mt-0.5 opacity-70 font-mono truncate">{ht.example}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Generated Commands ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hashcat Card */}
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden group/cmd transition-colors hover:border-purple-500/30">
                    <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-bold font-mono text-purple-400">Hashcat</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">GPU Accelerated</span>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                        <code className="text-xs font-mono text-green-400/90 break-all leading-relaxed">
                            {hashcatCmd}
                        </code>
                        <div className="flex justify-end">
                            <CopyButton text={hashcatCmd} />
                        </div>
                    </div>
                </div>

                {/* John The Ripper Card */}
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden group/cmd transition-colors hover:border-purple-500/30">
                    <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-bold font-mono text-purple-400">John The Ripper</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">CPU Fallback</span>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                        <code className="text-xs font-mono text-green-400/90 break-all leading-relaxed">
                            {johnCmd}
                        </code>
                        <div className="flex justify-end">
                            <CopyButton text={johnCmd} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Wordlist Quick Select ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
                <button
                    onClick={() => setShowWordlists(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/20 transition-colors cursor-pointer"
                >
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-slate-400" />
                        Quick Wordlist Select
                    </h4>
                    {showWordlists ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {showWordlists && (
                    <div className="px-5 pb-5 space-y-1.5 animate-page-in">
                        {WORDLISTS.map((wl, i) => (
                            <div
                                key={i}
                                onClick={() => setWordlist(wl.path)}
                                className="flex items-center justify-between bg-[#0b0f19] border border-slate-800/50 rounded-xl px-4 py-3 group/wl hover:border-purple-500/20 transition-colors cursor-pointer"
                            >
                                <div>
                                    <span className="text-xs font-mono font-bold text-slate-300 group-hover/wl:text-purple-400 transition-colors block">{wl.label}</span>
                                    <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">{wl.note}</span>
                                </div>
                                <div className="opacity-0 group-hover/wl:opacity-100 transition-opacity">
                                    <span className="text-[10px] text-purple-500/50 font-mono uppercase tracking-widest font-bold">Use</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Tips ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden mb-6">
                <button
                    onClick={() => setShowTips(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/20 transition-colors cursor-pointer"
                >
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cracking Tips</h4>
                    {showTips ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {showTips && (
                    <div className="px-5 pb-5 space-y-2 animate-page-in">
                        {TIPS.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 bg-slate-900/30 border border-slate-800/30 rounded-xl p-4">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500/60 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-400 leading-relaxed">{tip}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}