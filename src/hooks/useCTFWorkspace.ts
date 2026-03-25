import { useState, useEffect } from 'react';
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
  // Use a lazy initial state function so we only run localStorage parse once
  const [initialState] = useState(() => loadGlobalState());

  const [activePanel, setActivePanel] = useState('nmap-parser');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Global variables
  const [lhost, setLhost] = useState<string>(initialState.lhost ?? '');
  const [rhost, setRhost] = useState<string>(initialState.rhost ?? '');

  // Debounced variables for heavy operations (like saving to disk or re-parsing)
  const debouncedLhost = useDebounce(lhost, 500);
  const debouncedRhost = useDebounce(rhost, 500);

  useEffect(() => {
    // We only save to local storage when the debounced versions change
    // This dramatically reduces disk writing when typing IP addresses.
    saveGlobalState(debouncedLhost, debouncedRhost);
  }, [debouncedLhost, debouncedRhost]);

  return {
    activePanel,
    setActivePanel,
    sidebarOpen,
    setSidebarOpen,
    lhost,
    setLhost, // React binds input to lhost
    rhost,
    setRhost  // React binds input to rhost
  };
}
