import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { server } from '../../src/mocks/server.ts';
import LibraryPage from '../../src/pages/Library.tsx';
import { renderWithProviders } from '../test-utils.tsx';

const API = import.meta.env.VITE_API_URL;

function libraryItem(overrides: { downloadCount?: number } = {}) {
  return {
    book: {
      _id: 'book-1',
      title: 'Practical JavaScript',
      author: 'Asha Rao',
      category: 'Technology',
      price: 49900,
      coverImageUrl: 'https://cdn.example.com/covers/book-1.webp',
      averageRating: 4.5,
      reviewCount: 18,
    },
    downloadCount: overrides.downloadCount ?? 1,
    downloadLimit: 5,
    orderId: 'order-1',
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<LibraryPage />', () => {
  it('renders purchased books with remaining downloads', async () => {
    server.use(
      http.get(`${API}/api/library`, () => HttpResponse.json({ books: [libraryItem()] })),
    );

    renderWithProviders(<LibraryPage />);

    expect(await screen.findByText('Practical JavaScript')).toBeInTheDocument();
    expect(screen.getByText('4 of 5 downloads left')).toBeInTheDocument();
  });

  it('opens a presigned URL in a new tab on download', async () => {
    server.use(
      http.get(`${API}/api/library`, () => HttpResponse.json({ books: [libraryItem()] })),
      http.get(`${API}/api/library/book-1/download`, () =>
        HttpResponse.json({ url: 'https://signed.example/pdf', downloadCount: 2, downloadLimit: 5 }),
      ),
    );
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    renderWithProviders(<LibraryPage />);
    const button = await screen.findByRole('button', { name: 'Download PDF' });
    await userEvent.click(button);

    await waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith(
        'https://signed.example/pdf',
        '_blank',
        'noopener,noreferrer',
      ),
    );
  });

  it('disables download when the limit is reached', async () => {
    server.use(
      http.get(`${API}/api/library`, () =>
        HttpResponse.json({ books: [libraryItem({ downloadCount: 5 })] }),
      ),
    );

    renderWithProviders(<LibraryPage />);

    const button = await screen.findByRole('button', { name: 'Limit reached' });
    expect(button).toBeDisabled();
  });

  it('shows an empty state when nothing is purchased', async () => {
    server.use(http.get(`${API}/api/library`, () => HttpResponse.json({ books: [] })));

    renderWithProviders(<LibraryPage />, { route: '/library' });

    expect(await screen.findByText(/your library is empty/i)).toBeInTheDocument();
  });
});
