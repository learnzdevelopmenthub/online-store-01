import { http, HttpResponse } from 'msw';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import CustomerDetailPage from '../src/pages/CustomerDetail.tsx';
import CustomersPage from '../src/pages/Customers.tsx';
import Dashboard from '../src/pages/Dashboard.tsx';
import OrderDetailPage from '../src/pages/OrderDetail.tsx';
import SettingsPage from '../src/pages/Settings.tsx';
import { server } from '../src/mocks/server.ts';
import { renderWithProviders } from './test-utils.tsx';

const API = import.meta.env.VITE_API_URL;

describe('admin management pages', () => {
  it('renders dashboard stat cards from the API', async () => {
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText('Total revenue')).toBeInTheDocument();
    expect(screen.getAllByText('Practical JavaScript')[0]).toBeInTheDocument();
    expect(screen.getByText('buyer@example.com')).toBeInTheDocument();
  });

  it('confirms before refunding an order', async () => {
    const refundSpy = vi.fn();
    window.confirm = vi.fn(() => true);
    server.use(
      http.post(`${API}/api/admin/orders/:id/refund`, () => {
        refundSpy();
        return HttpResponse.json({ order: { status: 'refunded' } });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/orders/:id" element={<OrderDetailPage />} />
      </Routes>,
      { route: '/orders/order-1' },
    );

    await userEvent.click(await screen.findByRole('button', { name: /refund/i }));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(refundSpy).toHaveBeenCalledTimes(1));
  });

  it('lets admins suspend a customer', async () => {
    window.confirm = vi.fn(() => true);
    renderWithProviders(<CustomersPage />);

    await userEvent.click(await screen.findByRole('button', { name: /suspend/i }));

    expect(window.confirm).toHaveBeenCalled();
  });

  it('renders customer purchase history', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
      </Routes>,
      { route: '/customers/buyer-1' },
    );

    expect(await screen.findByText('Buyer One')).toBeInTheDocument();
    expect(screen.getByText('rzp_order_1')).toBeInTheDocument();
  });

  it('saves settings updates', async () => {
    const settingsSpy = vi.fn();
    server.use(
      http.patch(`${API}/api/admin/settings`, async ({ request }) => {
        settingsSpy(await request.json());
        return HttpResponse.json({
          settings: {
            _id: 'settings-1',
            storeName: 'New Store',
            storeLogo: null,
            contactEmail: 'support@example.com',
            emailTemplate: 'Your books are ready.',
          },
        });
      }),
    );

    renderWithProviders(<SettingsPage />);
    const storeName = await screen.findByLabelText(/store name/i);
    fireEvent.change(storeName, { target: { value: 'New Store' } });
    await userEvent.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() =>
      expect(settingsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          storeName: 'New Store',
        }),
      ),
    );
  });
});
