import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { formatPaise } from '../lib/format.ts';
import { useAppDispatch } from '../store/hooks.ts';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../store/api/wishlistApi.ts';
import { addToCart, openCart } from '../store/slices/cartSlice.ts';
import { RatingStars } from '../components/RatingStars.tsx';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  if (isLoading) {
    return (
      <div className="empty-state section">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  const books = data?.books ?? [];

  if (books.length === 0) {
    return (
      <div className="empty-state section">
        <p>Your wishlist is empty.</p>
        <Link className="btn btn-ghost" to="/search">
          Browse books
        </Link>
      </div>
    );
  }

  async function handleRemove(bookId: string, title: string) {
    try {
      await removeFromWishlist(bookId).unwrap();
      toast.success(`Removed "${title}" from wishlist`);
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  }

  function handleMoveToCart(book: (typeof books)[number]) {
    dispatch(
      addToCart({
        bookId: book._id,
        title: book.title,
        author: book.author,
        price: book.price,
        coverImageUrl: book.coverImageUrl,
      }),
    );
    dispatch(openCart());
    toast.success(`"${book.title}" added to cart`);
  }

  return (
    <section className="section">
      <h1 style={{ marginBottom: 'var(--sp-6)' }}>My Wishlist</h1>
      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-4)',
        }}
      >
        {books.map((book) => (
          <li
            key={book._id}
            className="panel"
            style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}
          >
            <Link to={`/books/${book._id}`} style={{ flexShrink: 0 }}>
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  style={{
                    width: 80,
                    height: 104,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius)',
                    display: 'block',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 104,
                    background: 'var(--surface-3)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              )}
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ marginBottom: 'var(--sp-1)' }}>
                <Link to={`/books/${book._id}`}>{book.title}</Link>
              </h3>
              <p className="muted" style={{ marginBottom: 'var(--sp-2)' }}>
                {book.author}
              </p>
              <RatingStars rating={book.averageRating} count={book.reviewCount} />
              <p
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginTop: 'var(--sp-3)',
                }}
              >
                {formatPaise(book.price)}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => handleMoveToCart(book)}
              >
                Add to Cart
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => void handleRemove(book._id, book.title)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
