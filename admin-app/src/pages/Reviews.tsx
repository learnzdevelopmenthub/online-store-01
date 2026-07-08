import { Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetFlaggedReviewsQuery,
  useModerateReviewMutation,
  type FlaggedReview,
  type ReviewAction,
} from '../store/api/reviewsApi.ts';

export default function ReviewsPage() {
  const { data, isFetching } = useGetFlaggedReviewsQuery();
  const [moderateReview] = useModerateReviewMutation();

  const reviews = data?.reviews ?? [];

  async function moderate(review: FlaggedReview, action: ReviewAction) {
    const label = action === 'approve' ? 'Approve' : 'Remove';
    if (!window.confirm(`${label} this review by ${review.buyerName}?`)) return;
    try {
      await moderateReview({ reviewId: review._id, action }).unwrap();
      toast.success(action === 'approve' ? 'Review approved' : 'Review removed');
    } catch {
      toast.error('Could not moderate review');
    }
  }

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Admin moderation</p>
          <h1>Flagged Reviews</h1>
          <p className="muted">Approve legitimate reviews or remove ones that violate policy.</p>
        </div>
        {isFetching && <span className="muted-sm">Loading...</span>}
      </div>

      {reviews.length === 0 ? (
        <div className="panel empty-state">
          <p>No flagged reviews. The moderation queue is clear.</p>
        </div>
      ) : (
        <div className="panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Buyer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Flagged</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.bookTitle}</td>
                  <td>{review.buyerName}</td>
                  <td>{'★'.repeat(review.rating)}</td>
                  <td style={{ maxWidth: 360 }}>{review.text || <span className="muted">—</span>}</td>
                  <td>{new Date(review.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => void moderate(review, 'approve')}
                        aria-label="Approve"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-danger-soft"
                        onClick={() => void moderate(review, 'remove')}
                        aria-label="Remove"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
