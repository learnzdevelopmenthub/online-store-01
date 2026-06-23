import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import SearchPage from '../../src/pages/Search.tsx';
import { server } from '../../src/mocks/server.ts';
import { renderWithProviders } from '../test-utils.tsx';

const API = import.meta.env.VITE_API_URL;

describe('<SearchPage />', () => {
  it('debounces input and passes filters to searchBooks query', async () => {
    let lastUrl = new URL(`${API}/api/books/search`);
    server.use(
      http.get(`${API}/api/books/search`, ({ request }) => {
        lastUrl = new URL(request.url);
        return HttpResponse.json({
          books: [],
          pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
        });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>,
      { route: '/search' },
    );

    await userEvent.type(screen.getByPlaceholderText(/title, author, topic/i), 'javascript');
    fireEvent.click(screen.getByLabelText('Technology'));
    fireEvent.change(screen.getByLabelText(/minimum rating/i), { target: { value: '4' } });
    fireEvent.change(screen.getByRole('slider'), { target: { value: '99000' } });

    await waitFor(() => expect(lastUrl.searchParams.get('q')).toBe('javascript'), {
      timeout: 1200,
    });
    expect(lastUrl.searchParams.get('category')).toBe('Technology');
    expect(lastUrl.searchParams.get('minRating')).toBe('4');
    expect(lastUrl.searchParams.get('maxPrice')).toBe('99000');
  });
});
