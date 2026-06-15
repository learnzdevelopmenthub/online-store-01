import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import api from '../src/lib/axios.ts';
import { setAccessToken } from '../src/lib/tokenManager.ts';
import { server } from '../src/mocks/server.ts';

const API = import.meta.env.VITE_API_URL;

afterEach(() => {
  setAccessToken(null);
});

describe('axios 401 interceptor', () => {
  it('refreshes the token and retries the original request on 401', async () => {
    let protectedCalls = 0;
    let refreshCalls = 0;

    server.use(
      http.get(`${API}/api/protected`, () => {
        protectedCalls += 1;
        if (protectedCalls === 1) return new HttpResponse(null, { status: 401 });
        return HttpResponse.json({ ok: true });
      }),
      http.post(`${API}/api/auth/refresh`, () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: 'refreshed-token' });
      }),
    );

    const res = await api.get('/api/protected');

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ ok: true });
    expect(refreshCalls).toBe(1);
    expect(protectedCalls).toBe(2);
  });
});
