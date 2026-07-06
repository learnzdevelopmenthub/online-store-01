import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { formatPaise } from '../lib/format.ts';
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../store/api/wishlistApi.ts';
import type { Book } from '../store/api/booksApi.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { addToCart, openCart } from '../store/slices/cartSlice.ts';
import { RatingStars } from './RatingStars.tsx';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector((state) => state.cart.items);

  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !user });
  const [addToWishlist, { isLoading: adding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removing }] = useRemoveFromWishlistMutation();

  const inCart = cartItems.some((item) => item.bookId === book._id);
  const inWishlist = wishlistData?.books.some((b) => b._id === book._id) ?? false;

  function handleAddToCart() {
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
    <article className="card">
      <Link to={`/books/${book._id}`} aria-label={book.title}>
        <div className="card-media">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            book.category
          )}
        </div>
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
          <button
            className="btn btn-sm btn-primary"
            type="button"
            onClick={handleAddToCart}
          >
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          <button
            className="btn btn-sm btn-ghost"
            type="button"
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => void handleWishlist()}
            disabled={adding || removing}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={inWishlist ? 'var(--primary)' : 'none'}
              stroke={inWishlist ? 'var(--primary)' : 'currentColor'}
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
