import { z } from 'zod';

// Reusable basic schemas
export const ipv4Schema = z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, { message: "Please enter a valid IPv4 address" });
export const ipv6Schema = z.string().regex(/^[a-fA-F0-9:]+$/, { message: "Please enter a valid IPv6 address" });
export const domainSchema = z.string().regex(/^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,}$/, { message: "Please enter a valid domain name" });
export const portSchema = z.number().int().min(1).max(65535, { message: "Port number must be between 1 and 65535" });

// Helper function to safely validate directly in components without deeply understanding Zod errors
export function validateInput<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data, error: null };
  } else {
    // Extract the first error message for simplicity
    return { success: false, data: null, error: result.error.issues[0].message };
  }
}
