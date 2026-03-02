import React, { useState } from 'react';
import { Search, Globe, Shield, Mail, Server, Calendar, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

// --- Types ---
interface DnsRecord {
  type: string;
  address?: string;
  data?: string;
  ttl: number;
}

interface WhoisData {
  registrar?: string;
  creationDate?: string;
  expiryDate?: string;
  status?: string;
}

interface DomainIntelligence {
  domain: string;
  aRecords: DnsRecord[];
  mxRecords: DnsRecord[];
  txtRecords: DnsRecord[];
  whois?: WhoisData;
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
      // NOTE: Expecting a rich response. 
      // If backend only returns A records, UI will gracefully show empty states for others.
      const response = await fetch(`/api/tools/dns/${target}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Mapping backend data to our rich interface
      const records = data.records || [];
      const analysisData: DomainIntelligence = {
        domain: target,
        aRecords: records.filter((r: DnsRecord) => r.type === 'A'),
        mxRecords: records.filter((r: DnsRecord) => r.type === 'MX'),
        txtRecords: records.filter((r: DnsRecord) => r.type === 'TXT'),
        // Simulating WHOIS mapping for when backend supports it
        whois: data.whois || null 
      };

      setResult(analysisData);
    } catch (err: unknown) {
      setError("Target resolution failed. Domain may not exist or DNS is blocking requests.");
    } finally {
      setLoading(false);
    }
  };

  const hasSpf = result?.txtRecords.some(r => r.data?.toLowerCase().includes('v=spf1'));
  const hasDmarc = result?.txtRecords.some(r => r.data?.toLowerCase().includes('v=dmarc1'));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Search className="w-8 h-8 text-cyan-500" />
          Domain <span className="text-cyan-500">Analyzer</span>
        </h2>
        <p className="text-slate-400 font-mono text-sm mt-2">Comprehensive DNS, WHOIS, and security posture analysis.</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="e.g. aegis.net.tr"
            className="w-full bg-slate-950 border border-slate-700/50 rounded-2xl pl-6 pr-16 py-4 text-lg font-mono text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
          />
          <button 
            onClick={handleAnalyze}
            disabled={loading || !domainInput.trim()}
            className="absolute right-2 p-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition-all disabled:opacity-50"
          >
            {loading ? <Activity className="w-6 h-6 animate-spin" /> : <Globe className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-red-500 font-bold tracking-widest uppercase mb-1">Analysis Failed</h3>
            <p className="text-slate-300 font-mono text-sm">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- WHOIS & General Data --- */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" /> Registry Information
              </h3>
              {result.whois ? (
                <div className="space-y-4 font-mono">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">REGISTRAR</div>
                    <div className="text-white">{result.whois.registrar || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">CREATED</div>
                      <div className="text-slate-300">{result.whois.creationDate || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">EXPIRES</div>
                      <div className="text-slate-300">{result.whois.expiryDate || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-600 font-mono text-sm italic">WHOIS data not provided by core logic yet.</div>
              )}
            </div>

            {/* --- Security Posture (SPF/DMARC) --- */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" /> Security Posture
              </h3>
              <div className="space-y-4 font-mono">
                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-300">SPF Record (Spoofing Protection)</span>
                  {hasSpf ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-300">DMARC Record (Mail Authentication)</span>
                  {hasDmarc ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- A Records (Servers) --- */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-500" /> Routing (A Records)
              </h3>
              <div className="space-y-2 font-mono text-sm">
                {result.aRecords.length > 0 ? result.aRecords.map((rec, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-800 transition-colors">
                    <span className="text-cyan-400 font-bold">{rec.address || rec.data}</span>
                    <span className="text-slate-600 text-xs">TTL: {rec.ttl}</span>
                  </div>
                )) : (
                  <div className="text-slate-600 italic">No A records resolved.</div>
                )}
              </div>
            </div>

            {/* --- MX Records (Mail Exchangers) --- */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-500" /> Mail Exchangers (MX)
              </h3>
              <div className="space-y-2 font-mono text-sm">
                {result.mxRecords.length > 0 ? result.mxRecords.map((rec, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-800 transition-colors">
                    <span className="text-slate-300 break-all">{rec.data}</span>
                    <span className="text-slate-600 text-xs">TTL: {rec.ttl}</span>
                  </div>
                )) : (
                  <div className="text-slate-600 italic">No MX records returned by core.</div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}