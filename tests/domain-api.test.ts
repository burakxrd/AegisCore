import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import domainRoutes from '../api/domain';

// ─── Test App Setup ───────────────────────────────────────────────
function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/tools/domain', domainRoutes);
  return app;
}

// ═══════════════════════════════════════════════════════════════════
// DOMAIN REGEX — malformed input rejection
// ═══════════════════════════════════════════════════════════════════
describe('Domain API — Input Validation', () => {
  const app = createApp();

  it('rejects empty domain', async () => {
    const res = await request(app).get('/api/tools/domain/');
    expect(res.status).toBe(404); // Express: no route match for "/"
  });

  it('rejects domain starting with hyphen', async () => {
    const res = await request(app).get('/api/tools/domain/-evil.com');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('rejects domain with consecutive dots', async () => {
    const res = await request(app).get('/api/tools/domain/a..b.com');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('rejects bare TLD', async () => {
    const res = await request(app).get('/api/tools/domain/.com');
    expect(res.status).toBe(400);
  });

  it('rejects domain with spaces/special chars', async () => {
    const res = await request(app).get('/api/tools/domain/evil%20domain.com');
    expect(res.status).toBe(400);
  });

  it('accepts valid domain format', async () => {
    // Note: this will attempt actual DNS resolution, so may return 404/500
    // depending on network. We only check it passes validation (not 400).
    const res = await request(app).get('/api/tools/domain/google.com');
    expect(res.status).not.toBe(400);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SSL ENDPOINT — SSRF Protection
// ═══════════════════════════════════════════════════════════════════
describe('SSL API — SSRF Protection', () => {
  const app = createApp();

  it('rejects malformed domain for SSL', async () => {
    const res = await request(app).get('/api/tools/domain/ssl/-bad.com');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('rejects domain with special chars for SSL', async () => {
    const res = await request(app).get('/api/tools/domain/ssl/evil%3Bcommand.com');
    expect(res.status).toBe(400);
  });
});
