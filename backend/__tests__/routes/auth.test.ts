import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { User } from '../../src/models/User.model.js';
import { hashPassword } from '../../src/utils/password.util.js';

const app = createApp();

const VALID = { fullName: 'Jane Buyer', email: 'jane@example.com', password: 'password123' };

function extractRefreshCookie(res: request.Response): string {
  const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
  const cookie = setCookie?.find((c) => c.startsWith('refreshToken='));
  if (!cookie) throw new Error('refresh cookie was not set');
  return cookie.split(';')[0] ?? '';
}

async function registerAndLogin() {
  await request(app).post('/api/auth/register').send(VALID);
  return request(app)
    .post('/api/auth/login')
    .send({ email: VALID.email, password: VALID.password });
}

describe('POST /api/auth/register', () => {
  it('registers a new buyer (201) and never leaks secrets', async () => {
    const res = await request(app).post('/api/auth/register').send(VALID);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('jane@example.com');
    expect(res.body.user.role).toBe('buyer');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.refreshToken).toBeUndefined();
  });

  it('rejects a duplicate email (409)', async () => {
    await request(app).post('/api/auth/register').send(VALID);
    const res = await request(app).post('/api/auth/register').send(VALID);
    expect(res.status).toBe(409);
  });

  it('rejects a weak password (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID, password: 'short' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials, returns a token and sets the refresh cookie', async () => {
    const res = await registerAndLogin();
    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
    expect(extractRefreshCookie(res)).toContain('refreshToken=');
  });

  it('returns a generic 401 on wrong password', async () => {
    await request(app).post('/api/auth/register').send(VALID);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('returns 403 for a suspended account', async () => {
    const passwordHash = await hashPassword(VALID.password);
    await User.create({
      fullName: 'Suspended',
      email: 'suspended@example.com',
      passwordHash,
      isActive: false,
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'suspended@example.com', password: VALID.password });
    expect(res.status).toBe(403);
  });
});

describe('POST /api/auth/refresh', () => {
  it('issues a new access token with a valid cookie', async () => {
    const cookie = extractRefreshCookie(await registerAndLogin());
    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('rejects a missing cookie (401)', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('rotates the refresh token — the old cookie becomes invalid', async () => {
    const oldCookie = extractRefreshCookie(await registerAndLogin());
    const rotated = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie);
    expect(rotated.status).toBe(200);
    const reuse = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie);
    expect(reuse.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the cookie and nullifies the stored refresh token', async () => {
    const login = await registerAndLogin();
    const accessToken = login.body.accessToken as string;
    const cookie = extractRefreshCookie(login);

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie);
    expect(res.status).toBe(204);

    const afterLogout = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(afterLogout.status).toBe(401);
  });
});
