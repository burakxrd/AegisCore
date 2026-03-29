import { describe, it, expect } from 'vitest';
import { SHELLS, LISTENERS, STABILIZE_STEPS } from '../src/data/ctf-reverse-shells';

// ═══════════════════════════════════════════════════════════════════
// REVERSE SHELL DATA INTEGRITY
// ═══════════════════════════════════════════════════════════════════
describe('Reverse Shell Definitions', () => {
  it('all shells have required fields', () => {
    for (const shell of SHELLS) {
      expect(shell.id, `Shell missing id`).toBeTruthy();
      expect(shell.label, `${shell.id} missing label`).toBeTruthy();
      expect(shell.category, `${shell.id} missing category`).toBeTruthy();
      expect(typeof shell.cmd, `${shell.id} cmd is not a function`).toBe('function');
    }
  });

  it('all shells produce output with valid lhost/port', () => {
    for (const shell of SHELLS) {
      const output = shell.cmd('10.10.14.1', '4444');
      expect(output, `${shell.id} produced empty output`).toBeTruthy();
      expect(typeof output, `${shell.id} output is not string`).toBe('string');
    }
  });

  it('no shell leaks placeholder values with valid input', () => {
    for (const shell of SHELLS) {
      const output = shell.cmd('10.10.14.1', '9001');
      // $LHOST / $LPORT should not appear when valid values are given
      expect(output, `${shell.id} still contains $LHOST`).not.toContain('$LHOST');
      expect(output, `${shell.id} still contains $LPORT`).not.toContain('$LPORT');
    }
  });

  it('shells handle special characters in lhost gracefully', () => {
    for (const shell of SHELLS) {
      // Should not throw
      expect(() => shell.cmd('10.10.14.1', '4444')).not.toThrow();
      expect(() => shell.cmd('::1', '4444')).not.toThrow();
    }
  });

  it('all shell IDs are unique', () => {
    const ids = SHELLS.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ═══════════════════════════════════════════════════════════════════
// LISTENERS
// ═══════════════════════════════════════════════════════════════════
describe('Listener Definitions', () => {
  it('all listeners produce valid commands', () => {
    for (const listener of LISTENERS) {
      expect(listener.label).toBeTruthy();
      const cmd = listener.cmd('4444');
      expect(cmd).toBeTruthy();
      expect(cmd).toContain('4444');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// STABILIZE STEPS
// ═══════════════════════════════════════════════════════════════════
describe('Stabilize Steps', () => {
  it('all steps have title, cmd, and note', () => {
    for (const step of STABILIZE_STEPS) {
      expect(step.title).toBeTruthy();
      expect(step.cmd).toBeTruthy();
      expect(step.note).toBeTruthy();
    }
  });
});
