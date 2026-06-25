import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BooksPage from '../src/pages/Books.tsx';
import { renderWithProviders } from './test-utils.tsx';

describe('<BooksPage />', () => {
  it('renders admin books and keeps bulk actions disabled before selection', async () => {
    renderWithProviders(<BooksPage />);

    expect(await screen.findByText('Practical JavaScript')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Unpublish' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Delete' })[0]).toBeDisabled();
  });
});
