import React from 'react';
import NmapParser from '../components/ctf/tools/NmapParser';
import WebFuzzing from '../components/ctf/tools/WebFuzzing';

export const PANEL_MAP: Record<string, React.FC<{ lhost: string; rhost: string }>> = {
  'nmap-parser': ({ lhost, rhost }) => <NmapParser lhost={lhost} rhost={rhost} />,
  'web-fuzzing': ({ lhost, rhost }) => <WebFuzzing lhost={lhost} rhost={rhost} />,
};