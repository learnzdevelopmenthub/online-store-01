import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { requireAuth } from '../../src/middleware/auth.middleware.js';
import { errorMiddleware } from '../../src/middleware/error.middleware.js';
import { signAccessToken } from '../../src/utils/jwt.util.js';

const app = express();
app.get('/protected', requireAuth, (req, res) => {
  res.json({ id: req.user?.id, role: req.user?.role });
});
app.use(errorMiddleware);

const validToken = signAccessToken({ sub: 'user-123', role: 'buyer', email: 'a@b.com' });

describe('requireAuth middleware', () => {
  it('passes a valid token and attaches req.user', async () => {
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('user-123');
    expect(res.body.role).toBe('buyer');
  });

  it('rejects a missing token (401)', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  it('rejects a tampered token (401)', async () => {
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${validToken}x`);
    expect(res.status).toBe(401);
  });

  it('rejects an expired token (401)', async () => {
    const expired = jwt.sign(
      { sub: 'u', role: 'buyer', email: 'a@b.com' },
      process.env.JWT_PRIVATE_KEY ?? '',
      {
        algorithm: 'RS256',
        expiresIn: '-10s',
      },
    );
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });
});
