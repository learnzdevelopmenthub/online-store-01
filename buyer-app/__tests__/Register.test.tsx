import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../src/mocks/server.ts';
import Register from '../src/pages/Register.tsx';
import { renderWithProviders } from './test-utils.tsx';

const API = import.meta.env.VITE_API_URL;

describe('<Register />', () => {
  it('renders all fields', () => {
    renderWithProviders(<Register />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText(/password \(min 8 characters\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows a validation error when passwords do not match', async () => {
    renderWithProviders(<Register />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane');
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password \(min 8 characters\)/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different456');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('calls the register mutation on a valid submit', async () => {
    let called = false;
    server.use(
      http.post(`${API}/api/auth/register`, () => {
        called = true;
        return HttpResponse.json({ user: { _id: '1' } }, { status: 201 });
      }),
    );

    renderWithProviders(<Register />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane');
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password \(min 8 characters\)/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(called).toBe(true);
    });
  });
});
