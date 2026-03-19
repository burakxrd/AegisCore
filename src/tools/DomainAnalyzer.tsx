import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Mail, Server, AlertTriangle, CheckCircle2, Activity, ChevronRight, Network, Crosshair, Terminal, ShieldAlert, Fingerprint, Lock, Copy, CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { CopyButton, CopyAllButton } from '../components/CopyButtons';
import { SystemAlert } from '../components/SystemAlert';

// --- Types ---
interface MxRecord {
  exchange: string;
  priority: number;
}

interface DomainIntelligence {
  query: string;
  status: string;
  records: {
    A: string[];
    AAAA: string[];
    MX: MxRecord[];
    TXT: string[];
    NS: string[];
    DMARC: string[];
  };
}

interface SslInfo {
  status: string;
  subject?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  serialNumber?: string;
  protocol?: string;
  fingerprint?: string;
  message?: string;
}

export default function DomainAnalyzer() {
  const [domainInput, setDomainInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DomainIntelligence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sslInfo, setSslInfo] = useState<SslInfo | null>(null);
  const [searchParams] = useSearchParams();

  const cleanDomainInput = (input: string) => {
    return input.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
  };

  const handleAnalyze = async (overrideDomain?: string) => {
    const target = cleanDomainInput(overrideDomain || domainInput);
    if (!target) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSslInfo(null);

    try {
      // DNS + SSL sorgularını paralel at
      const [dnsResponse, sslResponse] = await Promise.all([
        fetch(`/api/tools/domain/${target}`),
        fetch(`/api/tools/domain/ssl/${target}`).catch(() => null)
      ]);

      const dnsData = await dnsResponse.json();

      if (dnsData.status === 'fail' || dnsData.error) {
        throw new Error(dnsData.message || "DNS resolution failed.");
      }

      setResult(dnsData as DomainIntelligence);

      if (sslResponse) {
        try {
          const sslData = await sslResponse.json();
          setSslInfo(sslData as SslInfo);
        } catch {
          setSslInfo({ status: "fail", message: "SSL check failed." });
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Target resolution failed. Domain may not exist or DNS is blocking requests.");
      } else {
        setError("Target resolution failed. An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-search from Dashboard quick lookup
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setDomainInput(q);
      handleAnalyze(q);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Güvenlik Postürü Analizi
  const hasSpf = result?.records.TXT.some(r => r.toLowerCase().includes('v=spf1'));
  const hasDmarc = result?.records.DMARC && result.records.DMARC.length > 0;

  // SSL sertifika süre hesabı
  const getSslDaysLeft = () => {
    if (!sslInfo?.validTo) return null;
    const expiry = new Date(sslInfo.validTo);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const sslDaysLeft = getSslDaysLeft();

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ÜST BİLGİ */}
      <div>
        <div className="flex items-center gap-2 text-sm font-mono tracking-wider text-slate-400 mb-6 uppercase">
          <Link to="/tools" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
            <Network className="w-4 h-4" />
            Tools
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-cyan-500/70">Domain Analyzer</span>
        </div>

        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Globe className="w-8 h-8 text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          Domain <span className="text-cyan-500">Analyzer</span>
        </h2>
        <p className="text-slate-400 font-mono text-sm mt-2">Comprehensive DNS, SSL, and security posture analysis.</p>
      </div>

      {/* ARAMA ÇUBUĞU */}
      <div className="md:-mr-16 bg-slate-900/60 border border-cyan-500/20 p-1.5 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)] focus-within:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all">
        <div className="relative flex items-center">
          <Crosshair className="absolute left-4 w-5 h-5 text-cyan-500/50" />
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Target Domain (e.g. aegis.net.tr)"
            aria-label="Enter target domain to analyze"
            className="w-full bg-transparent pl-12 pr-16 py-3 text-base font-mono text-cyan-400 focus:outline-none placeholder:text-slate-600 tracking-wider"
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !domainInput.trim()}
            aria-label="Analyze Domain"
            className="absolute right-1.5 p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? <Activity className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Search className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* HATA */}
      {error && <SystemAlert type="error" title="Analysis Failed" message={error} />}

      {/* SONUÇLAR */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

          {/* HEDEF KİLİTLENDİ */}
          <div className="flex items-center gap-3 bg-cyan-950/30 border border-cyan-500/30 py-3 px-5 rounded-xl">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,1)]" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Target Locked:</span>
            <span className="text-cyan-400 font-mono font-bold tracking-wider">{result.query}</span>
          </div>

          {/* SSL + SECURITY POSTURE ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* SSL CERTIFICATE */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" /> SSL Certificate
              </h3>

              {sslInfo && sslInfo.status === 'success' ? (
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div className="text-[10px] text-slate-500 shrink-0 mr-3">SUBJECT</div>
                    <div className="flex items-center gap-2 overflow-hidden">
                      {sslInfo.subject?.startsWith('*.') && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">WILDCARD</span>
                      )}
                      <span className="text-white font-bold truncate" title={sslInfo.subject}>{sslInfo.subject}</span>
                      <span className="shrink-0">{sslInfo.subject && <CopyButton text={sslInfo.subject} />}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <div className="text-[10px] text-slate-500">ISSUER</div>
                    <div className="text-right text-slate-300 truncate max-w-[60%]" title={sslInfo.issuer}>{sslInfo.issuer}</div>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <div className="text-[10px] text-slate-500">PROTOCOL</div>
                    <div className="text-right text-emerald-400 font-bold">{sslInfo.protocol || "N/A"}</div>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <div className="text-[10px] text-slate-500">EXPIRES</div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-slate-300">{sslInfo.validTo ? new Date(sslInfo.validTo).toLocaleDateString() : "N/A"}</span>
                      {sslDaysLeft !== null && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${sslDaysLeft > 30 ? 'bg-green-500/10 text-green-400' :
                          sslDaysLeft > 7 ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                          {sslDaysLeft > 0 ? `${sslDaysLeft}d` : 'EXPIRED'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-slate-500 shrink-0 mr-3">SERIAL</div>
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="text-slate-500 text-xs truncate" title={sslInfo.serialNumber}>{sslInfo.serialNumber || 'N/A'}</span>
                      <span className="shrink-0">{sslInfo.serialNumber && <CopyButton text={sslInfo.serialNumber} />}</span>
                    </div>
                  </div>
                </div>
              ) : sslInfo && sslInfo.status === 'fail' ? (
                <div className="flex items-center gap-3 text-red-400 font-mono text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>No SSL certificate detected</span>
                </div>
              ) : (
                <div className="text-slate-600 font-mono text-sm italic">Checking SSL...</div>
              )}
            </div>

            {/* SECURITY POSTURE */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-green-500/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" /> Security Posture
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <span className="text-slate-300">SPF Record <span className="text-slate-500 text-xs hidden sm:inline">(Spoofing Protection)</span></span>
                  {hasSpf ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <span className="text-slate-300">DMARC Record <span className="text-slate-500 text-xs hidden sm:inline">(Mail Authentication)</span></span>
                  {hasDmarc ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <span className="text-slate-300">SSL/TLS <span className="text-slate-500 text-xs hidden sm:inline">(Encryption)</span></span>
                  {sslInfo?.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                </div>
              </div>
            </div>
          </div>

          {/* NS + A/AAAA ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* NS Records */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-purple-500" /> Infrastructure (NS)
                </h3>
                <CopyAllButton items={result.records.NS} label="NS records" />
              </div>
              <div className="space-y-2 font-mono text-sm">
                {result.records.NS && result.records.NS.length > 0 ? result.records.NS.map((ns, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-purple-800/50 transition-colors">
                    <span className="text-purple-400 font-bold truncate">{ns}</span>
                    <CopyButton text={ns} />
                  </div>
                )) : (
                  <div className="text-slate-600 italic">No NS records found.</div>
                )}
              </div>
            </div>

            {/* A & AAAA Records */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-500" /> Routing (A / AAAA)
                </h3>
                <CopyAllButton items={[...(result.records.A || []), ...(result.records.AAAA || [])]} label="IP records" />
              </div>
              <div className="space-y-2 font-mono text-sm max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {result.records.A && result.records.A.map((ip, idx) => (
                  <div key={`a-${idx}`} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-800 transition-colors">
                    <span className="text-cyan-400 font-bold">{ip}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs font-bold px-2 py-1 bg-slate-900 rounded">IPv4</span>
                      <CopyButton text={ip} />
                    </div>
                  </div>
                ))}
                {result.records.AAAA && result.records.AAAA.map((ipv6, idx) => (
                  <div key={`aaaa-${idx}`} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-blue-800 transition-colors">
                    <span className="text-blue-400 font-bold text-xs truncate mr-2" title={ipv6}>{ipv6}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs font-bold px-2 py-1 bg-slate-900 rounded">IPv6</span>
                      <CopyButton text={ipv6} />
                    </div>
                  </div>
                ))}
                {(!result.records.A?.length && !result.records.AAAA?.length) && (
                  <div className="text-slate-600 italic">No routing records resolved.</div>
                )}
              </div>
            </div>

          </div>

          {/* MX Records */}
          <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" /> Mail Exchangers (MX)
              </h3>
              <CopyAllButton items={(result.records.MX || []).map(r => `${r.priority} ${r.exchange}`)} label="MX records" />
            </div>
            <div className="space-y-2 font-mono text-sm max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {result.records.MX && result.records.MX.length > 0 ? result.records.MX.map((rec, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-blue-800/50 transition-colors">
                  <span className="text-slate-300 break-all">{rec.exchange}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-xs font-bold px-2 py-1 bg-blue-900/20 rounded whitespace-nowrap">PRIORITY: {rec.priority}</span>
                    <CopyButton text={rec.exchange} />
                  </div>
                </div>
              )) : (
                <div className="text-slate-600 italic">No MX records returned.</div>
              )}
            </div>
          </div>

          {/* TXT Records */}
          {result.records.TXT && result.records.TXT.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" /> Raw TXT Records
                </h3>
                <CopyAllButton items={result.records.TXT} label="TXT records" />
              </div>
              <div className="space-y-2 font-mono text-xs text-green-500/80 bg-black/50 p-4 rounded-xl border border-slate-800/50 max-h-48 overflow-y-auto">
                {result.records.TXT.map((txt, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 border-b border-green-900/30 pb-2 last:border-0 last:pb-0">
                    <div className="break-all flex-1">
                      <span className="text-slate-600 mr-2">&gt;</span> {txt}
                    </div>
                    <CopyButton text={txt} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}