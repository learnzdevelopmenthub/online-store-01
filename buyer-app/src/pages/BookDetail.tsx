import { Link, useParams } from 'react-router-dom';

import { BookGrid } from '../components/BookGrid.tsx';
import { Navbar } from '../components/Navbar.tsx';
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
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10">
          <span className="loading loading-spinner loading-lg" />
        </main>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10">
          <p className="alert alert-error">Book not found.</p>
        </main>
      </div>
    );
  }

  const { book, relatedBooks } = data;
  const owned = userOwnsBook(user, book._id);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <section className="grid gap-8 rounded-box bg-base-100 p-5 shadow-sm md:grid-cols-[320px_1fr]">
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="aspect-[2/3] w-full rounded-box object-cover"
          />
          <div className="space-y-4">
            <Link
              to={`/category/${encodeURIComponent(book.category)}`}
              className="badge badge-primary"
            >
              {book.category}
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <p className="mt-1 text-lg text-base-content/70">{book.author}</p>
            </div>
            <RatingStars rating={book.averageRating} count={book.reviewCount} />
            <p className="text-3xl font-bold">{formatPaise(book.price)}</p>
            {owned && <p className="badge badge-success">Already in your library</p>}
            <p className="max-w-3xl leading-7 text-base-content/80">{book.description}</p>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary" disabled={owned}>
                {owned ? 'Owned' : 'Add to Cart'}
              </button>
              <button className="btn btn-ghost">Add to Wishlist</button>
            </div>
          </div>
        </section>

        {book.samplePdfKey && (
          <section className="rounded-box bg-base-100 p-5 shadow-sm">
            <h2 className="text-xl font-bold">Sample Preview</h2>
            <p className="mt-2 text-base-content/70">
              A sample chapter is available for this book. Preview access will use the secure PDF
              delivery flow.
            </p>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-xl font-bold">Related Books</h2>
          <BookGrid books={relatedBooks} emptyText="No related books yet." />
        </section>
      </main>
    </div>
  );
}
