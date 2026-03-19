import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Server, Activity, Clock, Fingerprint, Network, Terminal, User } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { CopyButton } from '../components/CopyButtons';
import { SystemAlert } from '../components/SystemAlert';
import { ToolBreadcrumb, ToolPageHeader } from '../components/ToolHeader';
import { SearchBar } from '../components/SearchBar';
import { TargetLockedBanner } from '../components/ToolWidgets';
import { Helmet } from 'react-helmet-async';


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
  }, []);


  const handleMyIp = async () => {
    setMyIpLoading(true);
    try {
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

      <Helmet>
        <title>IP Intelligence | AEGIS CORE</title>
        <meta name="description" content="Trace any IP address — geolocation, ISP, ASN, and VPN/proxy detection. Free IP lookup tool." />
        <link rel="canonical" href="https://aegis.net.tr/tools/ip-intelligence" />
      </Helmet>

      {/* ÜST BİLGİ VE GERİ DÖNÜŞ LİNKİ */}
      <div>
        <ToolBreadcrumb toolName="IP Intelligence" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <ToolPageHeader icon={Globe} title="IP" highlight="Intelligence" description="Enter an IP address to trace its global origin, ASN, and ISP details." />
            <Link to="/blog/understanding-ip-geolocation" className="text-[11px] font-mono text-cyan-500/60 hover:text-cyan-400 transition-colors mt-1 inline-block">📖 Learn how IP Geolocation works →</Link>

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
              {myIpLoading ? <Activity className="w-4 h-4 animate-spin" aria-hidden="true" /> : <User className="w-4 h-4" aria-hidden="true" />}
              MY IP
            </button>
          </div>
        </div>
      </div>

      {/* ARAMA ÇUBUĞU */}
      <SearchBar
        value={ipInput}
        onChange={handleInputChange}
        onSearch={() => handleSearch()}
        loading={loading}
        disabled={!ipInput}
        placeholder={ipMode === 'IPv4' ? "Target IP (e.g. 8.8.8.8)" : "Target IP (e.g. 2001:4860:4860::8888)"}
        ariaLabel="Target IP Address"
        maxLength={ipMode === 'IPv4' ? 15 : 45}
      />

      {/* EASTER EGG */}
      {easterEgg && <SystemAlert type="warning" title="System Override" message={easterEgg} className="slide-in-from-bottom-4" />}

      {/* BAŞARILI SONUÇ */}
      {result && result.status === 'success' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

          <TargetLockedBanner query={result.query} />

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
        <SystemAlert 
          type="error" 
          title="Resolution Failed" 
          message={result.message} 
          subMessage={`Target: ${result.query}`} 
        />
      )}

    </div>
  );
}