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
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="stars-count">{count !== undefined ? `${rating} (${count})` : rating}</span>
    </span>
  );
}
