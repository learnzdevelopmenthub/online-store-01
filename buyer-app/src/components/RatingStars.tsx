import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
}

export function RatingStars({ rating, count }: RatingStarsProps) {
  const rounded = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-1 text-sm"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rounded ? 'fill-warning text-warning' : 'text-base-300'}`}
          aria-hidden="true"
        />
      ))}
      {count !== undefined && <span className="ml-1 text-base-content/70">({count})</span>}
    </span>
  );
}
