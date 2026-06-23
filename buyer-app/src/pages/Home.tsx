import { Navbar } from '../components/Navbar.tsx';
import { BookGrid } from '../components/BookGrid.tsx';
import {
  useGetBooksQuery,
  useGetFeaturedQuery,
  useGetNewReleasesQuery,
} from '../store/api/booksApi.ts';

export default function Home() {
  const featured = useGetFeaturedQuery();
  const newReleases = useGetNewReleasesQuery();
  const bestsellers = useGetBooksQuery({ page: 1, limit: 8 });

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8">
        <section className="rounded-box bg-base-100 p-6 shadow-sm">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold">Digital PDF bookstore</h1>
            <p className="mt-2 text-base-content/70">
              Browse practical PDFs by category, search by topic, and preview new releases.
            </p>
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
      </main>
    </div>
  );
}

interface BookSectionProps {
  title: string;
  isLoading: boolean;
  books: Parameters<typeof BookGrid>[0]['books'];
}

function BookSection({ title, isLoading, books }: BookSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {isLoading ? (
        <div className="loading loading-spinner loading-lg" />
      ) : (
        <BookGrid books={books} />
      )}
    </section>
  );
}
