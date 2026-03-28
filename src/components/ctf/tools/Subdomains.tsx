import React, { useState, useCallback, useRef } from 'react';
import { Globe, Zap, BookOpen, Copy, Trash2, List, Filter } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { ToolPageHeader, SectionCard, FormField, CollapsibleSection, CommandListSection, TipsSection, ToggleSwitch } from '../ui';

// ─── Props ────────────────────────────────────────────────────────
interface SubdomainsProps {
    rhost: string;
    lhost: string;
}

// ─── Types ───────────────────────────────────────────────────────
type Tool = 'subfinder' | 'amass' | 'ffuf' | 'gobuster' | 'dnsx' | 'assetfinder';

interface CommandOptions {
    domain: string;
    wordlist: string;
    resolver: string;
    threads: string;
    timeout: string;
    outputFile: string;
    silent: boolean;
    recursive: boolean;
}

// ─── Wordlists ────────────────────────────────────────────────────
const WORDLISTS = [
    {
        label: 'subdomains-top1million-5000',
        path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt',
        note: '5k — fast, high signal',
    },
    {
        label: 'subdomains-top1million-20000',
        path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt',
        note: '20k — balanced coverage',
    },
    {
        label: 'subdomains-top1million-110000',
        path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt',
        note: '110k — deep recon',
    },
    {
        label: 'dns-Jhaddix.txt',
        path: '/usr/share/seclists/Discovery/DNS/dns-Jhaddix.txt',
        note: '166k — Jhaddix curated',
    },
    {
        label: 'bitquark-subdomains-top100000',
        path: '/usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt',
        note: '100k — bitquark list',
    },
    {
        label: 'deepmagic.com-prefixes-top500',
        path: '/usr/share/seclists/Discovery/DNS/deepmagic.com-prefixes-top500.txt',
        note: '500 — quick prefixes',
    },
];

// ─── Passive Sources Info ─────────────────────────────────────────
const PASSIVE_SOURCES = [
    { label: 'crt.sh', cmd: (d: string) => `curl -s "https://crt.sh/?q=%25.${d}&output=json" | jq -r '.[].name_value' | sed 's/\\*\\.//g' | sort -u`, note: 'CT logs — no auth needed' },
    { label: 'subfinder', cmd: (d: string) => `subfinder -d ${d} -silent -all`, note: 'Multi-source passive OSINT' },
    { label: 'amass (passive)', cmd: (d: string) => `amass enum -passive -d ${d}`, note: 'OWASP amass passive mode' },
    { label: 'assetfinder', cmd: (d: string) => `assetfinder --subs-only ${d}`, note: 'Tomnomnom — fast passive' },
    { label: 'theHarvester', cmd: (d: string) => `theHarvester -d ${d} -b all`, note: 'Email + subdomain harvest' },
    { label: 'Shodan (manual)', cmd: (d: string) => `# Search: hostname:${d}`, note: 'Shodan.io — paid API or web UI' },
];

// ─── Tips ─────────────────────────────────────────────────────────
const TIPS = [
    'Always start with passive recon (crt.sh, subfinder) before active brute force — no noise on the wire.',
    'Combine multiple tools and deduplicate: `cat results*.txt | sort -u > all_subs.txt`',
    'Filter out wildcard DNS with: `ffuf -fw <wildcard_size>` or check if *.domain resolves.',
    'After discovery, run `httpx -l all_subs.txt` to find which subdomains have live web servers.',
    'Check for subdomain takeovers with `subjack` or `nuclei -t takeovers/` on all discovered subs.',
    'Virtual hosts ≠ DNS subdomains — also fuzz vhosts via `ffuf -H "Host: FUZZ.domain"` on the IP directly.',
];

