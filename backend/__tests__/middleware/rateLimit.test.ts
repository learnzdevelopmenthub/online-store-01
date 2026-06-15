import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { authRateLimiter } from '../../src/middleware/rateLimit.middleware.js';

const app = express();
app.post('/login', authRateLimiter(), (_req, res) => {
  res.status(200).json({ ok: true });
});

describe('authRateLimiter', () => {
  it('allows 10 requests then returns 429 on the 11th', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app).post('/login');
      expect(res.status).toBe(200);
    }
    const limited = await request(app).post('/login');
    expect(limited.status).toBe(429);
  });
});
