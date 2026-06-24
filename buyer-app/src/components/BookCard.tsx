import { Link } from 'react-router-dom';

import { formatPaise } from '../lib/format.ts';
import type { Book } from '../store/api/booksApi.ts';
import { RatingStars } from './RatingStars.tsx';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <article className="card">
      <Link to={`/books/${book._id}`} aria-label={book.title}>
        <div className="card-media">{book.category}</div>
      </Link>
      <div className="card-body">
        <h3 className="book-title">
          <Link to={`/books/${book._id}`}>{book.title}</Link>
        </h3>
        <p className="book-meta">{book.author}</p>
        <div className="book-row">
          <span className="book-price">{formatPaise(book.price)}</span>
          <RatingStars rating={book.averageRating} count={book.reviewCount} />
        </div>
        <div className="row">
          <button className="btn btn-sm btn-primary" type="button">
            Add to Cart
          </button>
          <button className="btn btn-sm btn-ghost" type="button" aria-label="Add to wishlist">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
