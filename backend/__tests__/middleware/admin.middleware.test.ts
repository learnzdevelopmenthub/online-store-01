import express, { type RequestHandler } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { requireAdmin } from '../../src/middleware/admin.middleware.js';
import { errorMiddleware } from '../../src/middleware/error.middleware.js';

const fakeUser =
  (role: 'buyer' | 'admin'): RequestHandler =>
  (req, _res, next) => {
    req.user = { id: '1', role, email: 'a@b.com' };
    next();
  };

const app = express();
app.get('/admin-only', fakeUser('admin'), requireAdmin, (_req, res) => res.json({ ok: true }));
app.get('/buyer-tries', fakeUser('buyer'), requireAdmin, (_req, res) => res.json({ ok: true }));
app.use(errorMiddleware);

describe('requireAdmin middleware', () => {
  it('allows an admin through (200)', async () => {
    const res = await request(app).get('/admin-only');
    expect(res.status).toBe(200);
  });

  it('blocks a buyer (403)', async () => {
    const res = await request(app).get('/buyer-tries');
    expect(res.status).toBe(403);
  });
});
