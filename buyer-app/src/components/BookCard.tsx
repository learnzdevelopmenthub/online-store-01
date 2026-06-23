import { Link } from 'react-router-dom';

import { formatPaise } from '../lib/format.ts';
import type { Book } from '../store/api/booksApi.ts';
import { RatingStars } from './RatingStars.tsx';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link
      to={`/books/${book._id}`}
      className="card bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <figure className="aspect-[2/3] bg-base-200">
        <img src={book.coverImageUrl} alt={book.title} className="h-full w-full object-cover" />
      </figure>
      <div className="card-body gap-2 p-4">
        <p className="text-xs font-semibold uppercase text-primary">{book.category}</p>
        <h3 className="line-clamp-2 text-base font-bold">{book.title}</h3>
        <p className="truncate text-sm text-base-content/70">{book.author}</p>
        <RatingStars rating={book.averageRating} count={book.reviewCount} />
        <p className="text-lg font-bold">{formatPaise(book.price)}</p>
      </div>
    </Link>
  );
}
