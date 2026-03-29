import { z } from 'zod';

// ─── IP Schemas ───────────────────────────────────────────────────
export const ipv4Schema = z.string().ip({ version: "v4", message: "Invalid IPv4 address" });
export const ipv6Schema = z.string().ip({ version: "v6", message: "Invalid IPv6 address" });
export const ipSchema = z.union([ipv4Schema, ipv6Schema]);

// ─── Domain & Port Schemas ────────────────────────────────────────
export const domainSchema = z.string().regex(
  /^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,}$/,
  { message: "Invalid domain name" }
);

export const portSchema = z.coerce
  .number({ invalid_type_error: "Port must be a number" })
  .int()
  .min(1, { message: "Port cannot be less than 1" })
  .max(65535, { message: "Port cannot be greater than 65535" });

// ─── Command Argument Schemas ─────────────────────────────────────
// Two versions: without /g for test() (avoids sticky lastIndex), with /g for replace()
const COMMAND_INJECTION_PATTERN = /[&|;`$"'\\<>(){}[\]!#%\n\r\0\t]/;
const COMMAND_INJECTION_CHARS = /[&|;`$"'\\<>(){}[\]!#%\n\r\0\t]/g;

export const commandArgSchema = z.string()
  .min(1, { message: "Argument cannot be empty" })
  .refine(
    (val) => !COMMAND_INJECTION_PATTERN.test(val),
    { message: "Argument contains invalid characters" }
  );

export const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .refine(
    (val) => !COMMAND_INJECTION_PATTERN.test(val),
    { message: "Password contains invalid characters" }
  );

// ─── Helper Functions ─────────────────────────────────────────────
export function validateInput<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data, error: null };
  } else {
    return { success: false, data: null, error: result.error.issues[0].message };
  }
}

export function isValidIpInput(value: unknown): boolean {
  return ipSchema.safeParse(value).success;
}

export function isValidIpv4(value: unknown): boolean {
  return ipv4Schema.safeParse(value).success;
}

/**
 * Shell metacharacter'larını temizler.
 * Komut üretimi yapan tüm tool'larda kullanılmalı.
 */
export function sanitizeCommandArg(value: string): string {
  return value.replace(COMMAND_INJECTION_CHARS, '');
}

/**
 * Dosya path'lerindeki tehlikeli karakterleri temizler.
 * Windows ve Linux path'leri için ayrı ayrı çalışır.
 */
export function sanitizeFilePath(value: string, os: 'windows' | 'linux' = 'linux'): string {
  const cleaned = value.replace(COMMAND_INJECTION_CHARS, '');
  if (os === 'windows') {
    return cleaned.replace(/[/]/g, '\\');
  }
  return cleaned;
}