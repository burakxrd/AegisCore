import React from 'react';
import NmapParser from '../components/ctf/tools/NmapParser';

export const PANEL_MAP: Record<string, React.FC<{ lhost: string; rhost: string }>> = {
  'nmap-parser': ({ lhost, rhost }) => <NmapParser lhost={lhost} rhost={rhost} />,
};
