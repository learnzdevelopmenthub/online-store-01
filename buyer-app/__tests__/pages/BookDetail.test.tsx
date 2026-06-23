import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import BookDetailPage from '../../src/pages/BookDetail.tsx';
import { setCredentials } from '../../src/store/slices/authSlice.ts';
import { makeStore, renderWithProviders } from '../test-utils.tsx';

describe('<BookDetailPage />', () => {
  it('shows Already in your library when the user owns the book', async () => {
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
          libraryBookIds: ['book-1'],
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
