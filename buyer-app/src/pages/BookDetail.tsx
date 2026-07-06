import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { BookGrid } from '../components/BookGrid.tsx';
import { RatingStars } from '../components/RatingStars.tsx';
import { formatPaise } from '../lib/format.ts';
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../store/api/wishlistApi.ts';
import { useGetBookQuery } from '../store/api/booksApi.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { addToCart, openCart } from '../store/slices/cartSlice.ts';

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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector((state) => state.cart.items);

  const { data, isLoading, isError } = useGetBookQuery(id, { skip: !id });
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !user });
  const [addToWishlist, { isLoading: adding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removing }] = useRemoveFromWishlistMutation();

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
  const inCart = cartItems.some((item) => item.bookId === book._id);
  const inWishlist = wishlistData?.books.some((b) => b._id === book._id) ?? false;

  function handleAddToCart() {
    if (owned) return;
    if (inCart) {
      dispatch(openCart());
      return;
    }
    dispatch(addToCart({ bookId: book._id, title: book.title, author: book.author, price: book.price, coverImageUrl: book.coverImageUrl }));
    dispatch(openCart());
    toast.success(`"${book.title}" added to cart`);
  }

  async function handleWishlist() {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(book._id).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(book._id).unwrap();
        toast.success('Added to wishlist');
      }
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      toast.error(message ?? 'Failed to update wishlist');
    }
  }

  return (
    <>
      <section className="section layout-2col">
        <article className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            className="card-media"
            style={{ aspectRatio: '3 / 4', borderRadius: 0, fontSize: '1rem' }}
          >
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              `${book.category} Cover`
            )}
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
            <button
              className="btn btn-primary"
              type="button"
              disabled={owned}
              onClick={handleAddToCart}
            >
              {owned ? 'Owned' : inCart ? 'In Cart — Open Cart' : 'Add to Cart'}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => void handleWishlist()}
              disabled={owned || adding || removing}
            >
              {inWishlist ? '♥ In Wishlist' : '♡ Add to Wishlist'}
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
