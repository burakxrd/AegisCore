import React from 'react';
import {
  Radar, Crosshair, ArrowUpCircle, Bug,
  Terminal, Globe, Search, Zap,
  Shield, FileText
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
export interface SubItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface KillChainCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  items: SubItem[];
}

// ─── Color Map ────────────────────────────────────────────────────
export const COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
  cyan:   { text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500'   },
  red:    { text: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500'    },
  yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500' },
};

// ─── Kill Chain Menu Data ─────────────────────────────────────────
export const KILL_CHAIN: KillChainCategory[] = [
  {
    id: 'enumeration',
    label: 'Enumeration',
    icon: <Radar className="w-4 h-4" />,
    color: 'cyan',
    items: [
      { id: 'nmap-parser',  label: 'Nmap Parser',  icon: <Terminal className="w-3.5 h-3.5" /> },
      { id: 'web-fuzzing',  label: 'Web Fuzzing',   icon: <Search className="w-3.5 h-3.5" /> },
      { id: 'subdomains',   label: 'Subdomains',    icon: <Globe className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'initial-access',
    label: 'Initial Access',
    icon: <Crosshair className="w-4 h-4" />,
    color: 'red',
    items: [
      { id: 'reverse-shell', label: 'Reverse Shell Generator', icon: <Terminal className="w-3.5 h-3.5" /> },
      { id: 'web-exploits',  label: 'Web Exploits',            icon: <Zap className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'priv-esc',
    label: 'Privilege Escalation',
    icon: <ArrowUpCircle className="w-4 h-4" />,
    color: 'yellow',
    items: [
      { id: 'linux-suid',    label: 'Linux SUID/Sudo', icon: <Shield className="w-3.5 h-3.5" /> },
      { id: 'windows-enum',  label: 'Windows Enum',    icon: <FileText className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'post-exploitation',
    label: 'Post-Exploitation',
    icon: <Bug className="w-4 h-4" />,
    color: 'purple',
    items: [
      { id: 'hash-cracking', label: 'Hash Cracking', icon: <Zap className="w-3.5 h-3.5" /> },
      { id: 'persistence',   label: 'Persistence',   icon: <Shield className="w-3.5 h-3.5" /> },
    ],
  },
];
