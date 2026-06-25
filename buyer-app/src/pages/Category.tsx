import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { BookGrid } from '../components/BookGrid.tsx';
import { useGetByCategoryQuery } from '../store/api/booksApi.ts';

const CATEGORIES = ['Fiction', 'Technology', 'Business', 'Science'];

export default function CategoryPage() {
  const category = decodeURIComponent(useParams().category ?? 'Technology');
  const [page, setPage] = useState(1);
  const { data } = useGetByCategoryQuery({ category, page, limit: 12 }, { skip: !category });
  const pagination = data?.pagination;

  return (
    <>
      <section className="panel section">
        <h1>Browse by Category</h1>
        <div className="row" style={{ marginTop: 'var(--sp-4)' }}>
          {CATEGORIES.map((item) => (
            <Link
              key={item}
              className={`btn ${item === category ? 'btn-primary' : 'btn-ghost'}`}
              to={`/category/${encodeURIComponent(item)}`}
            >
              {item}
            </Link>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>{category}</h2>
        <BookGrid books={data?.books ?? []} emptyText="No books in this category yet." />
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <button className="active">{pagination.page}</button>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        )}
      </section>
    </>
  );
}
