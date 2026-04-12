import React, { useState, useEffect, useCallback } from 'react';
import { Globe, MapPin, Server, Activity, Clock, Fingerprint, Network, Terminal, User } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { CopyButton } from '../components/CopyButtons';
import { SystemAlert } from '../components/SystemAlert';
import { ToolBreadcrumb, ToolPageHeader } from '../components/ToolHeader';
import { SearchBar } from '../components/SearchBar';
import { TargetLockedBanner } from '../components/ToolWidgets';
import { Helmet } from 'react-helmet-async';
import { LangLink } from '../components/layout/LangLink';
import { useTranslation } from '../i18n';


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
  const { t } = useTranslation();

  const checkSpecialIps = (ip: string): string | null => {
    if (ip === '127.0.0.1' || ip === '::1') return t('ipIntelligence.easterEggs.localhost');
    if (ip === '0.0.0.0' || ip === '::') return t('ipIntelligence.easterEggs.void');
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd')) {
      return t('ipIntelligence.easterEggs.private');
    }
    return null;
  };

  const handleSearch = useCallback(async (overrideIp?: string) => {
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
      setResult({ status: 'fail', message: t('ipIntelligence.error.fallback'), query: cleanIp });
    } finally {
      setLoading(false);
    }
  }, [ipInput, t]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      const isV6 = q.includes(':');
      setIpMode(isV6 ? 'IPv6' : 'IPv4');
      setIpInput(q);
      handleSearch(q);
    }
  }, [searchParams, handleSearch]);


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
      setEasterEgg(t('ipIntelligence.easterEggs.detectFailed'));
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
        <title>{t('ipIntelligence.pageTitle')}</title>
        <meta name="description" content={t('ipIntelligence.metaDescription')} />
        <link rel="canonical" href="https://aegis.net.tr/tools/ip-intelligence" />
      </Helmet>

      <div>
        <ToolBreadcrumb toolName={t('ipIntelligence.breadcrumb')} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <ToolPageHeader icon={Globe} title={t('ipIntelligence.title')} highlight={t('ipIntelligence.highlight')} description={t('ipIntelligence.description')} />
            <LangLink to="/blog/understanding-ip-geolocation" className="text-[11px] font-mono text-cyan-500/60 hover:text-cyan-400 transition-colors mt-1 inline-block">{t('ipIntelligence.learnLink')}</LangLink>

          <div className="flex items-center gap-3">
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

            <button
              onClick={handleMyIp}
              disabled={myIpLoading || loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-slate-300 border border-slate-700/50 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-cyan-900 hover:text-cyan-400 hover:border-cyan-700 transition-all disabled:opacity-50"
            >
              {myIpLoading ? <Activity className="w-4 h-4 animate-spin" aria-hidden="true" /> : <User className="w-4 h-4" aria-hidden="true" />}
              {t('ipIntelligence.myIp')}
            </button>
          </div>
        </div>
      </div>

      <SearchBar
        value={ipInput}
        onChange={handleInputChange}
        onSearch={() => handleSearch()}
        loading={loading}
        disabled={!ipInput}
        placeholder={ipMode === 'IPv4' ? t('ipIntelligence.placeholder4') : t('ipIntelligence.placeholder6')}
        ariaLabel={t('ipIntelligence.ariaLabel')}
        maxLength={ipMode === 'IPv4' ? 15 : 45}
      />

      {easterEgg && <SystemAlert type="warning" title="System Override" message={easterEgg} className="slide-in-from-bottom-4" />}

      {result && result.status === 'success' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

          <TargetLockedBanner query={result.query} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-colors flex flex-col">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-500" /> {t('ipIntelligence.results.geoTitle')}
              </h3>

              <div className="space-y-5 font-mono mb-6">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500">{t('ipIntelligence.results.country')}</div>
                  <div className="text-right">
                    <span className="text-lg text-white font-bold">{result.country}</span>
                    <span className="text-cyan-500/50 ml-2">[{result.countryCode}]</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500">{t('ipIntelligence.results.regionCity')}</div>
                  <div className="text-right text-slate-300">
                    {result.regionName}, <span className="text-white">{result.city}</span> {result.zip && <span className="text-slate-500 text-xs">({result.zip})</span>}
                  </div>
                </div>

                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500">{t('ipIntelligence.results.coordinates')}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-right text-cyan-400 tracking-wider">
                      {result.lat}° N, {result.lon}° E
                    </span>
                    <CopyButton text={`${result.lat}, ${result.lon}`} />
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {t('ipIntelligence.results.timezone')}</div>
                  <div className="text-right text-slate-400">
                    {result.timezone || t('ipIntelligence.results.unknown')}
                  </div>
                </div>
              </div>

              {result.lat && result.lon && (
                <div className="mt-auto rounded-xl overflow-hidden border border-slate-800 h-40 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Target Location"
                    style={{ filter: "invert(90%) hue-rotate(180deg) contrast(120%) opacity(80%)", pointerEvents: "none" }}
                    src={`https://www.google.com/maps?q=${result.lat},${result.lon}&z=10&output=embed`}
                  />
                  <a
                    href={`https://www.google.com/maps/place/${result.lat},${result.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-cyan-900/10 hover:bg-cyan-500/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]"
                  >
                    <span className="bg-slate-950/90 text-cyan-400 border border-cyan-500/50 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-widest flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {t('ipIntelligence.results.openSatellite')}
                    </span>
                  </a>
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" /> {t('ipIntelligence.results.networkTitle')}
              </h3>

              <div className="space-y-5 font-mono relative z-10">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 mr-3"><Network className="w-3 h-3" /> {t('ipIntelligence.results.isp')}</div>
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-white font-bold truncate" title={result.isp}>
                      {result.isp || "N/A"}
                    </span>
                    <span className="shrink-0">{result.isp && <CopyButton text={result.isp} />}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500 shrink-0 mr-3">{t('ipIntelligence.results.privacy')}</div>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${result.hosting ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800/50 text-slate-600'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${result.hosting ? 'bg-orange-400' : 'bg-slate-600'}`} />
                      {t('ipIntelligence.results.hosting')}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${result.proxy ? 'bg-red-500/10 text-red-400' : 'bg-slate-800/50 text-slate-600'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${result.proxy ? 'bg-red-400' : 'bg-slate-600'}`} />
                      {t('ipIntelligence.results.vpnProxy')}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${result.mobile ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-800/50 text-slate-600'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${result.mobile ? 'bg-violet-400' : 'bg-slate-600'}`} />
                      {t('ipIntelligence.results.mobile')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 mr-3"><Fingerprint className="w-3 h-3" /> {t('ipIntelligence.results.asn')}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-md">
                      {result.as || t('ipIntelligence.results.unknown')}
                    </span>
                    <span className="shrink-0">{result.as && <CopyButton text={result.as} />}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 mr-3"><Terminal className="w-3 h-3" /> {t('ipIntelligence.results.hostname')}</div>
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-slate-400 text-xs truncate" title={result.hostname || t('ipIntelligence.results.noReverseDns')}>
                      {result.hostname || t('ipIntelligence.results.noReverseDns')}
                    </span>
                    <span className="shrink-0">{result.hostname && <CopyButton text={result.hostname} />}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {result && result.status === 'fail' && (
        <SystemAlert 
          type="error" 
          title={t('ipIntelligence.error.title')} 
          message={result.message} 
          subMessage={`Target: ${result.query}`} 
        />
      )}

    </div>
  );
}