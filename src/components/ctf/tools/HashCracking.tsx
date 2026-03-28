import React, { useState } from 'react';
import { Unlock, Terminal, FileCode, Flame } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { ToolPageHeader, SectionCard, FormField, ToggleSwitch, CommandCard, CollapsibleSection, TipsSection } from '../ui';

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
            <ToolPageHeader
                icon={Unlock}
                title="Hash"
                highlight="Cracking"
                subtitle="HASHCAT & JOHN_THE_RIPPER"
                color="purple"
            />

            {/* ── Configuration ── */}
            <SectionCard title="File Paths">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Hash File Path"
                        value={hashPath}
                        onChange={e => setHashPath(e.target.value)}
                        placeholder="C:\Users\Target\hashes.txt or /tmp/hashes.txt"
                        color="purple"
                    />
                    <FormField
                        label="Wordlist Path"
                        value={wordlist}
                        onChange={e => setWordlist(e.target.value)}
                        placeholder="/usr/share/wordlists/rockyou.txt"
                        color="purple"
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center pt-2">
                    <ToggleSwitch
                        checked={useRules}
                        onChange={setUseRules}
                        label="Apply Hashcat Rules (best64.rule)"
                        color="purple"
                    />
                </div>
            </SectionCard>

            {/* ── Hash Type Selector ── */}
            <SectionCard>
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
            </SectionCard>

            {/* ── Generated Commands ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CommandCard icon={Flame} label="Hashcat" note="GPU Accelerated" command={hashcatCmd} color="purple" />
                <CommandCard icon={Terminal} label="John The Ripper" note="CPU Fallback" command={johnCmd} color="purple" />
            </div>

            {/* ── Wordlist Quick Select ── */}
            <CollapsibleSection title="Quick Wordlist Select" icon={FileCode}>
                <div className="space-y-1.5">
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
            </CollapsibleSection>

            {/* ── Tips ── */}
            <TipsSection title="Cracking Tips" tips={TIPS} color="purple" className="mb-6" />
        </div>
    );
}