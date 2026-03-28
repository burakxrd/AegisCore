import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KILL_CHAIN, COLOR_MAP } from '../../data/ctf-menu';

// ─── Props ────────────────────────────────────────────────────────
interface SidebarProps {
  activePanel: string;
  onSelectPanel: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activePanel, onSelectPanel, isOpen, onToggle }: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string>('');

  useEffect(() => {
    const parentCategory = KILL_CHAIN.find(cat =>
      cat.items.some(item => item.id === activePanel)
    );
    if (parentCategory) {
      setExpandedCategory(parentCategory.id);
    }
  }, [activePanel]);

  const toggleCategory = (id: string) => {
    setExpandedCategory((prev) => (prev === id ? '' : id));
  };

  return (
    <>
      <aside
        className={`${isOpen ? 'w-72' : 'w-0 overflow-hidden'
          } flex-shrink-0 border-r border-slate-800/60 bg-slate-950/90 backdrop-blur-sm flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-800/50">
          <Link to="/tools" className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors mb-3 uppercase tracking-widest">
            <Network className="w-3.5 h-3.5" />
            Tools
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-400">CTF Ops</span>
          </Link>
          <h2 className="text-base font-bold text-white tracking-tight">Kill Chain</h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">ATTACK_PHASE_SELECTOR</p>
        </div>

        {/* Accordion menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 hide-scrollbar">
          {KILL_CHAIN.map((cat) => {
            const c = COLOR_MAP[cat.color];
            const isCatOpen = expandedCategory === cat.id;

            return (
              <div key={cat.id}>
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer
                    ${isCatOpen ? `${c.bg} ${c.text}` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
                >
                  <span className={isCatOpen ? c.text : 'text-slate-500'}>{cat.icon}</span>
                  <span className="flex-1 text-left">{cat.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isCatOpen ? 'rotate-180' : ''} ${isCatOpen ? c.text : 'text-slate-600'}`}
                  />
                </button>

                {/* Sub-items */}
                {isCatOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-slate-800/60 pl-0">
                    {cat.items.map((item) => {
                      const isActive = activePanel === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onSelectPanel(item.id)}
                          className={`w-full flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-r-lg text-xs font-medium transition-all cursor-pointer
                            ${isActive
                              ? `border-l-2 ${c.border} ${c.text} ${c.bg} -ml-[2px]`
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 border-l-2 border-transparent -ml-[2px]'
                            }`}
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Workspace Active</span>
          </div>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        className="absolute top-[85px] left-0 z-30 md:hidden bg-slate-900 border border-slate-700 rounded-r-lg p-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </>
  );
}
