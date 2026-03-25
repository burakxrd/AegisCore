import React, { useState, useCallback, useEffect } from 'react';
import { Terminal, Play, Zap, Trash2, ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { getServiceProfile, PORT_HINTS, type ChecklistEntry } from '../../../data/ctf-service-checklists';
import { logError } from '../../../utils/logger';

// ─── Props ────────────────────────────────────────────────────────
interface NmapParserProps {
  rhost: string;
  lhost: string;
}

// ─── Parsed Port Structure ───────────────────────────────────────
interface ParsedPort {
  port: number;
  protocol: string;
  service: string;
  version: string;
  raw: string;
}

// ─── Nmap Command Templates ──────────────────────────────────────
const getNmapCommands = (rhost: string): { label: string; cmd: string }[] => {
  const target = rhost || '$RHOST';
  return [
    { label: 'Quick TCP Scan',       cmd: `nmap -sC -sV -oN initial_scan.txt ${target}` },
    { label: 'Full Port Scan',       cmd: `nmap -p- --min-rate 10000 -oN all_ports.txt ${target}` },
    { label: 'UDP Top 100',          cmd: `nmap -sU --top-ports 100 -oN udp_scan.txt ${target}` },
    { label: 'Aggressive + Scripts', cmd: `nmap -A -T4 --script=vuln -oN vuln_scan.txt ${target}` },
  ];
};

// ─── localStorage ────────────────────────────────────────────────
const LS_NMAP_KEY = 'aegis-ctf-nmap-output';
const LS_CHECKS_KEY = 'aegis-ctf-nmap-checks';

function loadNmapOutput(): string {
  try { return localStorage.getItem(LS_NMAP_KEY) ?? ''; }
  catch (err) { logError('NmapParser: localStorage read failed', err); return ''; }
}
function saveNmapOutput(v: string) {
  try { localStorage.setItem(LS_NMAP_KEY, v); } catch (err) { logError('NmapParser: localStorage write failed', err); }
}
function loadChecks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_CHECKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) { logError('NmapParser: localStorage read failed', err); return {}; }
}
function saveChecks(v: Record<string, boolean>) {
  try { localStorage.setItem(LS_CHECKS_KEY, JSON.stringify(v)); } catch (err) { logError('NmapParser: localStorage write failed', err); }
}

// ─── Nmap Output Parser ─────────────────────────────────────────
function parseNmapOutput(output: string): { ports: ParsedPort[]; osHint: string | null; hostInfo: string | null } {
  const lines = output.split('\n');
  const ports: ParsedPort[] = [];
  let osHint: string | null = null;
  let hostInfo: string | null = null;

  for (const line of lines) {
    // Match lines like: 22/tcp   open  ssh     OpenSSH 8.4p1
    const portMatch = line.match(/^(\d+)\/(tcp|udp)\s+open\s+(\S+)\s*(.*)?/);
    if (portMatch) {
      ports.push({
        port: parseInt(portMatch[1]),
        protocol: portMatch[2],
        service: portMatch[3],
        version: (portMatch[4] || '').trim(),
        raw: line.trim(),
      });
    }

    // OS detection
    const osMatch = line.match(/OS details?:\s*(.+)/i);
    if (osMatch) osHint = osMatch[1].trim();

    // Host info
    const hostMatch = line.match(/Nmap scan report for\s+(.+)/i);
    if (hostMatch) hostInfo = hostMatch[1].trim();
  }

  return { ports, osHint, hostInfo };
}

// ─── Replace placeholders in commands ────────────────────────────
function replaceVars(cmd: string, rhost: string, lhost: string): string {
  return cmd.replace(/\$RHOST/g, rhost || '$RHOST').replace(/\$LHOST/g, lhost || '$LHOST');
}

