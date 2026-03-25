import React, { useState, useEffect } from 'react';
import { Globe, Shield, Mail, Server, AlertTriangle, CheckCircle2, Activity, Fingerprint, Lock, Terminal } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { CopyButton, CopyAllButton } from '../components/CopyButtons';
import { SystemAlert } from '../components/SystemAlert';
import { ToolBreadcrumb, ToolPageHeader } from '../components/ToolHeader';
import { SearchBar } from '../components/SearchBar';
import { InfoCard } from '../components/InfoCard';
import { TargetLockedBanner } from '../components/ToolWidgets';
import { Helmet } from 'react-helmet-async';

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
  const abortControllerRef = React.useRef<AbortController>(null);

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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // DNS + SSL sorgularını paralel at
      const [dnsResponse, sslResponse] = await Promise.all([
        fetch(`/api/tools/domain/${target}`, { signal }),
        fetch(`/api/tools/domain/ssl/${target}`, { signal }).catch(() => null)
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
      if (err instanceof Error && err.name === 'AbortError') return;
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
    <div className="w-full max-w-4xl mx-auto space-y-6">

      <Helmet>
      <title>Domain Analyzer | AEGIS CORE</title>
      <meta name="description" content="DNS records lookup, SSL certificate inspection, SPF and DMARC email security analysis. Free domain intelligence tool." />
      <link rel="canonical" href="https://aegis.net.tr/tools/domain-analyzer" />
    </Helmet>

      {/* ÜST BİLGİ */}
      <div>
        <ToolBreadcrumb toolName="Domain Analyzer" />
        <ToolPageHeader icon={Globe} title="Domain" highlight="Analyzer" description="Comprehensive DNS, SSL, and security posture analysis." />
        <Link to="/blog/dns-records-explained" className="text-[11px] font-mono text-cyan-500/60 hover:text-cyan-400 transition-colors mt-1 inline-block">📖 Learn how DNS records work →</Link>
      </div>

      {/* ARAMA ÇUBUĞU */}
      <SearchBar
        value={domainInput}
        onChange={setDomainInput}
        onSearch={() => handleAnalyze()}
        loading={loading}
        disabled={!domainInput.trim()}
        placeholder="Target Domain (e.g. aegis.net.tr)"
        ariaLabel="Enter target domain to analyze"
      />

      {/* HATA */}
      {error && <SystemAlert type="error" title="Analysis Failed" message={error} />}

      {/* SONUÇLAR */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

          {/* HEDEF KİLİTLENDİ */}
          <TargetLockedBanner query={result.query} showCopy={false} />

          {/* SSL + SECURITY POSTURE ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* SSL CERTIFICATE */}
            <InfoCard color="emerald" title="SSL Certificate" icon={Lock}>

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
            </InfoCard>

            {/* SECURITY POSTURE */}
            <InfoCard color="green" title="Security Posture" icon={Shield}>
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
            </InfoCard>
          </div>

          {/* NS + A/AAAA ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* NS Records */}
            <InfoCard color="purple" title="Infrastructure (NS)" icon={Fingerprint}>
              <div className="flex items-center justify-between mb-4">
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
            </InfoCard>

            {/* A & AAAA Records */}
            <InfoCard color="cyan" title="Routing (A / AAAA)" icon={Server}>
              <div className="flex items-center justify-between mb-4">
                <CopyAllButton items={[...(result.records.A || []), ...(result.records.AAAA || [])]} label="IP records" />
              </div>
              <div className="space-y-2 font-mono text-sm">
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
            </InfoCard>

          </div>

          {/* MX Records */}
          <InfoCard color="blue" title="Mail Exchangers (MX)" icon={Mail}>
            <div className="flex items-center justify-between mb-4">
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
          </InfoCard>

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