// In-memory access token, mirrored from the Redux store (never persisted).
// Separate module so `lib/axios.ts` can read it without importing the store.
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};
