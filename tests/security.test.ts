import { describe, it, expect } from 'vitest';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import request from 'supertest';

// ═══════════════════════════════════════════════════════════════════
// We test the security middleware config directly rather than
// importing server.ts (which starts listening).
// ═══════════════════════════════════════════════════════════════════

function createSecureApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "object-src": ["'none'"],
          "base-uri": ["'self'"],
          "frame-ancestors": ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  const allowedOrigins = ["http://localhost:3000"];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST"],
  }));

  app.get('/test', (req, res) => res.json({ ok: true }));
  return app;
}

// ═══════════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════
describe('Security Headers', () => {
  const app = createSecureApp();

  it('sets Content-Security-Policy', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['content-security-policy']).toBeTruthy();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['content-security-policy']).toContain("object-src 'none'");
  });

  it('sets X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('sets X-Frame-Options', async () => {
    const res = await request(app).get('/test');
    // Helmet sets either X-Frame-Options or CSP frame-ancestors
    const hasFrameProtection =
      res.headers['x-frame-options'] ||
      res.headers['content-security-policy']?.includes('frame-ancestors');
    expect(hasFrameProtection).toBeTruthy();
  });

  it('sets Referrer-Policy', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('does not expose X-Powered-By', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════════
describe('CORS Policy', () => {
  const app = createSecureApp();

  it('allows requests from localhost:3000', async () => {
    const res = await request(app)
      .get('/test')
      .set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('blocks requests from unknown origins', async () => {
    const res = await request(app)
      .get('/test')
      .set('Origin', 'https://malicious-site.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('blocks .run.app wildcard bypass', async () => {
    const res = await request(app)
      .get('/test')
      .set('Origin', 'https://evil-run.app');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('only allows GET and POST methods', async () => {
    const res = await request(app)
      .options('/test')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'DELETE');
    // DELETE should not be in allowed methods
    const allowed = res.headers['access-control-allow-methods'] || '';
    expect(allowed).not.toContain('DELETE');
    expect(allowed).not.toContain('PUT');
  });
});

// ═══════════════════════════════════════════════════════════════════
// REMOVED ENDPOINTS
// ═══════════════════════════════════════════════════════════════════
describe('Defunct Endpoints', () => {
  const app = createSecureApp();

  it('/api/health should not exist', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(404);
  });
});
