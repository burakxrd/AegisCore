import React, { useState, useEffect } from 'react';
import { Search, Globe, MapPin, Server, ShieldAlert, Activity, ChevronRight, Clock, Fingerprint, Network, Crosshair, Terminal, User, Copy, CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

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
  as?: string;
  hostname?: string;
  query: string;
  hosting?: boolean;
  proxy?: boolean;
  mobile?: boolean;
}

// Copy button component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 text-slate-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/50" title="Copy">
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function IpIntelligence() {
  const [ipInput, setIpInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [myIpLoading, setMyIpLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IpData | null>(null);
  const [easterEgg, setEasterEgg] = useState<string | null>(null);
  const [ipMode, setIpMode] = useState<'IPv4' | 'IPv6'>('IPv4');
  const [searchParams] = useSearchParams();

  const checkSpecialIps = (ip: string): string | null => {
    if (ip === '127.0.0.1' || ip === '::1') return "THERE IS NO PLACE LIKE 127.0.0.1 [LOCALHOST / LOOPBACK]";
    if (ip === '0.0.0.0' || ip === '::') return "THE VOID [NON-ROUTABLE META-ADDRESS]";
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd')) {
      return "INTERNAL SYSTEM DETECTED [PRIVATE NETWORK IP - NOT PUBLICLY ROUTABLE]";
    }
    return null;
  };

  const handleSearch = async (overrideIp?: string) => {
    const cleanIp = (overrideIp || ipInput).trim();
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

  // Auto-search from Dashboard quick lookup
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      const isV6 = q.includes(':');
      setIpMode(isV6 ? 'IPv6' : 'IPv4');
      setIpInput(q);
      handleSearch(q);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const handleMyIp = async () => {
    setMyIpLoading(true);
    try {
      // Client-side fetch — returns the user's real public IP, not the server's
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      if (data.ip) {
        const isV6 = data.ip.includes(':');
        setIpMode(isV6 ? 'IPv6' : 'IPv4');
        setIpInput(data.ip);
        await handleSearch(data.ip);
      }
    } catch (error) {
      setEasterEgg("DETECTION FAILED [COULD NOT RESOLVE YOUR IP]");
    } finally {
      setMyIpLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    if (ipMode === 'IPv4') {
      const val = value.replace(/[^0-9.]/g, '');
      if (val.length <= 15) setIpInput(val);
    } else {
      const val = value.replace(/[^0-9a-fA-F:]/g, '');
      if (val.length <= 45) setIpInput(val);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ÜST BİLGİ VE GERİ DÖNÜŞ LİNKİ */}
      <div>
        <div className="flex items-center gap-2 text-sm font-mono tracking-wider text-slate-400 mb-6 uppercase">
          <Link to="/tools" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
            <Network className="w-4 h-4" />
            Tools
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-cyan-500/70">IP Intelligence</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              IP <span className="text-cyan-500">Intelligence</span>
            </h2>
            <p className="text-slate-400 font-mono text-sm mt-2">Enter an IP address to trace its global origin, ASN, and ISP details.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* IPv4 / IPv6 Tab */}
            <div className="flex items-center bg-slate-900 border border-slate-700/50 p-1 rounded-xl shadow-inner">
              {(['IPv4', 'IPv6'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setIpMode(mode); setIpInput(''); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${ipMode === mode ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-white'
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* My IP Button */}
            <button
              onClick={handleMyIp}
              disabled={myIpLoading || loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-slate-300 border border-slate-700/50 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-cyan-900 hover:text-cyan-400 hover:border-cyan-700 transition-all disabled:opacity-50"
            >
              {myIpLoading ? <Activity className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              MY IP
            </button>
          </div>
        </div>
      </div>

      {/* ARAMA ÇUBUĞU */}
      <div className="bg-slate-900/60 border border-cyan-500/20 p-2 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)] focus-within:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all">
        <div className="relative flex items-center">
          <Crosshair className="absolute left-4 w-5 h-5 text-cyan-500/50" />
          <input
            type="text"
            value={ipInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={ipMode === 'IPv4' ? "Target IP (e.g. 8.8.8.8)" : "Target IP (e.g. 2001:4860:4860::8888)"}
            maxLength={ipMode === 'IPv4' ? 15 : 45}
            className="w-full bg-transparent pl-12 pr-16 py-4 text-xl font-mono text-cyan-400 focus:outline-none placeholder:text-slate-600 tracking-wider"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !ipInput}
            className="absolute right-2 p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? <Activity className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* EASTER EGG */}
      {easterEgg && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
          <ShieldAlert className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-yellow-500 font-bold tracking-widest uppercase mb-1">System Override</h3>
            <p className="text-slate-300 font-mono text-sm">{easterEgg}</p>
          </div>
        </div>
      )}

      {/* BAŞARILI SONUÇ */}
      {result && result.status === 'success' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

          <div className="flex items-center gap-3 bg-cyan-950/30 border border-cyan-500/30 py-3 px-5 rounded-xl">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,1)]" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Target Locked:</span>
            <span className="text-cyan-400 font-mono font-bold tracking-wider">{result.query}</span>
            <CopyButton text={result.query} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* GEOLOCATION & HARİTA KARTI */}
            <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-colors flex flex-col">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-500" /> Geolocation & SATELLITE
              </h3>

              <div className="space-y-5 font-mono mb-6">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500">COUNTRY</div>
                  <div className="text-right">
                    <span className="text-lg text-white font-bold">{result.country}</span>
                    <span className="text-cyan-500/50 ml-2">[{result.countryCode}]</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500">REGION / CITY</div>
                  <div className="text-right text-slate-300">
                    {result.regionName}, <span className="text-white">{result.city}</span> {result.zip && <span className="text-slate-500 text-xs">({result.zip})</span>}
                  </div>
                </div>

                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500">COORDINATES</div>
                  <div className="flex items-center gap-1">
                    <span className="text-right text-cyan-400 tracking-wider">
                      {result.lat}° N, {result.lon}° E
                    </span>
                    <CopyButton text={`${result.lat}, ${result.lon}`} />
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> TIMEZONE</div>
                  <div className="text-right text-slate-400">
                    {result.timezone || "UNKNOWN"}
                  </div>
                </div>
              </div>

              {/* CANLI GOOGLE HARİTA (Siber Hack CSS) */}
              {result.lat && result.lon && (
                <div className="mt-auto rounded-xl overflow-hidden border border-slate-800 h-40 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Target Location"
                    // Bu inline stil Google haritayı "Dark Mode Siber" yapıyor
                    style={{ filter: "invert(90%) hue-rotate(180deg) contrast(120%) opacity(80%)", pointerEvents: "none" }}
                    src={`https://www.google.com/maps?q=${result.lat},${result.lon}&z=10&output=embed`}
                  />
                  {/* Üstüne Tıklanabilir Şeffaf Buton */}
                  <a
                    href={`https://www.google.com/maps/place/${result.lat},${result.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-cyan-900/10 hover:bg-cyan-500/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]"
                  >
                    <span className="bg-slate-950/90 text-cyan-400 border border-cyan-500/50 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-widest flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> OPEN SATELLITE VIEW
                    </span>
                  </a>
                </div>
              )}
            </div>

            {/* NETWORK KARTI */}
            <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" /> Network Data
              </h3>

              <div className="space-y-5 font-mono relative z-10">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 mr-3"><Network className="w-3 h-3" /> ISP</div>
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-white font-bold truncate" title={result.isp}>
                      {result.isp || "N/A"}
                    </span>
                    <span className="shrink-0">{result.isp && <CopyButton text={result.isp} />}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500 shrink-0 mr-3">PRIVACY</div>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${result.hosting ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800/50 text-slate-600'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${result.hosting ? 'bg-orange-400' : 'bg-slate-600'}`} />
                      HOSTING
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${result.proxy ? 'bg-red-500/10 text-red-400' : 'bg-slate-800/50 text-slate-600'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${result.proxy ? 'bg-red-400' : 'bg-slate-600'}`} />
                      VPN/PROXY
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${result.mobile ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-800/50 text-slate-600'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${result.mobile ? 'bg-violet-400' : 'bg-slate-600'}`} />
                      MOBILE
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 mr-3"><Fingerprint className="w-3 h-3" /> ASN</div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-md">
                      {result.as || "UNKNOWN"}
                    </span>
                    <span className="shrink-0">{result.as && <CopyButton text={result.as} />}</span>
                  </div>
                </div>

                {/* HOSTNAME */}
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 mr-3"><Terminal className="w-3 h-3" /> HOSTNAME</div>
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-slate-400 text-xs truncate" title={result.hostname || "NO REVERSE DNS"}>
                      {result.hostname || "NO REVERSE DNS"}
                    </span>
                    <span className="shrink-0">{result.hostname && <CopyButton text={result.hostname} />}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* HATA DURUMU */}
      {result && result.status === 'fail' && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-red-500 font-bold tracking-widest uppercase mb-1">Resolution Failed</h3>
            <p className="text-slate-300 font-mono text-sm">{result.message}</p>
            <p className="text-slate-500 font-mono text-xs mt-2">Target: {result.query}</p>
          </div>
        </div>
      )}

    </div>
  );
}