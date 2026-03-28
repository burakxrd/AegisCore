import { z } from 'zod';

// ─── IP Schemas ───────────────────────────────────────────────────
export const ipv4Schema = z.string().ip({ version: "v4", message: "Invalid IPv4 address" });
export const ipv6Schema = z.string().ip({ version: "v6", message: "Invalid IPv6 address" });

// General IP address validation (v4 or v6)
export const ipSchema = z.union([ipv4Schema, ipv6Schema]);

// ─── Domain & Port Schemas ────────────────────────────────────────
export const domainSchema = z.string().regex(/^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,}$/, { message: "Invalid domain name" });

export const portSchema = z.coerce
  .number({ invalid_type_error: "Port must be a number" })
  .int()
  .min(1, { message: "Port cannot be less than 1" })
  .max(65535, { message: "Port cannot be greater than 65535" });

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
  const result = ipSchema.safeParse(value);
  return result.success;
}