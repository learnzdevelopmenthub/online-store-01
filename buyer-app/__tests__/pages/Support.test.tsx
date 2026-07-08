import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import ContactPage from '../../src/pages/Contact.tsx';
import FAQPage from '../../src/pages/FAQ.tsx';
import { server } from '../../src/mocks/server.ts';
import { renderWithProviders } from '../test-utils.tsx';

const API = import.meta.env.VITE_API_URL;

function renderContact() {
  return renderWithProviders(
    <>
      <Toaster position="top-right" richColors />
      <ContactPage />
    </>,
  );
}

describe('support pages', () => {
  it('submits the contact form and shows success feedback', async () => {
    const contactSpy = vi.fn();
    server.use(
      http.post(`${API}/api/contact`, async ({ request }) => {
        contactSpy(await request.json());
        return HttpResponse.json({ message: 'Message sent' });
      }),
    );

    renderContact();
    await userEvent.type(screen.getByLabelText(/name/i), 'Buyer One');
    await userEvent.type(screen.getByLabelText(/email/i), 'buyer@test.local');
    await userEvent.type(screen.getByLabelText(/message/i), 'Please help with my order.');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Message sent')).toBeInTheDocument();
    expect(contactSpy).toHaveBeenCalledWith(expect.objectContaining({ email: 'buyer@test.local' }));
  });

  it('shows failure feedback when contact submission fails', async () => {
    server.use(http.post(`${API}/api/contact`, () => HttpResponse.json({}, { status: 500 })));

    renderContact();
    await userEvent.type(screen.getByLabelText(/name/i), 'Buyer One');
    await userEvent.type(screen.getByLabelText(/email/i), 'buyer@test.local');
    await userEvent.type(screen.getByLabelText(/message/i), 'Please help with my order.');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Could not send message')).toBeInTheDocument();
  });

  it('renders FAQ support topics', () => {
    renderWithProviders(<FAQPage />);

    expect(screen.getByText(/download a purchased pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/request a refund/i)).toBeInTheDocument();
    expect(screen.getByText(/who can write reviews/i)).toBeInTheDocument();
  });
});
