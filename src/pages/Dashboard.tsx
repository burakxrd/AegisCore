import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Globe } from 'lucide-react';

interface SystemLog {
  id: string;
  timestamp: string;
  source: string;
  action: string;
  status: 'SUCCESS' | 'WARN' | 'ERROR';
  details: string;
}

interface SystemMetrics {
  cpuUsage: number;
  ramUsage: number;
  activeConnections: number;
  apiRequestsToday: number;
}

interface SecurityCheck {
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  lastChecked: string;
}

export default function Dashboard() {
  const [logs, setMessages] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    ramUsage: 0,
    activeConnections: 0,
    apiRequestsToday: 0
  });
  const [securityStatus, setSecurityStatus] = useState<SecurityCheck[]>([]);

  useEffect(() => {
    setSecurityStatus([
      { name: 'Core API Link', status: 'OPERATIONAL', lastChecked: '1s ago' },
      { name: 'AI Neural Interface', status: 'OPERATIONAL', lastChecked: '1s ago' },
      { name: 'User Threat Database', status: 'DEGRADED', lastChecked: '5s ago' },
      { name: 'Localization Engine (v1.0-EN)', status: 'OPERATIONAL', lastChecked: '1s ago' },
    ]);

    const statsInterval = setInterval(() => {
      setMetrics({
        cpuUsage: Math.floor(Math.random() * (45 - 20) + 20),
        ramUsage: Math.floor(Math.random() * (70 - 55) + 55),
        activeConnections: Math.floor(Math.random() * (25 - 5) + 5),
        apiRequestsToday: 1452 + Math.floor(Math.random() * 10)
      });

      const newLog: SystemLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        source: `192.168.1.${Math.floor(Math.random() * 254 + 1)}`,
        action: ['HASH_GEN', 'DOMAIN_ANALYSIS', 'IP_LOOKUP', 'AI_QUERY'][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.1 ? 'SUCCESS' : 'WARN',
        details: 'Protocol executed nominal'
      };
      setMessages(prev => [newLog, ...prev.slice(0, 49)]);
    }, 3000);

    return () => clearInterval(statsInterval);
  }, []);

  return (
    <div className="space-y-8">
      
      <div className="flex items-center gap-4 p-6 bg-slate-900/40 border border-slate-800/50 rounded-2xl backdrop-blur-md shadow-lg">
        <img 
          src="/favicon.ico" 
          alt="AEGIS CORE Logo" 
          className="w-12 h-12 rounded-full border-2 border-slate-700"
        />
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            AEGIS <span className="text-cyan-400">CORE</span> <span className="text-xs font-mono text-slate-500">v0.1-BETA</span>
          </h1>
          <p className="text-sm text-slate-400 font-mono">Centralized Cyber Security Intelligence Interface</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 p-8 bg-slate-900/40 border border-slate-800/50 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col h-175">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">Live Operation Feed</h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400 font-mono">POLLING_ACTIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 space-y-3 scrollbar scrollbar-thumb-cyan-700/50 scrollbar-track-slate-900/50 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
            {logs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-2 font-mono text-sm group hover:border-cyan-800 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{log.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' :
                    log.status === 'WARN' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{log.status}</span>
                  <span className="text-white font-medium group-hover:text-cyan-400">{log.action}</span>
                </div>
                <div className="text-slate-400 flex items-center gap-3 md:justify-end">
                  <span>SRC: {log.source}</span>
                  <span className="text-xs text-slate-600">|</span>
                  <span>{log.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8 flex flex-col">
          
          <div className="p-8 bg-slate-900/40 border border-slate-800/50 rounded-3xl backdrop-blur-md shadow-2xl flex-1">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <Activity className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">Core Metrics</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 font-mono">
              {[
                { label: 'CPU LOAD', value: `${metrics.cpuUsage}%` },
                { label: 'RAM USAGE', value: `${metrics.ramUsage}%` },
                { label: 'ACTIVE CONS', value: metrics.activeConnections },
                { label: 'API REQS TODAY', value: metrics.apiRequestsToday.toLocaleString() }
              ].map(item => (
                <div key={item.label} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className="text-2xl font-bold text-cyan-400 tracking-tight">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-slate-900/40 border border-slate-800/50 rounded-3xl backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <ShieldCheck className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">Operational Status</h2>
            </div>
            <div className="space-y-3 font-mono text-sm">
              {securityStatus.map(check => (
                <div key={check.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <span className="text-slate-200">{check.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{check.lastChecked}</span>
                    <span className={`w-3 h-3 rounded-full ${
                      check.status === 'OPERATIONAL' ? 'bg-green-500 shadow-lg shadow-green-900/50' :
                      check.status === 'DEGRADED' ? 'bg-yellow-500 shadow-lg shadow-yellow-900/50' :
                      'bg-red-500 shadow-lg shadow-red-900/50'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}