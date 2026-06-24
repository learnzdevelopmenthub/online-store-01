import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BookGrid } from '../components/BookGrid.tsx';
import { useSearchBooksQuery } from '../store/api/booksApi.ts';

const CATEGORIES = ['Fiction', 'Technology', 'Business', 'Science'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQuery);
  const [debouncedQ, setDebouncedQ] = useState(initialQuery);
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all');
  const [maxPrice, setMaxPrice] = useState(
    searchParams.has('maxPrice') ? Number(searchParams.get('maxPrice')) / 100 : 99999,
  );
  const [minRating, setMinRating] = useState(Number(searchParams.get('minRating') ?? 0));
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (category !== 'all') params.set('category', category);
    if (maxPrice !== 99999) params.set('maxPrice', String(maxPrice * 100));
    if (minRating > 0) params.set('minRating', String(minRating));
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [category, debouncedQ, maxPrice, minRating, page, setSearchParams]);

  const query = useMemo(
    () => ({
      q: debouncedQ,
      category: category === 'all' ? undefined : category,
      maxPrice: maxPrice * 100,
      minRating,
      page,
      limit: 12,
    }),
    [category, debouncedQ, maxPrice, minRating, page],
  );
  const { data } = useSearchBooksQuery(query);
  const pagination = data?.pagination;

  return (
    <>
      <section className="panel section">
        <h1>Search Books</h1>
        <form
          className="filter-bar"
          style={{ marginTop: 'var(--sp-6)' }}
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="field">
            <label htmlFor="sq">Search query</label>
            <input
              id="sq"
              value={q}
              onChange={(event) => {
                setPage(1);
                setQ(event.target.value);
              }}
              placeholder="Title, author, or keyword"
            />
          </div>
          <div className="field">
            <label htmlFor="scat">Category</label>
            <select
              id="scat"
              value={category}
              onChange={(event) => {
                setPage(1);
                setCategory(event.target.value);
              }}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="srat">Min rating</label>
            <select
              id="srat"
              value={minRating}
              onChange={(event) => {
                setPage(1);
                setMinRating(Number(event.target.value));
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value === 0 ? 'Any' : `${value}+`}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sprice">Max price</label>
            <input
              id="sprice"
              type="number"
              min="100"
              value={maxPrice === 99999 ? '' : maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value || 99999))}
              placeholder="No limit"
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ alignSelf: 'end' }}>
            Search
          </button>
        </form>
        <p className="muted-sm" style={{ marginTop: 'var(--sp-4)' }}>
          {data?.pagination.total ?? 0} results found
        </p>
      </section>

      <section className="section">
        <BookGrid books={data?.books ?? []} emptyText="No books matched your search." />
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((item) => (
              <button
                key={item}
                className={item === page ? 'active' : ''}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
