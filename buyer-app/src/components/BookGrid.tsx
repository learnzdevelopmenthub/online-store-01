import type { Book } from '../store/api/booksApi.ts';
import { BookCard } from './BookCard.tsx';

interface BookGridProps {
  books: Book[];
  emptyText?: string;
}

export function BookGrid({ books, emptyText = 'No books found.' }: BookGridProps) {
  if (books.length === 0) {
    return (
      <p className="rounded-box bg-base-200 p-6 text-center text-base-content/70">{emptyText}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
}
