import { describe, expect, it } from 'vitest';

import authReducer, {
  clearCredentials,
  setAccessToken,
  setCredentials,
  type User,
} from '../src/store/slices/authSlice.ts';

const user: User = {
  _id: '1',
  fullName: 'Jane Buyer',
  email: 'jane@example.com',
  avatar: null,
  role: 'buyer',
  isActive: true,
};

describe('authSlice', () => {
  it('setCredentials stores the user + token and marks authenticated', () => {
    const state = authReducer(undefined, setCredentials({ user, accessToken: 'tok' }));
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe('tok');
    expect(state.status).toBe('authenticated');
  });

  it('setAccessToken updates only the token', () => {
    const state = authReducer(undefined, setAccessToken('new-token'));
    expect(state.accessToken).toBe('new-token');
    expect(state.status).toBe('authenticated');
  });

  it('clearCredentials resets to an unauthenticated state', () => {
    const authed = authReducer(undefined, setCredentials({ user, accessToken: 'tok' }));
    const state = authReducer(authed, clearCredentials());
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.status).toBe('unauthenticated');
  });
});
