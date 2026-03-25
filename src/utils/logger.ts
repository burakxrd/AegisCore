/**
 * Dev-only logger that silences logs in production to prevent information leakage.
 */
export function logError(message: string, error?: unknown) {
  if ((import.meta as any).env?.DEV) {
    console.error(`[Aegis Core Error] ${message}`, error ?? '');
  }
}

export function logWarn(message: string, warn?: unknown) {
  if ((import.meta as any).env?.DEV) {
    console.warn(`[Aegis Core Warn] ${message}`, warn ?? '');
  }
}
