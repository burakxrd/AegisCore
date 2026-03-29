import React from 'react';
import NmapParser from '../components/ctf/tools/NmapParser';
import WebFuzzing from '../components/ctf/tools/WebFuzzing';
import Subdomains from '../components/ctf/tools/Subdomains';
import ReverseShell from '../components/ctf/tools/ReverseShell';
import WebExploits from '../components/ctf/tools/WebExploits';
import LinuxSUID from '../components/ctf/tools/LinuxSUID';
import WindowsEnum from '../components/ctf/tools/WindowsEnum';
import HashCracking from '../components/ctf/tools/HashCracking';
import Persistence from '../components/ctf/tools/Persistence';

export const PANEL_MAP: Record<string, React.FC<{ lhost: string; rhost: string }>> = {
  'nmap-parser': ({ lhost, rhost }) => <NmapParser lhost={lhost} rhost={rhost} />,
  'web-fuzzing': ({ lhost, rhost }) => <WebFuzzing lhost={lhost} rhost={rhost} />,
  'subdomains': ({ lhost, rhost }) => <Subdomains lhost={lhost} rhost={rhost} />,
  'reverse-shell': ({ lhost, rhost }) => <ReverseShell lhost={lhost} rhost={rhost} />,
  'web-exploits': ({ lhost, rhost }) => <WebExploits lhost={lhost} rhost={rhost} />,
  'linux-suid': ({ lhost, rhost }) => <LinuxSUID lhost={lhost} rhost={rhost} />,
  'windows-enum': ({ lhost, rhost }) => <WindowsEnum lhost={lhost} rhost={rhost} />,
  'hash-cracking': ({ lhost, rhost }) => <HashCracking lhost={lhost} rhost={rhost} />,
  'persistence': ({ lhost, rhost }) => <Persistence lhost={lhost} rhost={rhost} />,
};