import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { BookGrid } from '../components/BookGrid.tsx';
import { Navbar } from '../components/Navbar.tsx';
import { useGetByCategoryQuery } from '../store/api/booksApi.ts';

export default function CategoryPage() {
  const category = decodeURIComponent(useParams().category ?? '');
  const [page, setPage] = useState(1);
  const { data, isFetching } = useGetByCategoryQuery(
    { category, page, limit: 12 },
    { skip: !category },
  );
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{category}</h1>
          {isFetching && <span className="loading loading-spinner" />}
        </div>
        <BookGrid books={data?.books ?? []} emptyText="No books in this category yet." />
        {pagination && pagination.totalPages > 1 && (
          <div className="join">
            <button
              className="btn join-item"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="btn join-item pointer-events-none">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              className="btn join-item"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
