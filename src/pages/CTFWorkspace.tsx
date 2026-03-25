import React from 'react';
import Sidebar from '../components/ctf/Sidebar';
import TargetConfigBar from '../components/ctf/TargetConfigBar';
import ComingSoon from '../components/ctf/tools/ComingSoon';
import { useCTFWorkspace } from '../hooks/useCTFWorkspace';
import { PANEL_MAP } from '../config/ctf-tools';

export default function CTFWorkspace() {
  const {
    activePanel,
    setActivePanel,
    sidebarOpen,
    setSidebarOpen,
    lhost,
    setLhost,
    rhost,
    setRhost
  } = useCTFWorkspace();

  const PanelComponent = PANEL_MAP[activePanel];

  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-slate-950">

      {/* ═══ LEFT SIDEBAR ═══ */}
      <Sidebar
        activePanel={activePanel}
        onSelectPanel={setActivePanel}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ═══ RIGHT MAIN CANVAS ═══ */}
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">

          {/* Global Variables */}
          <TargetConfigBar
            lhost={lhost}
            rhost={rhost}
            onLhostChange={setLhost}
            onRhostChange={setRhost}
          />

          {/* Active Tool Panel */}
          {PanelComponent
            ? <PanelComponent lhost={lhost} rhost={rhost} />
            : <ComingSoon activePanel={activePanel} />
          }

        </div>
      </main>
    </div>
  );
}
