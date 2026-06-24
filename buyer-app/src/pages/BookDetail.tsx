import { Link, useParams } from 'react-router-dom';

import { BookGrid } from '../components/BookGrid.tsx';
import { RatingStars } from '../components/RatingStars.tsx';
import { formatPaise } from '../lib/format.ts';
import { useGetBookQuery } from '../store/api/booksApi.ts';
import { useAppSelector } from '../store/hooks.ts';

function userOwnsBook(user: unknown, bookId: string): boolean {
  const record = user as {
    libraryBookIds?: string[];
    orders?: Array<{ books?: Array<{ book?: string }> }>;
  };
  return Boolean(
    record.libraryBookIds?.includes(bookId) ||
    record.orders?.some((order) => order.books?.some((item) => item.book === bookId)),
  );
}

export default function BookDetailPage() {
  const id = useParams().id ?? '';
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetBookQuery(id, { skip: !id });

  if (isLoading) {
    return (
      <div className="empty-state section">
        <p>Loading book...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="empty-state section">
        <p>Book not found.</p>
        <Link className="btn btn-ghost" to="/search">
          Browse books
        </Link>
      </div>
    );
  }

  const { book, relatedBooks } = data;
  const owned = userOwnsBook(user, book._id);

  return (
    <>
      <section className="section layout-2col">
        <article className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            className="card-media"
            style={{ aspectRatio: '3 / 4', borderRadius: 0, fontSize: '1rem' }}
          >
            {book.category} Cover
          </div>
        </article>
        <article className="panel">
          <Link
            to={`/category/${encodeURIComponent(book.category)}`}
            className="pill pill-primary"
            style={{ marginBottom: 'var(--sp-4)' }}
          >
            {book.category}
          </Link>
          <h1 style={{ marginBottom: 'var(--sp-3)' }}>{book.title}</h1>
          <p className="muted" style={{ marginBottom: 'var(--sp-5)' }}>
            by {book.author}
          </p>
          <p style={{ marginBottom: 'var(--sp-6)' }}>{book.description}</p>
          <div className="row" style={{ marginBottom: 'var(--sp-6)' }}>
            <span className="book-price" style={{ fontSize: '1.5rem' }}>
              {formatPaise(book.price)}
            </span>
            <RatingStars rating={book.averageRating} count={book.reviewCount} />
            {owned && <span className="pill pill-ok">Already in your library</span>}
          </div>
          <div className="row">
            <button className="btn btn-primary" type="button" disabled={owned}>
              {owned ? 'Owned' : 'Add to Cart'}
            </button>
            <button className="btn btn-ghost" type="button">
              Add to Wishlist
            </button>
          </div>
        </article>
      </section>

      {book.samplePdfKey && (
        <section className="panel section">
          <h2>Sample Preview</h2>
          <p className="muted">
            A sample chapter is available for this book. Preview access will use the secure PDF
            delivery flow.
          </p>
        </section>
      )}

      {relatedBooks.length > 0 && (
        <section className="section">
          <h2>Related Books</h2>
          <BookGrid books={relatedBooks} />
        </section>
      )}
    </>
  );
}
