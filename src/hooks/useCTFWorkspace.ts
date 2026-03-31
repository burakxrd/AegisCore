import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { logError } from '../utils/logger';

const LS_KEY = 'aegis-ctf-workspace';
const DISCLAIMER_KEY = 'aegis_ctf_disclaimer_v1';
const DEBOUNCE_MS = 500;

// ─── localStorage helpers ─────────────────────────────────────────

function loadGlobalState(): { lhost: string; rhost: string } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    logError('Failed to load global state from localStorage', err);
  }
  return { lhost: '', rhost: '' };
}

function saveGlobalState(lhost: string, rhost: string): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ lhost, rhost }));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      logError('localStorage quota exceeded — workspace state not saved', err);
    } else {
      logError('Failed to save global state to localStorage', err);
    }
  }
}

// ─── Disclaimer helpers ───────────────────────────────────────────
// GÜVENLİK NOTU: Bu mekanizma güvenlik gating'i DEĞİLDİR.
// Sadece UX seviyesinde kullanıcıya sorumluluk hatırlatıcısıdır.
// Client-side bypass'a karşı koruma amacı taşımaz — tüm CTF
// işlemleri zaten client-side'dır ve sunucu tarafında hassas
// işlem tetiklemez.
//
// localStorage + sessionStorage çift kontrol:
// DevTools'tan önceden set edilmiş localStorage tek başına yetmez,
// her yeni oturumda gerçek tıklama gerekir.

function loadDisclaimerState(): boolean {
  try {
    const sessionAccepted = sessionStorage.getItem(DISCLAIMER_KEY) === 'true';
    const localAccepted = localStorage.getItem(DISCLAIMER_KEY) === 'true';
    return sessionAccepted && localAccepted;
  } catch {
    return false;
  }
}

function saveDisclaimerState(): void {
  try {
    localStorage.setItem(DISCLAIMER_KEY, 'true');
    sessionStorage.setItem(DISCLAIMER_KEY, 'true');
  } catch (err) {
    logError('Failed to save disclaimer state', err);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useCTFWorkspace() {
  // loadGlobalState tek seferde çalışır
  const [{ lhost, rhost }, setHostState] = useState(() => loadGlobalState());

  const setLhost = (lhost: string) => setHostState(prev => ({ ...prev, lhost }));
  const setRhost = (rhost: string) => setHostState(prev => ({ ...prev, rhost }));

  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(
    () => loadDisclaimerState()
  );

  const acceptDisclaimer = () => {
    saveDisclaimerState();
    setHasAcceptedDisclaimer(true);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const activePanel = searchParams.get('tool') || 'nmap-parser';

  const setActivePanel = (panel: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tool', panel);
      return next;
    });
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // lhost ve rhost birlikte tek timer'da debounce ediliyor
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      saveGlobalState(lhost, rhost);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [lhost, rhost]);

  return {
    activePanel,
    setActivePanel,
    sidebarOpen,
    setSidebarOpen,
    lhost,
    setLhost,
    rhost,
    setRhost,
    hasAcceptedDisclaimer,
    acceptDisclaimer,
  };
}