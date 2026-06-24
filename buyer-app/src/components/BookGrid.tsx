import type { Book } from '../store/api/booksApi.ts';
import { BookCard } from './BookCard.tsx';

interface BookGridProps {
  books: Book[];
  emptyText?: string;
}

export function BookGrid({ books, emptyText = 'No books found.' }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {books.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
}
