import React, { useState } from 'react';
import { Search, Globe, Shield, Mail, Server, AlertTriangle, CheckCircle2, Activity, ChevronRight, Network, Crosshair, Terminal, ShieldAlert, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Types (Yeni API yapısına göre güncellendi) ---
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
  };
}

export default function DomainAnalyzer() {
  const [domainInput, setDomainInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DomainIntelligence | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanDomainInput = (input: string) => {
    return input.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
  };

  const handleAnalyze = async () => {
    const target = cleanDomainInput(domainInput);
    if (!target) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/tools/domain/${target}`);
      const data = await response.json();

      if (data.status === 'fail' || data.error) {
        throw new Error(data.message || "DNS resolution failed.");
      }

      setResult(data as DomainIntelligence);
    } catch (err: any) {
      setError(err.message || "Target resolution failed. Domain may not exist or DNS is blocking requests.");
    } finally {
      setLoading(false);
    }
  };

  // Güvenlik Postürü Analizi (TXT kayıtlarının içinden)
  const hasSpf = result?.records.TXT.some(r => r.toLowerCase().includes('v=spf1'));
  const hasDmarc = result?.records.TXT.some(r => r.toLowerCase().includes('v=dmarc1'));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* ÜST BİLGİ VE GERİ DÖNÜŞ LİNKİ */}
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
        <p className="text-slate-400 font-mono text-sm mt-2">Comprehensive DNS, Routing, and security posture analysis.</p>
      </div>

      {/* ARAMA ÇUBUĞU */}
      <div className="bg-slate-900/60 border border-cyan-500/20 p-2 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)] focus-within:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all">
        <div className="relative flex items-center">
          <Crosshair className="absolute left-4 w-5 h-5 text-cyan-500/50" />
          <input 
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Target Domain (e.g. aegis.net.tr)"
            className="w-full bg-transparent pl-12 pr-16 py-4 text-xl font-mono text-cyan-400 focus:outline-none placeholder:text-slate-600 tracking-wider"
          />
          <button 
            onClick={handleAnalyze}
            disabled={loading || !domainInput.trim()}
            className="absolute right-2 p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? <Activity className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* HATA DURUMU */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-red-500 font-bold tracking-widest uppercase mb-1">Analysis Failed</h3>
            <p className="text-slate-300 font-mono text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* BAŞARILI SONUÇ */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* HEDEF KİLİTLENDİ KUTUSU */}
          <div className="flex items-center gap-3 bg-cyan-950/30 border border-cyan-500/30 py-3 px-5 rounded-xl">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,1)]" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Target Locked:</span>
            <span className="text-cyan-400 font-mono font-bold tracking-wider">{result.query}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- Name Servers (NS) - OSINT için çok önemli --- */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-purple-500" /> Infrastructure (NS Records)
              </h3>
              <div className="space-y-2 font-mono text-sm">
                {result.records.NS && result.records.NS.length > 0 ? result.records.NS.map((ns, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-purple-800/50 transition-colors">
                    <span className="text-purple-400 font-bold truncate">{ns}</span>
                  </div>
                )) : (
                  <div className="text-slate-600 italic">No NS records found.</div>
                )}
              </div>
            </div>

            {/* --- Security Posture (SPF/DMARC) --- */}
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
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- A & AAAA Records (Routing) --- */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-500" /> Routing (A / AAAA Records)
              </h3>
              <div className="space-y-2 font-mono text-sm max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* IPv4 */}
                {result.records.A && result.records.A.map((ip, idx) => (
                  <div key={`a-${idx}`} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-800 transition-colors">
                    <span className="text-cyan-400 font-bold">{ip}</span>
                    <span className="text-slate-600 text-xs font-bold px-2 py-1 bg-slate-900 rounded">IPv4</span>
                  </div>
                ))}

                {/* IPv6 */}
                {result.records.AAAA && result.records.AAAA.map((ipv6, idx) => (
                  <div key={`aaaa-${idx}`} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-blue-800 transition-colors">
                    <span className="text-blue-400 font-bold text-xs truncate mr-2" title={ipv6}>{ipv6}</span>
                    <span className="text-slate-600 text-xs font-bold px-2 py-1 bg-slate-900 rounded">IPv6</span>
                  </div>
                ))}

                {(!result.records.A?.length && !result.records.AAAA?.length) && (
                  <div className="text-slate-600 italic">No routing records resolved.</div>
                )}
              </div>
            </div>

            {/* --- MX Records (Mail Exchangers) --- */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" /> Mail Exchangers (MX)
              </h3>
              <div className="space-y-2 font-mono text-sm max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {result.records.MX && result.records.MX.length > 0 ? result.records.MX.map((rec, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-blue-800/50 transition-colors">
                    <span className="text-slate-300 break-all">{rec.exchange}</span>
                    <span className="text-blue-400 text-xs font-bold px-2 py-1 bg-blue-900/20 rounded whitespace-nowrap">PRIORITY: {rec.priority}</span>
                  </div>
                )) : (
                  <div className="text-slate-600 italic">No MX records returned.</div>
                )}
              </div>
            </div>

          </div>

          {/* --- TXT Records (Raw Data Terminal) --- */}
          {result.records.TXT && result.records.TXT.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" /> Raw TXT Records
              </h3>
              <div className="space-y-2 font-mono text-xs text-green-500/80 bg-black/50 p-4 rounded-xl border border-slate-800/50 max-h-48 overflow-y-auto">
                {result.records.TXT.map((txt, idx) => (
                  <div key={idx} className="break-all border-b border-green-900/30 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-600 mr-2">&gt;</span> {txt}
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