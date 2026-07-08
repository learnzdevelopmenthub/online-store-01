import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { server } from '../../src/mocks/server.ts';
import BookDetailPage from '../../src/pages/BookDetail.tsx';
import { setCredentials } from '../../src/store/slices/authSlice.ts';
import { makeStore, renderWithProviders } from '../test-utils.tsx';

const API = import.meta.env.VITE_API_URL;

describe('<BookDetailPage />', () => {
  it('shows Already in your library when the user owns the book', async () => {
    // Ownership is server-authoritative: the book appears in the buyer's library.
    server.use(
      http.get(`${API}/api/library`, () =>
        HttpResponse.json({
          books: [
            {
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
              downloadCount: 0,
              downloadLimit: 5,
              orderId: 'order-1',
            },
          ],
        }),
      ),
    );

    const store = makeStore();
    store.dispatch(
      setCredentials({
        accessToken: 'token',
        user: {
          _id: 'user-1',
          fullName: 'Jane Buyer',
          email: 'jane@example.com',
          avatar: null,
          role: 'buyer',
          isActive: true,
        } as Parameters<typeof setCredentials>[0]['user'],
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/books/:id" element={<BookDetailPage />} />
      </Routes>,
      { route: '/books/book-1', store },
    );

    expect(await screen.findByText('Already in your library')).toBeInTheDocument();
  });
});
