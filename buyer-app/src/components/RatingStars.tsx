const STAR_PATH =
  'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z';

interface RatingStarsProps {
  rating: number;
  count?: number;
}

export function RatingStars({ rating, count }: RatingStarsProps) {
  const full = Math.floor(rating);

  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{ opacity: index < full ? 1 : 0.25 }}
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
      <span className="stars-count">{count !== undefined ? `${rating} (${count})` : rating}</span>
    </span>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

/** Interactive 1–5 star selector for the review form. */
export function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <span className="stars" role="radiogroup" aria-label="Your rating">
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'inline-flex',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              style={{ opacity: star <= value ? 1 : 0.25 }}
              aria-hidden="true"
            >
              <path d={STAR_PATH} />
            </svg>
          </button>
        );
      })}
    </span>
  );
}
