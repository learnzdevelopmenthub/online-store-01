import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { BookGrid } from '../components/BookGrid.tsx';
import { RatingInput, RatingStars } from '../components/RatingStars.tsx';
import { ReviewList } from '../components/ReviewList.tsx';
import { formatPaise } from '../lib/format.ts';
import { useGetBookQuery } from '../store/api/booksApi.ts';
import { useGetLibraryQuery } from '../store/api/libraryApi.ts';
import {
  useFlagReviewMutation,
  useGetReviewsQuery,
  useSubmitReviewMutation,
} from '../store/api/reviewsApi.ts';
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '../store/api/wishlistApi.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { addToCart, openCart } from '../store/slices/cartSlice.ts';

export default function BookDetailPage() {
  const id = useParams().id ?? '';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector((state) => state.cart.items);

  const { data, isLoading, isError, refetch: refetchBook } = useGetBookQuery(id, { skip: !id });
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !user });
  const { data: libraryData } = useGetLibraryQuery(undefined, { skip: !user });
  const { data: reviewsData } = useGetReviewsQuery(id, { skip: !id });
  const [addToWishlist, { isLoading: adding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removing }] = useRemoveFromWishlistMutation();
  const [submitReview, { isLoading: submitting }] = useSubmitReviewMutation();
  const [flagReview] = useFlagReviewMutation();

  const reviews = reviewsData?.reviews ?? [];
  const myReview = user ? reviews.find((review) => review.buyerName === user.fullName) : undefined;

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Pre-populate the form when the buyer already has a review for this book.
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setReviewText(myReview.text);
    }
  }, [myReview]);

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
  const owned = libraryData?.books.some((item) => item.book._id === book._id) ?? false;
  const inCart = cartItems.some((item) => item.bookId === book._id);
  const inWishlist = wishlistData?.books.some((b) => b._id === book._id) ?? false;

  function handleAddToCart() {
    if (owned) return;
    if (inCart) {
      dispatch(openCart());
      return;
    }
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
      const message = (err as { data?: { error?: string } })?.data?.error;
      toast.error(message ?? 'Failed to update wishlist');
    }
  }

  async function handleSubmitReview() {
    if (rating < 1) {
      toast.error('Please select a star rating');
      return;
    }
    try {
      await submitReview({ bookId: book._id, rating, text: reviewText.trim() || undefined }).unwrap();
      toast.success(myReview ? 'Review updated' : 'Review submitted');
      void refetchBook();
    } catch (err: unknown) {
      const message = (err as { data?: { error?: string } })?.data?.error;
      toast.error(message ?? 'Failed to submit review');
    }
  }

  async function handleFlag(reviewId: string) {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await flagReview(reviewId).unwrap();
      toast.success('Review reported for moderation');
    } catch {
      toast.error('Could not report review');
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
            {owned ? (
              <Link className="btn btn-primary" to="/library">
                Read in My Library
              </Link>
            ) : (
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleAddToCart}
              >
                {inCart ? 'In Cart — Open Cart' : 'Add to Cart'}
              </button>
            )}
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

      <section className="section">
        <h2 style={{ marginBottom: 'var(--sp-5)' }}>
          Reviews {book.reviewCount > 0 && <span className="muted">({book.reviewCount})</span>}
        </h2>

        {owned && (
          <div className="panel" style={{ marginBottom: 'var(--sp-6)' }}>
            <h3 style={{ marginBottom: 'var(--sp-3)' }}>
              {myReview ? 'Update your review' : 'Write a review'}
            </h3>
            <RatingInput value={rating} onChange={setRating} />
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Share your thoughts about this book (optional)"
              rows={4}
              maxLength={2000}
              style={{ width: '100%', margin: 'var(--sp-3) 0' }}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={submitting}
              onClick={() => void handleSubmitReview()}
            >
              {myReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        )}

        <ReviewList reviews={reviews} canFlag={Boolean(user)} onFlag={(rid) => void handleFlag(rid)} />
      </section>

      {relatedBooks.length > 0 && (
        <section className="section">
          <h2>Related Books</h2>
          <BookGrid books={relatedBooks} />
        </section>
      )}
    </>
  );
}