// ─── Command Builders ─────────────────────────────────────────────
function buildCommand(tool: Tool, opts: CommandOptions): string {
    const d = opts.domain || '$TARGET';
    const wl = opts.wordlist || '/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt';
    const t = opts.threads || '50';
    const resolver = opts.resolver ? `@${opts.resolver}` : '';
    const out = opts.outputFile ? ` -o ${opts.outputFile}` : '';

    switch (tool) {
        case 'subfinder':
            return [
                `subfinder -d ${d}`,
                opts.silent ? '-silent' : '-v',
                '-all',
                opts.resolver ? `-r ${opts.resolver}` : '',
                opts.outputFile ? `-o ${opts.outputFile}` : '',
            ].filter(Boolean).join(' ');

        case 'amass':
            return [
                `amass enum -brute -d ${d}`,
                `-w ${wl}`,
                opts.resolver ? `-r ${opts.resolver}` : '',
                `-T ${opts.timeout || '10'}`,
                opts.recursive ? '-rf' : '',
                opts.outputFile ? `-o ${opts.outputFile}` : '',
            ].filter(Boolean).join(' ');

        case 'ffuf':
            return [
                `ffuf -w ${wl}:FUZZ`,
                `-u https://${d}/`,
                `-H "Host: FUZZ.${d}"`,
                `-mc 200,301,302,401,403`,
                `-t ${t}`,
                opts.outputFile ? `-o ${opts.outputFile} -of json` : '',
            ].filter(Boolean).join(' ') + `\n# Then filter false positives:\n# ffuf ... -fs <wildcard_size>`;

        case 'gobuster':
            return [
                `gobuster dns -d ${d}`,
                `-w ${wl}`,
                opts.resolver ? `-r ${opts.resolver}` : '',
                `-t ${t}`,
                '--show-cname',
                opts.outputFile ? `-o ${opts.outputFile}` : '',
            ].filter(Boolean).join(' ');

        case 'dnsx':
            return [
                `# Step 1 — Generate candidates:`,
                `cat ${wl} | awk '{print $0".${d}"}' > candidates.txt`,
                ``,
                `# Step 2 — Resolve with dnsx:`,
                `dnsx -l candidates.txt`,
                opts.resolver ? `-r ${opts.resolver}` : '-r 1.1.1.1',
                `-t ${t}`,
                '-resp',
                opts.outputFile ? `-o ${opts.outputFile}` : '',
            ].filter(Boolean).join(' ');

        case 'assetfinder':
            return `assetfinder --subs-only ${d}${opts.outputFile ? ` | tee ${opts.outputFile}` : ''}`;

        default:
            return '';
    }
}

// ─── Results Parser ───────────────────────────────────────────────
function parseSubdomains(raw: string, filterDomain: string): string[] {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const subdomainRegex = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}/gi;
    const found = new Set<string>();

    for (const line of lines) {
        const matches = line.match(subdomainRegex);
        if (matches) {
            for (const m of matches) {
                const lower = m.toLowerCase();
                if (!filterDomain || lower.includes(filterDomain.toLowerCase())) {
                    found.add(lower);
                }
            }
        }
    }

    return Array.from(found).sort();
}

