import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { logError } from '../utils/logger';
import { useDebounce } from './useDebounce';

const LS_KEY = 'aegis-ctf-workspace';

function loadGlobalState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    logError('Failed to load global state from localStorage', err);
  }
  return {};
}

function saveGlobalState(lhost: string, rhost: string) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ lhost, rhost }));
  } catch (err) {
    logError('Failed to save global state to localStorage', err);
  }
}

export function useCTFWorkspace() {
  const [initialState] = useState(() => loadGlobalState());

  const [searchParams, setSearchParams] = useSearchParams();
  const activePanel = searchParams.get('tool') || 'nmap-parser';

  const setActivePanel = (panel: string) => {
    setSearchParams(prev => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set('tool', panel);
      return nextParams;
    });
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [lhost, setLhost] = useState<string>(initialState.lhost ?? '');
  const [rhost, setRhost] = useState<string>(initialState.rhost ?? '');

  const debouncedLhost = useDebounce(lhost, 500);
  const debouncedRhost = useDebounce(rhost, 500);

  useEffect(() => {
    saveGlobalState(debouncedLhost, debouncedRhost);
  }, [debouncedLhost, debouncedRhost]);

  return {
    activePanel,
    setActivePanel,
    sidebarOpen,
    setSidebarOpen,
    lhost,
    setLhost,
    rhost,
    setRhost
  };
}
