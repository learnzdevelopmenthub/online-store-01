// In-memory access token, mirrored from the Redux store (never persisted).
// Lives in its own module so `lib/axios.ts` can read it without importing the
// store (which would create a circular dependency).
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};
