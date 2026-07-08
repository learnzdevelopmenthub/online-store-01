import { RatingStars } from './RatingStars.tsx';
import type { Review } from '../store/api/reviewsApi.ts';

interface ReviewListProps {
  reviews: Review[];
  canFlag: boolean;
  onFlag: (reviewId: string) => void;
}

export function ReviewList({ reviews, canFlag, onFlag }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="muted">No reviews yet. Be the first to review this book.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {reviews.map((review) => (
        <li key={review._id} className="panel">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <RatingStars rating={review.rating} />
              <p style={{ fontWeight: 600, marginTop: 'var(--sp-2)' }}>{review.buyerName}</p>
              <p className="muted-sm">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            {canFlag && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => onFlag(review._id)}
                aria-label="Report this review"
                title="Report this review"
              >
                ⚑ Report
              </button>
            )}
          </div>
          {review.text && <p style={{ marginTop: 'var(--sp-3)' }}>{review.text}</p>}
        </li>
      ))}
    </ul>
  );
}
