import React, { useState } from 'react';
import { Search, Globe, MapPin, Server, ShieldAlert, Activity } from 'lucide-react';

interface IpData {
  status: string;
  message?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  query: string;
}

export default function IpIntelligence() {
  const [ipInput, setIpInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IpData | null>(null);
  const [easterEgg, setEasterEgg] = useState<string | null>(null);

  const checkSpecialIps = (ip: string): string | null => {
    if (ip === '127.0.0.1') return "THERE IS NO PLACE LIKE 127.0.0.1 [LOCALHOST / LOOPBACK]";
    if (ip === '0.0.0.0') return "THE VOID [NON-ROUTABLE META-ADDRESS]";
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.')) {
      return "INTERNAL SYSTEM DETECTED [PRIVATE NETWORK IP - NOT PUBLICLY ROUTABLE]";
    }
    return null;
  };

  const handleSearch = async () => {
    const cleanIp = ipInput.trim();
    if (!cleanIp) return;

    const specialMessage = checkSpecialIps(cleanIp);
    if (specialMessage) {
      setEasterEgg(specialMessage);
      setResult(null);
      return;
    }

    setLoading(true);
    setEasterEgg(null);
    setResult(null);

    try {
      const response = await fetch(`/api/tools/ip/${cleanIp}`);
      const data = (await response.json()) as IpData;
      setResult(data);
    } catch (error) {
      setResult({ status: 'fail', message: 'Uplink severed. Unable to resolve IP.', query: cleanIp });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Globe className="w-8 h-8 text-cyan-500" />
          IP <span className="text-cyan-500">Intelligence</span>
        </h2>
        <p className="text-slate-400 font-mono text-sm mt-2">Enter an IPv4 address to trace its global origin, ASN, and ISP details.</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={ipInput}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, '');
              if (val.length <= 15) setIpInput(val);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 8.8.8.8"
            maxLength={15}
            className="w-full bg-slate-950 border border-slate-700/50 rounded-2xl pl-6 pr-16 py-4 text-lg font-mono text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
          />
          <button 
            onClick={handleSearch}
            disabled={loading || !ipInput}
            className="absolute right-2 p-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition-all disabled:opacity-50"
          >
            {loading ? <Activity className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {easterEgg && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
          <ShieldAlert className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-yellow-500 font-bold tracking-widest uppercase mb-1">System Override</h3>
            <p className="text-slate-300 font-mono text-sm">{easterEgg}</p>
          </div>
        </div>
      )}

      {result && result.status === 'success' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-500" /> Geolocation Data
            </h3>
            <div className="space-y-4 font-mono">
              <div>
                <div className="text-[10px] text-slate-500 mb-1">COUNTRY</div>
                <div className="text-lg text-white">{result.country} <span className="text-slate-500 text-sm">({result.countryCode})</span></div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 mb-1">REGION / CITY</div>
                <div className="text-white">{result.regionName}, {result.city} {result.zip}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 mb-1">COORDINATES</div>
                <div className="text-cyan-400">{result.lat}, {result.lon}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-500" /> Network Data
            </h3>
            <div className="space-y-4 font-mono">
              <div>
                <div className="text-[10px] text-slate-500 mb-1">ISP</div>
                <div className="text-white">{result.isp}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 mb-1">ORGANIZATION</div>
                <div className="text-slate-300 text-sm">{result.org}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 mb-1">ASN</div>
                <div className="text-cyan-400 text-sm">{result.as}</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {result && result.status === 'fail' && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-red-500 font-bold tracking-widest uppercase mb-1">Resolution Failed</h3>
            <p className="text-slate-300 font-mono text-sm">{result.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}