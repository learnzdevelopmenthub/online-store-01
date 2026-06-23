import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BookCard } from '../../src/components/BookCard.tsx';
import type { Book } from '../../src/store/api/booksApi.ts';
import { renderWithProviders } from '../test-utils.tsx';

const book: Book = {
  _id: 'book-1',
  title: 'Practical JavaScript',
  author: 'Asha Rao',
  description: 'A guide',
  category: 'Technology',
  price: 49900,
  coverImageKey: 'covers/book.webp',
  coverImageUrl: 'https://cdn.example.com/covers/book.webp',
  samplePdfKey: null,
  averageRating: 4,
  reviewCount: 12,
  totalSales: 20,
  isPublished: true,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

describe('<BookCard />', () => {
  it('renders title, author, price and rating', () => {
    renderWithProviders(<BookCard book={book} />);

    expect(screen.getByText('Practical JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Asha Rao')).toBeInTheDocument();
    expect(screen.getByText('₹499')).toBeInTheDocument();
    expect(screen.getByLabelText('4 out of 5 stars')).toBeInTheDocument();
  });
});
