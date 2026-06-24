import { BookGrid } from '../components/BookGrid.tsx';
import {
  useGetBooksQuery,
  useGetFeaturedQuery,
  useGetNewReleasesQuery,
  type Book,
} from '../store/api/booksApi.ts';

export default function Home() {
  const featured = useGetFeaturedQuery();
  const newReleases = useGetNewReleasesQuery();
  const bestsellers = useGetBooksQuery({ page: 1, limit: 8 });

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>Discover Your Next Favourite Read</h1>
            <p>
              Browse our curated collection of digital books. Purchase securely and download
              instantly to your library.
            </p>
            <div className="row">
              <a href="/search" className="btn btn-primary">
                Browse All Books
              </a>
              <a href="/category/Technology" className="btn btn-ghost">
                Shop by Category
              </a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true" />
        </div>
      </section>

      <BookSection
        title="Featured Books"
        isLoading={featured.isLoading}
        books={featured.data?.books ?? []}
      />
      <BookSection
        title="New Releases"
        isLoading={newReleases.isLoading}
        books={newReleases.data?.books ?? []}
      />
      <BookSection
        title="Bestsellers"
        isLoading={bestsellers.isLoading}
        books={bestsellers.data?.books ?? []}
      />
    </>
  );
}

interface BookSectionProps {
  title: string;
  isLoading: boolean;
  books: Book[];
}

function BookSection({ title, isLoading, books }: BookSectionProps) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {isLoading ? (
        <div className="empty-state">
          <p>Loading books...</p>
        </div>
      ) : (
        <BookGrid books={books} />
      )}
    </section>
  );
}
