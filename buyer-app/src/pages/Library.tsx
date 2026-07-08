import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { RatingStars } from '../components/RatingStars.tsx';
import { formatPaise } from '../lib/format.ts';
import {
  useGetDownloadUrlMutation,
  useGetLibraryQuery,
  type LibraryItem,
} from '../store/api/libraryApi.ts';

export default function LibraryPage() {
  const { data, isLoading } = useGetLibraryQuery();
  const [getDownloadUrl, { isLoading: downloading }] = useGetDownloadUrlMutation();

  if (isLoading) {
    return (
      <div className="empty-state section">
        <p>Loading your library...</p>
      </div>
    );
  }

  const items = data?.books ?? [];

  if (items.length === 0) {
    return (
      <div className="empty-state section">
        <p>Your library is empty. Purchased books appear here.</p>
        <Link className="btn btn-ghost" to="/search">
          Browse books
        </Link>
      </div>
    );
  }

  async function handleDownload(item: LibraryItem) {
    try {
      const res = await getDownloadUrl(item.book._id).unwrap();
      window.open(res.url, '_blank', 'noopener,noreferrer');
      toast.success('Download started');
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 403) {
        toast.error('Download limit reached. Contact support.');
      } else {
        toast.error('Could not start download. Please try again.');
      }
    }
  }

  return (
    <section className="section">
      <h1 style={{ marginBottom: 'var(--sp-6)' }}>My Library</h1>
      <div className="book-grid">
        {items.map((item) => {
          const remaining = Math.max(0, item.downloadLimit - item.downloadCount);
          return (
            <article key={item.book._id} className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to={`/books/${item.book._id}`}>
                <div className="card-media" style={{ aspectRatio: '3 / 4' }}>
                  {item.book.coverImageUrl ? (
                    <img
                      src={item.book.coverImageUrl}
                      alt={item.book.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    `${item.book.category} Cover`
                  )}
                </div>
              </Link>
              <h3 style={{ margin: 'var(--sp-3) 0 var(--sp-1)' }}>
                <Link to={`/books/${item.book._id}`}>{item.book.title}</Link>
              </h3>
              <p className="muted" style={{ marginBottom: 'var(--sp-2)' }}>
                {item.book.author}
              </p>
              <RatingStars rating={item.book.averageRating} count={item.book.reviewCount} />
              <p className="muted-sm" style={{ margin: 'var(--sp-3) 0' }}>
                {remaining} of {item.downloadLimit} downloads left
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 'auto' }}
                disabled={remaining === 0 || downloading}
                onClick={() => void handleDownload(item)}
              >
                {remaining === 0 ? 'Limit reached' : 'Download PDF'}
              </button>
              <p className="muted-sm" style={{ marginTop: 'var(--sp-2)', textAlign: 'right' }}>
                {formatPaise(item.book.price)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
