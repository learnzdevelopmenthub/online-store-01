import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BookGrid } from '../components/BookGrid.tsx';
import { Navbar } from '../components/Navbar.tsx';
import { useSearchBooksQuery } from '../store/api/booksApi.ts';

const CATEGORIES = ['Fiction', 'Technology', 'Business', 'Science'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQuery);
  const [debouncedQ, setDebouncedQ] = useState(initialQuery);
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice') ?? 500000));
  const [minRating, setMinRating] = useState(Number(searchParams.get('minRating') ?? 0));
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (category) params.set('category', category);
    if (maxPrice < 500000) params.set('maxPrice', String(maxPrice));
    if (minRating > 0) params.set('minRating', String(minRating));
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [category, debouncedQ, maxPrice, minRating, page, setSearchParams]);

  const query = useMemo(
    () => ({
      q: debouncedQ,
      category: category || undefined,
      maxPrice,
      minRating,
      page,
      limit: 12,
    }),
    [category, debouncedQ, maxPrice, minRating, page],
  );
  const { data, isFetching } = useSearchBooksQuery(query);
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5 rounded-box bg-base-100 p-4 shadow-sm">
          <label className="form-control">
            <span className="label-text">Search</span>
            <input
              value={q}
              onChange={(event) => {
                setPage(1);
                setQ(event.target.value);
              }}
              className="input input-bordered"
              placeholder="Title, author, topic"
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Category</legend>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                className="radio radio-sm"
                checked={!category}
                onChange={() => {
                  setPage(1);
                  setCategory('');
                }}
              />
              All
            </label>
            {CATEGORIES.map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="radio"
                  className="radio radio-sm"
                  checked={category === item}
                  onChange={() => {
                    setPage(1);
                    setCategory(item);
                  }}
                />
                {item}
              </label>
            ))}
          </fieldset>

          <label className="form-control">
            <span className="label-text">Max price: ₹{Math.round(maxPrice / 100)}</span>
            <input
              type="range"
              min={0}
              max={500000}
              step={10000}
              value={maxPrice}
              className="range range-primary"
              onChange={(event) => {
                setPage(1);
                setMaxPrice(Number(event.target.value));
              }}
            />
          </label>

          <label className="form-control">
            <span className="label-text">Minimum rating</span>
            <select
              className="select select-bordered"
              value={minRating}
              onChange={(event) => {
                setPage(1);
                setMinRating(Number(event.target.value));
              }}
            >
              <option value={0}>Any rating</option>
              <option value={3}>3 stars and up</option>
              <option value={4}>4 stars and up</option>
            </select>
          </label>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Search Books</h1>
            {isFetching && <span className="loading loading-spinner" />}
          </div>
          <BookGrid books={data?.books ?? []} />
          {pagination && pagination.totalPages > 1 && (
            <div className="join">
              <button
                className="btn join-item"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <span className="btn join-item pointer-events-none">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                className="btn join-item"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
