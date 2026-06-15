import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_URL;

// Default handlers: no active session. Individual tests override via `server.use(...)`.
export const handlers = [
  http.post(`${API}/api/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
  http.get(`${API}/api/users/me`, () => new HttpResponse(null, { status: 401 })),
];
