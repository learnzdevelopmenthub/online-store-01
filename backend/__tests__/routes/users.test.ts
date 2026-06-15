import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';

const app = createApp();

const VALID = { fullName: 'Jane Buyer', email: 'jane@example.com', password: 'password123' };

async function registerAndGetToken(): Promise<string> {
  await request(app).post('/api/auth/register').send(VALID);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: VALID.email, password: VALID.password });
  return res.body.accessToken as string;
}

describe('GET /api/users/me', () => {
  it('returns the current user with a valid token', async () => {
    const token = await registerAndGetToken();
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(VALID.email);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/users/me', () => {
  it('updates the full name', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Jane Updated' });
    expect(res.status).toBe(200);
    expect(res.body.user.fullName).toBe('Jane Updated');
  });
});

describe('PATCH /api/users/me/password', () => {
  it('changes the password with the correct current password', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: VALID.password, newPassword: 'newpassword456' });
    expect(res.status).toBe(200);
  });

  it('rejects an incorrect current password (400)', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrong-current', newPassword: 'newpassword456' });
    expect(res.status).toBe(400);
  });
});
