import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AdminRoute } from '../src/components/AdminRoute.tsx';
import { setCredentials, type User } from '../src/store/slices/authSlice.ts';
import { makeStore } from './test-utils.tsx';

const base: User = {
  _id: '1',
  fullName: 'X',
  email: 'x@store.com',
  avatar: null,
  role: 'admin',
  isActive: true,
};

function renderAt(user: User) {
  const store = makeStore();
  store.dispatch(setCredentials({ user, accessToken: 'token' }));
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/dashboard" element={<div>Secret Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('AdminRoute', () => {
  it('renders the protected route for an admin', () => {
    renderAt({ ...base, role: 'admin' });
    expect(screen.getByText('Secret Dashboard')).toBeInTheDocument();
  });

  it('redirects a non-admin to /login', () => {
    renderAt({ ...base, role: 'buyer' });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