// ─── Component ───────────────────────────────────────────────────
export default function NmapParser({ rhost, lhost }: NmapParserProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [nmapOutput, setNmapOutput] = useState<string>(loadNmapOutput);
  const [analysis, setAnalysis] = useState<ReturnType<typeof parseNmapOutput> | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>(loadChecks);
  const [expandedPorts, setExpandedPorts] = useState<Set<number>>(new Set());

  // Persist
  useEffect(() => { saveNmapOutput(nmapOutput); }, [nmapOutput]);
  useEffect(() => { saveChecks(checks); }, [checks]);

  // Toggle a checklist item
  const toggleCheck = useCallback((key: string) => {
    setChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
  }, []);

  // Toggle port expansion
  const togglePort = useCallback((port: number) => {
    setExpandedPorts((prev) => {
      const next = new Set(prev);
      if (next.has(port)) next.delete(port);
      else next.add(port);
      return next;
    });
  }, []);

  // Analyze
  const analyzeNmap = useCallback(() => {
    if (!nmapOutput.trim()) return;
    const result = parseNmapOutput(nmapOutput);
    setAnalysis(result);
    // Auto-expand all ports
    setExpandedPorts(new Set(result.ports.map((p) => p.port)));
  }, [nmapOutput]);

  // Clear
  const clearAll = useCallback(() => {
    setNmapOutput('');
    setAnalysis(null);
    setChecks({});
    setExpandedPorts(new Set());
    try {
      localStorage.removeItem(LS_CHECKS_KEY);
      localStorage.removeItem(LS_NMAP_KEY);
    } catch (err) { logError('NmapParser: localStorage clear failed', err); }
  }, []);

  // ─── Render a single checklist entry ───────────────────────────
  const renderChecklistItem = (port: number, idx: number, item: ChecklistEntry) => {
    const checkKey = `${port}-${idx}`;
    const isChecked = !!checks[checkKey];

    return (
      <div
        key={checkKey}
        className={`border border-slate-800/40 rounded-xl p-4 transition-all ${isChecked ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-900/30'}`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleCheck(checkKey)}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
              ${isChecked
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'border-slate-600 hover:border-cyan-500/60'
              }`}
          >
            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <h6 className={`text-sm font-bold mb-1 ${isChecked ? 'text-green-400 line-through opacity-70' : 'text-white'}`}>
              {item.label}
            </h6>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              {item.description}
            </p>

            {item.commands && item.commands.length > 0 && (
              <div className="space-y-1.5">
                {item.commands.map((cmd, ci) => {
                  const resolved = replaceVars(cmd, rhost, lhost);
                  return (
                    <div
                      key={ci}
                      className="flex items-center gap-2 bg-[#0b0f19] border border-slate-800/50 rounded-lg px-3 py-2 group/cmd"
                    >
                      <span className="text-green-500/70 text-xs font-mono select-none">$</span>
                      <code className="flex-1 text-xs font-mono text-green-400/90 break-all">
                        {resolved}
                      </code>
                      <CopyButton text={resolved} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Section Title */}
      <div className="flex items-center gap-3 pt-2">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Terminal className="w-4.5 h-4.5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Nmap <span className="text-cyan-400">Parser</span></h3>
          <p className="text-[11px] text-slate-500 font-mono">SCAN_COMMAND_GENERATOR & OUTPUT_ANALYZER</p>
        </div>
      </div>

      {/* ── Command Generator ── */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Scan Commands</h4>
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_20px_-4px_rgba(6,182,212,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            Generate Scan Commands
          </button>
        </div>

        {showCommands && (
          <div className="space-y-2 animate-page-in">
            {getNmapCommands(rhost).map((cmd) => (
              <div
                key={cmd.label}
                className="flex items-center gap-3 bg-[#0b0f19] border border-slate-800/60 rounded-xl px-4 py-3 group/cmd"
              >
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider w-36 flex-shrink-0">
                  {cmd.label}
                </span>
                <code className="flex-1 text-sm font-mono text-green-400/90 break-all">
                  {cmd.cmd}
                </code>
                <CopyButton text={cmd.cmd} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Output Analyzer ── */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Output Analyzer</h4>
          <div className="flex items-center gap-2">
            {nmapOutput && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer uppercase tracking-wider"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
            <button
              onClick={analyzeNmap}
              disabled={!nmapOutput.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_20px_-4px_rgba(6,182,212,0.3)] transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-cyan-500/10 disabled:hover:border-cyan-500/30 disabled:hover:shadow-none"
            >
              <Zap className="w-3.5 h-3.5" />
              Analyze Output
            </button>
          </div>
        </div>

        <textarea
          value={nmapOutput}
          onChange={(e) => setNmapOutput(e.target.value)}
          placeholder="Paste your Nmap scan output here..."
          rows={12}
          className="w-full bg-[#0b0f19] border border-slate-800/60 rounded-xl px-4 py-4 text-sm font-mono text-slate-300 placeholder-slate-600 resize-y focus:outline-none focus:border-cyan-500/40 focus:shadow-[0_0_20px_-6px_rgba(6,182,212,0.15)] transition-all leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── ANALYSIS RESULTS ── */}
      {analysis && (
        <div className="space-y-4 animate-page-in">

          {/* Summary bar */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                <span className="text-xs font-mono text-slate-400">
                  {analysis.ports.length} open port(s) detected
                </span>
              </div>
              {analysis.hostInfo && (
                <span className="text-xs font-mono text-slate-500">
                  Host: <span className="text-cyan-400">{analysis.hostInfo}</span>
                </span>
              )}
              {analysis.osHint && (
                <span className="text-xs font-mono text-slate-500">
                  OS: <span className="text-yellow-400">{analysis.osHint}</span>
                </span>
              )}
              {analysis.ports.length > 0 && (() => {
                const currentCheckKeys = new Set(
                  analysis.ports.flatMap((p) =>
                    getServiceProfile(PORT_HINTS[p.port] || p.service.toLowerCase())
                      .checklist.map((_, idx) => `${p.port}-${idx}`)
                  )
                );
                const completedCount = Object.entries(checks)
                  .filter(([k, v]) => v && currentCheckKeys.has(k)).length;
                const totalChecks = analysis.ports.reduce((sum, p) => {
                  const svcName = p.service.toLowerCase();
                  const profile = getServiceProfile(PORT_HINTS[p.port] || svcName);
                  return sum + profile.checklist.length;
                }, 0);
                
                return (
                  <span className="ml-auto text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    {completedCount} / {totalChecks} checks completed
                  </span>
                );
              })()}
            </div>
          </div>

          {/* No ports warning */}
          {analysis.ports.length === 0 && (
            <div className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-400/90">
                No open ports found in Nmap output. Make sure the output is in standard Nmap format.
              </p>
            </div>
          )}

          {/* Per-port cards */}
          {analysis.ports.map((p) => {
            const svcName = p.service.toLowerCase();
            const canonicalKey = PORT_HINTS[p.port] || svcName;
            const profile = getServiceProfile(canonicalKey);
            const isExpanded = expandedPorts.has(p.port);
            const portCheckedCount = profile.checklist.filter((_, idx) => checks[`${p.port}-${idx}`]).length;

            return (
              <div
                key={`${p.port}-${p.protocol}`}
                className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden"
              >
                {/* Port header */}
                <button
                  onClick={() => togglePort(p.port)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-800/20 transition-colors cursor-pointer"
                >
                  {/* Port badge */}
                  <div className="flex-shrink-0 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <span className="text-sm font-mono font-bold text-cyan-400">
                      {p.port}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-500/60 ml-1">/{p.protocol}</span>
                  </div>

                  {/* Service info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{p.service}</span>
                      {p.version && (
                        <span className="text-xs font-mono text-slate-400">— {p.version}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{profile.summary}</p>
                  </div>

                  {/* Progress */}
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500">
                      {portCheckedCount}/{profile.checklist.length}
                    </span>
                    {/* Mini progress bar */}
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${profile.checklist.length ? (portCheckedCount / profile.checklist.length) * 100 : 0}%` }}
                      />
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded checklist */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3 border-t border-slate-800/30 pt-4">
                    {profile.checklist.map((item, idx) => renderChecklistItem(p.port, idx, item))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
