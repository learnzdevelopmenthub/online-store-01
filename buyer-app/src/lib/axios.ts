import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { getAccessToken, setAccessToken } from './tokenManager.ts';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send/receive the httpOnly refresh cookie
});

// Hooks the store wires up so a silent refresh / failure updates Redux.
type RefreshedHandler = (accessToken: string) => void;
let onRefreshed: RefreshedHandler | null = null;
let onRefreshFailed: (() => void) | null = null;
export const setOnRefreshed = (fn: RefreshedHandler): void => {
  onRefreshed = fn;
};
export const setOnRefreshFailed = (fn: () => void): void => {
  onRefreshFailed = fn;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single-flight refresh: concurrent 401s share one /auth/refresh call.
let refreshPromise: Promise<string> | null = null;
function refreshAccessToken(): Promise<string> {
  refreshPromise ??= api
    .post<{ accessToken: string }>('/api/auth/refresh')
    .then((res) => res.data.accessToken)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';

    const isAuthEndpoint = url.includes('/api/auth/refresh') || url.includes('/api/auth/login');
    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        setAccessToken(token);
        onRefreshed?.(token);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        setAccessToken(null);
        onRefreshFailed?.();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
