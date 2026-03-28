import React, { useState, useCallback } from 'react';
import { Search, Zap, BookOpen } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { ToolPageHeader, SectionCard, CollapsibleSection, TipsSection, ToggleSwitch } from '../ui';

// ─── Types ────────────────────────────────────────────────────────
interface WebFuzzingProps {
    rhost: string;
    lhost: string;
}

type Tool = 'ffuf' | 'gobuster' | 'feroxbuster';
type FuzzType = 'directory' | 'extension' | 'vhost' | 'parameter' | 'backup';

interface FuzzOptions {
    protocol: 'http' | 'https';
    port: string;
    path: string;
    wordlist: string;
    extensions: string;
    matchCodes: string;
    filterSize: string;
    filterCodes: string;
    threads: string;
    recursion: boolean;
    followRedirects: boolean;
    domain: string;
}

// ─── Wordlist Reference Data ──────────────────────────────────────
const WORDLISTS: { label: string; path: string; note: string }[] = [
    { label: 'common.txt', path: '/usr/share/seclists/Discovery/Web-Content/common.txt', note: '4.7k — fast, high signal' },
    { label: 'directory-list-2.3-medium', path: '/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt', note: '220k — standard recon' },
    { label: 'raft-medium-directories', path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt', note: '30k — common dirs' },
    { label: 'raft-medium-files', path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt', note: '17k — common files' },
    { label: 'subdomains-top5000', path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt', note: '5k — vhost/subdomain' },
    { label: 'burp-parameter-names', path: '/usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt', note: '6.5k — GET params' },
    { label: 'big.txt', path: '/usr/share/seclists/Discovery/Web-Content/big.txt', note: '20k — broader sweep' },
    { label: 'rockyou.txt', path: '/usr/share/wordlists/rockyou.txt', note: '14M — passwords / brute' },
];

const FUZZ_TYPES: { id: FuzzType; label: string; desc: string }[] = [
    { id: 'directory', label: 'Directory', desc: 'Hidden paths & directories' },
    { id: 'extension', label: 'Extensions', desc: 'File types (.php, .bak…)' },
    { id: 'vhost', label: 'VHost', desc: 'Virtual host enumeration' },
    { id: 'parameter', label: 'Parameters', desc: 'GET/POST param discovery' },
    { id: 'backup', label: 'Backup', desc: 'Backup & config leaks' },
];

// ─── Command Builders ─────────────────────────────────────────────
function buildCommand(tool: Tool, type: FuzzType, opts: FuzzOptions, rhost: string): string {
    const target = rhost || '$RHOST';
    const port = opts.port ? `:${opts.port}` : '';
    const base = `${opts.protocol}://${target}${port}`;
    const mc = opts.matchCodes || '200,301,302,403';
    const fc = opts.filterCodes ? `,-${opts.filterCodes}` : '';
    const fs = opts.filterSize ? ` -fs ${opts.filterSize}` : '';
    const threads = opts.threads || '40';
    const ext = opts.extensions || 'php,html,txt,bak';
    const wl = opts.wordlist || '/usr/share/seclists/Discovery/Web-Content/common.txt';
    const path = opts.path || '/';
    const domain = opts.domain || target;

    if (tool === 'ffuf') {
        switch (type) {
            case 'directory':
                return `ffuf -w ${wl} -u ${base}${path}FUZZ -mc ${mc}${fc}${fs} -t ${threads} -v`;
            case 'extension':
                return `ffuf -w ${wl}:FUZZ -u ${base}${path}FUZZ.${ext.replace(/,/g, ' -e .')} -mc ${mc}${fc}${fs} -t ${threads}`;
            case 'vhost':
                return `ffuf -w ${wl} -u ${base}/ -H "Host: FUZZ.${domain}" -mc ${mc}${fc}${fs} -t ${threads}`;
            case 'parameter':
                return `ffuf -w ${wl} -u "${base}${path}?FUZZ=test" -mc ${mc}${fc}${fs} -t ${threads} -v`;
            case 'backup':
                return `ffuf -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -u ${base}${path}FUZZ -e .bak,.old,.orig,.swp,.zip,.tar.gz -mc ${mc}${fc}${fs} -t ${threads}`;
        }
    }

    if (tool === 'gobuster') {
        switch (type) {
            case 'directory':
                return `gobuster dir -u ${base}${path} -w ${wl} -x ${ext} -s "${mc}" -t ${threads}${opts.followRedirects ? ' -r' : ''}`;
            case 'extension':
                return `gobuster dir -u ${base}${path} -w ${wl} -x ${ext} -t ${threads}`;
            case 'vhost':
                return `gobuster vhost -u ${base}/ -w ${wl} --append-domain -t ${threads}`;
            case 'parameter':
                return `# gobuster does not natively support param fuzzing\n# Use ffuf or arjun instead:\narjun -u ${base}${path} -m GET`;
            case 'backup':
                return `gobuster dir -u ${base}${path} -w ${wl} -x bak,old,orig,swp,zip,tar.gz -s "${mc}" -t ${threads}`;
        }
    }

    if (tool === 'feroxbuster') {
        switch (type) {
            case 'directory':
                return `feroxbuster -u ${base}${path} -w ${wl} -x ${ext} --status-codes ${mc} -t ${threads}${opts.recursion ? ' --depth 3' : ' --depth 1'}`;
            case 'extension':
                return `feroxbuster -u ${base}${path} -w ${wl} -x ${ext} --status-codes ${mc} -t ${threads}`;
            case 'vhost':
                return `# feroxbuster does not support vhost fuzzing natively\n# Use ffuf instead:\nffuf -w ${wl} -u ${base}/ -H "Host: FUZZ.${domain}" -mc ${mc}${fs}`;
            case 'parameter':
                return `# feroxbuster does not support param fuzzing natively\n# Use arjun instead:\narjun -u ${base}${path}`;
            case 'backup':
                return `feroxbuster -u ${base}${path} -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -x bak,old,orig,swp,zip --status-codes ${mc} -t ${threads}`;
        }
    }

    return '';
}

// ─── Tips per fuzz type ───────────────────────────────────────────
const TIPS: Record<FuzzType, string[]> = {
    directory: ['Start with common.txt for speed, then escalate to medium.', 'Check 403 responses — sometimes accessible with different methods.', 'Look for /api/, /admin/, /backup/, /dev/, /v1/ specifically.'],
    extension: ['php, asp, aspx, jsp, py, rb vary by stack — check response headers first.', '.bak, .old, .orig files can contain source code.', 'Combine with directory fuzzing for maximum coverage.'],
    vhost: ['Always filter by response size (-fs) to remove false positives.', 'Add discovered vhosts to /etc/hosts immediately.', 'Check SSL certificate SANs for hidden subdomains first (free recon).'],
    parameter: ['Arjun is the best dedicated tool for this — install if not present.', 'Test each parameter for LFI, SSRF, SQLi after discovery.', 'POST params often missed by scanners — check form sources manually.'],
    backup: ['Target: config.php, .env, wp-config.php, settings.py, database.yml', 'Check .git/, .svn/, .DS_Store for source code leaks.', 'CVS/git repos can expose entire source with git-dumper.'],
};

// ─── Component ───────────────────────────────────────────────────
export default function WebFuzzing({ rhost }: WebFuzzingProps) {
    const [tool, setTool] = useState<Tool>('ffuf');
    const [fuzzType, setFuzzType] = useState<FuzzType>('directory');
    const [opts, setOpts] = useState<FuzzOptions>({
        protocol: 'http',
        port: '',
        path: '/',
        wordlist: '/usr/share/seclists/Discovery/Web-Content/common.txt',
        extensions: 'php,html,txt,bak',
        matchCodes: '200,301,302,403',
        filterSize: '',
        filterCodes: '',
        threads: '40',
        recursion: false,
        followRedirects: false,
        domain: '',
    });

    const setOpt = useCallback(<K extends keyof FuzzOptions>(key: K, val: FuzzOptions[K]) => {
        setOpts(prev => ({ ...prev, [key]: val }));
    }, []);

    const command = buildCommand(tool, fuzzType, opts, rhost);

    // ─── Input helper ──────────────────────────────────────────────
    const Field = ({ label, field, placeholder, hint }: { label: string; field: keyof FuzzOptions; placeholder?: string; hint?: string }) => (
        <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
            <input
                type="text"
                value={opts[field] as string}
                onChange={e => setOpt(field, e.target.value as any)}
                placeholder={placeholder}
                className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_12px_-4px_rgba(6,182,212,0.2)] transition-all"
            />
            {hint && <p className="text-[10px] text-slate-600 font-mono mt-1">{hint}</p>}
        </div>
    );

    return (
        <>
            <ToolPageHeader
                icon={Search}
                title="Web"
                highlight="Fuzzing"
                subtitle="COMMAND_GENERATOR & WORDLIST_REFERENCE"
                color="cyan"
            />

            {/* ── Tool Selector ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Fuzzing Tool</h4>
                <div className="flex gap-2 flex-wrap">
                    {(['ffuf', 'gobuster', 'feroxbuster'] as Tool[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTool(t)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer border ${tool === t
                                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-[0_0_16px_-4px_rgba(6,182,212,0.3)]'
                                    : 'bg-slate-900/50 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Fuzzing Type ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Fuzzing Type</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {FUZZ_TYPES.map(ft => (
                        <button
                            key={ft.id}
                            onClick={() => setFuzzType(ft.id)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all cursor-pointer border ${fuzzType === ft.id
                                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                    : 'bg-slate-900/40 border-slate-700/30 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                }`}
                        >
                            <span className="text-xs font-bold">{ft.label}</span>
                            <span className="text-[10px] text-slate-500 leading-tight text-center hidden sm:block">{ft.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Options ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Options</h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Protocol */}
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Protocol</label>
                        <div className="flex rounded-xl overflow-hidden border border-slate-700/60">
                            {(['http', 'https'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setOpt('protocol', p)}
                                    className={`flex-1 py-2.5 text-xs font-bold transition-all cursor-pointer ${opts.protocol === p ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Field label="Port" field="port" placeholder="80 / 8080 (blank = default)" />
                    <Field label="Base Path" field="path" placeholder="/" hint="Path prefix before FUZZ" />
                    <Field label="Threads" field="threads" placeholder="40" />
                </div>

                <Field
                    label="Wordlist"
                    field="wordlist"
                    placeholder="/usr/share/seclists/..."
                    hint="Click a wordlist below to auto-fill"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Extensions" field="extensions" placeholder="php,html,txt,bak" hint="Comma-separated, no dots" />
                    <Field label="Match Codes" field="matchCodes" placeholder="200,301,302,403" hint="HTTP codes to include" />
                    <Field label="Filter Size" field="filterSize" placeholder="e.g. 1234" hint="Hide responses of this byte size" />
                </div>

                {fuzzType === 'vhost' && (
                    <Field label="Domain" field="domain" placeholder="target.htb" hint="Base domain for vhost fuzzing (FUZZ.domain)" />
                )}

                <div className="flex gap-4 pt-1">
                    {['ffuf', 'feroxbuster'].includes(tool) && (
                        <ToggleSwitch
                            checked={opts.recursion}
                            onChange={v => setOpt('recursion', v)}
                            label="Recursion"
                            color="cyan"
                        />
                    )}
                    {tool === 'gobuster' && (
                        <ToggleSwitch
                            checked={opts.followRedirects}
                            onChange={v => setOpt('followRedirects', v)}
                            label="Follow Redirects"
                            color="cyan"
                        />
                    )}
                </div>
            </div>

            {/* ── Generated Command ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        Generated Command
                    </h4>
                    <CopyButton text={command} />
                </div>
                <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-4 relative group/cmd">
                    <pre className="text-sm font-mono text-green-400/90 whitespace-pre-wrap break-all leading-relaxed">{command}</pre>
                </div>
                {!rhost && (
                    <p className="text-[10px] font-mono text-yellow-500/70">
                        ⚠ Set RHOST in the target bar above to populate the IP automatically.
                    </p>
                )}
            </div>

            {/* ── Wordlist Quick Reference ── */}
            <CollapsibleSection title="Wordlist Quick Reference" icon={BookOpen}>
                <div className="space-y-1.5">
                    {WORDLISTS.map(wl => (
                        <div
                            key={wl.path}
                            className="flex items-center gap-3 bg-[#0b0f19] border border-slate-800/50 rounded-xl px-4 py-3 group/wl hover:border-cyan-500/20 transition-colors cursor-pointer"
                            onClick={() => setOpt('wordlist', wl.path)}
                        >
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-mono font-bold text-slate-300 group-hover/wl:text-cyan-400 transition-colors">{wl.label}</span>
                                <span className="text-[10px] font-mono text-slate-500 ml-3">{wl.note}</span>
                            </div>
                            <code className="text-[10px] font-mono text-slate-600 truncate max-w-[40%] hidden sm:block">{wl.path}</code>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <span className="text-[10px] text-cyan-500/50 font-mono group-hover/wl:text-cyan-400 transition-colors">USE</span>
                                <CopyButton text={wl.path} />
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>

            {/* ── Tips ── */}
            <TipsSection
                title={`${FUZZ_TYPES.find(f => f.id === fuzzType)?.label} — Recon Tips`}
                tips={TIPS[fuzzType]}
                color="cyan"
                defaultOpen
            />
        </>
    );
}