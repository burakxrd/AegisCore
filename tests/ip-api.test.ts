import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import ipRoutes from '../api/ip';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/tools/ip', ipRoutes);
  return app;
}

// ═══════════════════════════════════════════════════════════════════
// IP API — Input Validation
// ═══════════════════════════════════════════════════════════════════
describe('IP API — Input Validation', () => {
  const app = createApp();

  it('rejects non-IP input', async () => {
    const res = await request(app).get('/api/tools/ip/not-an-ip');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('Invalid');
  });

  it('rejects empty input', async () => {
    const res = await request(app).get('/api/tools/ip/');
    expect(res.status).toBe(404); // no route match
  });

  it('rejects domain names', async () => {
    const res = await request(app).get('/api/tools/ip/google.com');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('rejects IPs with path traversal', async () => {
    const res = await request(app).get('/api/tools/ip/8.8.8.8%2F..%2F..%2Fetc%2Fpasswd');
    expect(res.status).toBe(400);
  });

  it('accepts valid IPv4', async () => {
    const res = await request(app).get('/api/tools/ip/8.8.8.8');
    // Should pass validation — actual API call may succeed or fail
    expect(res.status).not.toBe(400);
  });
});

// ═══════════════════════════════════════════════════════════════════
// IP API — Response Format
// ═══════════════════════════════════════════════════════════════════
describe('IP API — Response Format', () => {
  const app = createApp();

  it('does not leak stack traces on valid request', async () => {
    const res = await request(app).get('/api/tools/ip/8.8.8.8');
    expect(res.body).not.toHaveProperty('stack');
    expect(JSON.stringify(res.body)).not.toContain('node_modules');
  });

  it('does not leak stack traces on invalid request', async () => {
    const res = await request(app).get('/api/tools/ip/invalid');
    expect(res.body).not.toHaveProperty('stack');
    expect(JSON.stringify(res.body)).not.toContain('Error:');
  });
});
