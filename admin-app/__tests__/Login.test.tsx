import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../src/mocks/server.ts';
import Login from '../src/pages/Login.tsx';
import { renderWithProviders } from './test-utils.tsx';

const API = import.meta.env.VITE_API_URL;
const adminUser = {
  _id: '1',
  fullName: 'Store Admin',
  email: 'admin@store.com',
  avatar: null,
  role: 'admin' as const,
  isActive: true,
};
const buyerUser = { ...adminUser, _id: '2', role: 'buyer' as const, email: 'buyer@store.com' };

async function fillAndSubmit(email: string) {
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

describe('<Login /> (admin)', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<Login />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('authenticates an admin account', async () => {
    server.use(
      http.post(`${API}/api/auth/login`, () =>
        HttpResponse.json({ accessToken: 'access-123', user: adminUser }),
      ),
    );
    const { store } = renderWithProviders(<Login />);
    await fillAndSubmit('admin@store.com');
    await waitFor(() => expect(store.getState().auth.status).toBe('authenticated'));
    expect(store.getState().auth.user?.role).toBe('admin');
  });

  it('rejects a non-admin (buyer) account', async () => {
    let called = false;
    server.use(
      http.post(`${API}/api/auth/login`, () => {
        called = true;
        return HttpResponse.json({ accessToken: 'access-123', user: buyerUser });
      }),
    );
    const { store } = renderWithProviders(<Login />);
    await fillAndSubmit('buyer@store.com');
    await waitFor(() => expect(called).toBe(true));
    expect(store.getState().auth.status).not.toBe('authenticated');
    expect(store.getState().auth.user).toBeNull();
  });
});
