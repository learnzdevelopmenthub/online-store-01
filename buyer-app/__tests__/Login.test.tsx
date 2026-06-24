import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../src/mocks/server.ts';
import Login from '../src/pages/Login.tsx';
import { renderWithProviders } from './test-utils.tsx';

const API = import.meta.env.VITE_API_URL;
const user = {
  _id: '1',
  fullName: 'Jane Buyer',
  email: 'jane@example.com',
  avatar: null,
  role: 'buyer' as const,
  isActive: true,
};

describe('<Login />', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<Login />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('stores credentials on a successful login', async () => {
    server.use(
      http.post(`${API}/api/auth/login`, () =>
        HttpResponse.json({ accessToken: 'access-123', user }),
      ),
    );

    const { store } = renderWithProviders(<Login />);
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(store.getState().auth.status).toBe('authenticated');
    });
    expect(store.getState().auth.accessToken).toBe('access-123');
    expect(store.getState().auth.user?.email).toBe('jane@example.com');
  });
});
