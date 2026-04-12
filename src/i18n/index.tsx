import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import en from './locales/en.json';
import tr from './locales/tr.json';

// ─── Supported Languages ──────────────────────────────────────────
export const SUPPORTED_LANGUAGES = ['en', 'tr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

const LOCALES: Record<Language, typeof en> = { en, tr };

// ─── Type-safe Translation Key Paths ──────────────────────────────
// Recursively generates all dot-separated paths from the JSON structure.
// e.g. "header.nav.dashboard" | "common.brand" | ...
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
        : `${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<typeof en>;

// ─── Helper: resolve nested key ───────────────────────────────────
function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return path; // fallback: return the key itself
    }
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === 'string') return current;
  if (Array.isArray(current)) return current as unknown as string; // for array values accessed directly
  return path; // fallback
}

// ─── Detect browser language ──────────────────────────────────────
export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;

  const stored = localStorage.getItem('aegis-language');
  if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
    return stored as Language;
  }

  const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
  if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
    return browserLang as Language;
  }

  return DEFAULT_LANGUAGE;
}

// ─── Context ──────────────────────────────────────────────────────
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  /** Get array value at key path (for suggestion arrays etc.) */
  tArray: (key: TranslationKey) => string[];
  /** Build a path with the current language prefix */
  localePath: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────
interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive language from URL param, fallback to 'en'
  const language: Language = SUPPORTED_LANGUAGES.includes(lang as Language)
    ? (lang as Language)
    : DEFAULT_LANGUAGE;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const locale = LOCALES[language];

  const t = useCallback(
    (key: TranslationKey): string => {
      return getNestedValue(locale, key);
    },
    [locale]
  );

  const tArray = useCallback(
    (key: TranslationKey): string[] => {
      const keys = key.split('.');
      let current: unknown = locale;
      for (const k of keys) {
        if (current === null || current === undefined || typeof current !== 'object') return [];
        current = (current as Record<string, unknown>)[k];
      }
      return Array.isArray(current) ? (current as string[]) : [];
    },
    [locale]
  );

  const setLanguage = useCallback(
    (newLang: Language) => {
      localStorage.setItem('aegis-language', newLang);
      // Replace /:lang/ prefix in current path
      const currentPath = location.pathname.replace(`/${language}`, '') || '/';
      const search = location.search;
      navigate(`/${newLang}${currentPath}${search}`, { replace: true });
    },
    [language, location.pathname, location.search, navigate]
  );

  const localePath = useCallback(
    (path: string): string => {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      return `/${language}${normalized}`;
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t, tArray, localePath }),
    [language, setLanguage, t, tArray, localePath]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────────
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within a LanguageProvider');
  return { t: ctx.t, tArray: ctx.tArray };
}