// ─── Component ────────────────────────────────────────────────────
export default function Subdomains({ rhost }: SubdomainsProps) {
    const [tool, setTool] = useState<Tool>('subfinder');
    const [opts, setOpts] = useState<CommandOptions>({
        domain: '',
        wordlist: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt',
        resolver: '',
        threads: '50',
        timeout: '10',
        outputFile: 'subdomains.txt',
        silent: true,
        recursive: false,
    });


    // Results parser state
    const [rawOutput, setRawOutput] = useState('');
    const [parsedSubs, setParsedSubs] = useState<string[]>([]);
    const [filterDomain, setFilterDomain] = useState('');
    const [copiedAll, setCopiedAll] = useState(false);

    const setOpt = useCallback(<K extends keyof CommandOptions>(key: K, val: CommandOptions[K]) => {
        setOpts(prev => ({ ...prev, [key]: val }));
    }, []);

    const effectiveDomain = opts.domain || rhost || '$TARGET';
    const command = buildCommand(tool, { ...opts, domain: effectiveDomain });

    const handleParse = useCallback(() => {
        const results = parseSubdomains(rawOutput, filterDomain || opts.domain || rhost);
        setParsedSubs(results);
    }, [rawOutput, filterDomain, opts.domain, rhost]);

    const handleClearParser = useCallback(() => {
        setRawOutput('');
        setParsedSubs([]);
    }, []);

    const handleCopyAll = useCallback(() => {
        if (!parsedSubs.length) return;
        navigator.clipboard.writeText(parsedSubs.join('\n'));
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    }, [parsedSubs]);

    const TOOLS: { id: Tool; label: string; note: string }[] = [
        { id: 'subfinder', label: 'subfinder', note: 'passive + API' },
        { id: 'amass', label: 'amass', note: 'active brute' },
        { id: 'ffuf', label: 'ffuf', note: 'vhost / DNS' },
        { id: 'gobuster', label: 'gobuster', note: 'dns mode' },
        { id: 'dnsx', label: 'dnsx', note: 'resolver' },
        { id: 'assetfinder', label: 'assetfinder', note: 'passive' },
    ];

    const needsWordlist = ['amass', 'ffuf', 'gobuster', 'dnsx'].includes(tool);
    const needsThreads = ['ffuf', 'gobuster', 'dnsx', 'subfinder'].includes(tool);

    return (
        <>
            <ToolPageHeader
                icon={Globe}
                title="Subdomain"
                highlight="Enumeration"
                subtitle="COMMAND_GENERATOR & RESULTS_PARSER"
                color="cyan"
            />

            {/* ── Target Domain ── */}
            <SectionCard title="Target Domain">
                <div>
                    <FormField
                        label="Domain"
                        value={opts.domain}
                        onChange={e => setOpt('domain', e.target.value)}
                        placeholder={rhost || 'target.htb / example.com'}
                        color="cyan"
                    />
                    {!opts.domain && rhost && (
                        <p className="text-[10px] font-mono text-slate-600 mt-1">
                            Blank → using RHOST: <span className="text-cyan-500/60">{rhost}</span>
                        </p>
                    )}
                </div>
            </SectionCard>

            {/* ── Tool Selector ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tool</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TOOLS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl text-left transition-all cursor-pointer border ${tool === t.id
                                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_16px_-4px_rgba(6,182,212,0.3)]'
                                    : 'bg-slate-900/40 border-slate-700/30 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                }`}
                        >
                            <span className="text-xs font-bold font-mono">{t.label}</span>
                            <span className="text-[10px] text-slate-500">{t.note}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Options ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Options</h4>

                <div className={`grid gap-3 ${needsWordlist && needsThreads ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {/* Resolver */}
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">DNS Resolver</label>
                        <input
                            type="text"
                            value={opts.resolver}
                            onChange={e => setOpt('resolver', e.target.value)}
                            placeholder="1.1.1.1 (blank = system)"
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                    </div>

                    {needsThreads && (
                        <div>
                            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Threads</label>
                            <input
                                type="text"
                                value={opts.threads}
                                onChange={e => setOpt('threads', e.target.value)}
                                placeholder="50"
                                className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                            />
                        </div>
                    )}

                    {/* Output file */}
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Output File</label>
                        <input
                            type="text"
                            value={opts.outputFile}
                            onChange={e => setOpt('outputFile', e.target.value)}
                            placeholder="subdomains.txt"
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                    </div>
                </div>

                {needsWordlist && (
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                            Wordlist <span className="text-slate-600">(click a wordlist below to auto-fill)</span>
                        </label>
                        <input
                            type="text"
                            value={opts.wordlist}
                            onChange={e => setOpt('wordlist', e.target.value)}
                            placeholder="/usr/share/seclists/Discovery/DNS/..."
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                    </div>
                )}

                {/* Toggles */}
                <div className="flex gap-5 pt-1 flex-wrap">
                    <ToggleSwitch
                        checked={opts.silent}
                        onChange={v => setOpt('silent', v)}
                        label="Silent / Clean output"
                        color="cyan"
                    />

                    {tool === 'amass' && (
                        <ToggleSwitch
                            checked={opts.recursive}
                            onChange={v => setOpt('recursive', v)}
                            label="Recursive brute force"
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
                <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-4">
                    <pre className="text-sm font-mono text-green-400/90 whitespace-pre-wrap break-all leading-relaxed">{command}</pre>
                </div>
                {!opts.domain && !rhost && (
                    <p className="text-[10px] font-mono text-yellow-500/70">
                        ⚠ Set a domain above or fill RHOST in the target bar.
                    </p>
                )}
            </div>

            {/* ── Passive Recon Quick Commands ── */}
            <CollapsibleSection title="Passive Recon — One-Liners" icon={Globe} defaultOpen={true}>
                <div className="space-y-2">
                    {PASSIVE_SOURCES.map(src => {
                        const cmd = src.cmd(effectiveDomain);
                        return (
                            <div key={src.label} className="bg-[#0b0f19] border border-slate-800/50 rounded-xl px-4 py-3 group/cmd">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold font-mono text-cyan-400/70 uppercase tracking-widest">{src.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-600 font-mono hidden sm:block">{src.note}</span>
                                        <CopyButton text={cmd} />
                                    </div>
                                </div>
                                <code className="text-xs font-mono text-green-400/80 break-all leading-relaxed">{cmd}</code>
                            </div>
                        );
                    })}
                </div>
            </CollapsibleSection>

            {/* ── Wordlist Quick Reference ── */}
            <CollapsibleSection title="Wordlist Quick Reference" icon={BookOpen}>
                <div className="space-y-1.5">
                    {WORDLISTS.map(wl => (
                        <div
                            key={wl.path}
                            onClick={() => setOpt('wordlist', wl.path)}
                            className="flex items-center gap-3 bg-[#0b0f19] border border-slate-800/50 rounded-xl px-4 py-3 group/wl hover:border-cyan-500/20 transition-colors cursor-pointer"
                        >
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-mono font-bold text-slate-300 group-hover/wl:text-cyan-400 transition-colors">{wl.label}</span>
                                <span className="text-[10px] font-mono text-slate-500 ml-3">{wl.note}</span>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <span className="text-[10px] text-cyan-500/50 font-mono group-hover/wl:text-cyan-400 transition-colors">USE</span>
                                <CopyButton text={wl.path} />
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>

            {/* ── Results Parser ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <List className="w-3.5 h-3.5 text-slate-400" />
                        Results Parser
                    </h4>
                    {rawOutput && (
                        <button
                            onClick={handleClearParser}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer uppercase tracking-wider"
                        >
                            <Trash2 className="w-3 h-3" />
                            Clear
                        </button>
                    )}
                </div>

                <p className="text-[11px] text-slate-500 font-mono">
                    Paste raw tool output below — subdomains will be extracted, deduplicated, and sorted.
                </p>

                <textarea
                    value={rawOutput}
                    onChange={e => setRawOutput(e.target.value)}
                    placeholder="Paste subfinder / amass / gobuster / ffuf output here..."
                    rows={8}
                    className="w-full bg-[#0b0f19] border border-slate-800/60 rounded-xl px-4 py-4 text-sm font-mono text-slate-300 placeholder-slate-600 resize-y focus:outline-none focus:border-cyan-500/40 focus:shadow-[0_0_20px_-6px_rgba(6,182,212,0.15)] transition-all leading-relaxed"
                    spellCheck={false}
                />

                {/* Filter + Parse */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            value={filterDomain}
                            onChange={e => setFilterDomain(e.target.value)}
                            placeholder={`Filter by domain (e.g. ${opts.domain || 'target.htb'})`}
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleParse}
                        disabled={!rawOutput.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_20px_-4px_rgba(6,182,212,0.3)] transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        Extract Subdomains
                    </button>
                </div>

                {/* Parsed results */}
                {parsedSubs.length > 0 && (
                    <div className="space-y-3 animate-page-in">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-slate-400">
                                <span className="text-cyan-400 font-bold">{parsedSubs.length}</span> unique subdomain{parsedSubs.length !== 1 ? 's' : ''} found
                            </span>
                            <button
                                onClick={handleCopyAll}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-all cursor-pointer uppercase tracking-wider"
                            >
                                <Copy className="w-3 h-3" />
                                {copiedAll ? 'COPIED' : 'COPY ALL'}
                            </button>
                        </div>

                        <div className="bg-[#0b0f19] border border-slate-800/50 rounded-xl px-4 py-3 max-h-72 overflow-y-auto space-y-1">
                            {parsedSubs.map((sub, idx) => (
                                <div key={idx} className="flex items-center justify-between group/sub hover:bg-slate-800/30 rounded-lg px-2 py-1 transition-colors">
                                    <span className="text-xs font-mono text-cyan-400/80">{sub}</span>
                                    <div className="opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                        <CopyButton text={sub} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* httpx follow-up */}
                        <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl px-4 py-3">
                            <p className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-widest">Next step — probe live hosts:</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs font-mono text-green-400/80 break-all">
                                    {opts.outputFile
                                        ? `httpx -l ${opts.outputFile} -status-code -title -tech-detect -silent`
                                        : `cat subdomains.txt | httpx -status-code -title -tech-detect -silent`}
                                </code>
                                <CopyButton text={
                                    opts.outputFile
                                        ? `httpx -l ${opts.outputFile} -status-code -title -tech-detect -silent`
                                        : `cat subdomains.txt | httpx -status-code -title -tech-detect -silent`
                                } />
                            </div>
                        </div>
                    </div>
                )}

                {parsedSubs.length === 0 && rawOutput.trim() && (
                    <div className="text-xs font-mono text-slate-500 italic px-1">
                        No subdomains extracted — try adjusting the filter or pasting different output.
                    </div>
                )}
            </div>

            {/* ── Tips ── */}
            <TipsSection title="Recon Tips" tips={TIPS} color="cyan" />
        </>
    );
}