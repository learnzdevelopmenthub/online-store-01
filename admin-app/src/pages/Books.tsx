import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { formatPaise } from '../lib/format.ts';
import {
  useBulkBooksMutation,
  useDeleteBookMutation,
  useGetBooksQuery,
  usePublishBookMutation,
  type AdminBook,
  type BulkBookAction,
} from '../store/api/booksApi.ts';

export default function BooksPage() {
  const [page, setPage] = useState(1);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, isFetching } = useGetBooksQuery({ page, limit: 20 });
  const [publishBook] = usePublishBookMutation();
  const [deleteBook] = useDeleteBookMutation();
  const [bulkBooks, bulkState] = useBulkBooksMutation();

  const books = data?.books ?? [];
  const selectedIds = books.filter((_book, index) => rowSelection[index]).map((book) => book._id);

  async function togglePublish(book: AdminBook) {
    const isPublished = !book.isPublished;
    if (!isPublished && !window.confirm('Unpublish this book? Existing buyers keep access.')) {
      return;
    }
    try {
      await publishBook({ id: book._id, isPublished, confirm: !isPublished }).unwrap();
      toast.success(isPublished ? 'Book published' : 'Book unpublished');
    } catch {
      toast.error('Could not update publish status');
    }
  }

  async function onDelete(book: AdminBook) {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    try {
      await deleteBook(book._id).unwrap();
      toast.success('Book deleted');
    } catch {
      toast.error('Could not delete book');
    }
  }

  async function runBulk(action: BulkBookAction) {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Apply ${action} to ${selectedIds.length} selected books?`)) return;
    try {
      await bulkBooks({ ids: selectedIds, action, confirm: action === 'unpublish' }).unwrap();
      setRowSelection({});
      toast.success('Bulk action completed');
    } catch {
      toast.error('Bulk action failed');
    }
  }

  const columns = useMemo<ColumnDef<AdminBook>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="admin-checkbox"
            checked={table.getIsAllRowsSelected()}
            ref={(input) => {
              if (input) input.indeterminate = table.getIsSomeRowsSelected();
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Select all books"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="admin-checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select ${row.original.title}`}
          />
        ),
      },
      {
        header: 'Cover',
        accessorKey: 'coverImageUrl',
        cell: ({ row }) => (
          <img src={row.original.coverImageUrl} alt={row.original.title} className="cover-thumb" />
        ),
      },
      { header: 'Title', accessorKey: 'title' },
      { header: 'Category', accessorKey: 'category' },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ row }) => formatPaise(row.original.price),
      },
      {
        header: 'Published',
        accessorKey: 'isPublished',
        cell: ({ row }) => (
          <button
            type="button"
            className={`pill ${row.original.isPublished ? 'pill-ok' : ''}`}
            onClick={() => void togglePublish(row.original)}
          >
            {row.original.isPublished ? 'Published' : 'Draft'}
          </button>
        ),
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('en-IN'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="admin-actions">
            <Link
              to={`/books/${row.original._id}/edit`}
              className="btn btn-ghost btn-sm"
              aria-label="Edit"
            >
              <Edit size={16} />
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-danger-soft"
              onClick={() => void onDelete(row.original)}
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: books,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Admin catalogue</p>
          <h1>Books</h1>
          <p className="muted">Manage catalogue uploads and publishing.</p>
        </div>
        <Link to="/books/new" className="btn btn-primary">
          <Plus size={16} />
          Add Book
        </Link>
      </div>

      <div className="panel admin-toolbar">
        <button
          className="btn btn-sm"
          disabled={selectedIds.length === 0}
          onClick={() => void runBulk('publish')}
        >
          Publish
        </button>
        <button
          className="btn btn-sm"
          disabled={selectedIds.length === 0}
          onClick={() => void runBulk('unpublish')}
        >
          Unpublish
        </button>
        <button
          className="btn btn-sm btn-danger"
          disabled={selectedIds.length === 0 || bulkState.isLoading}
          onClick={() => void runBulk('delete')}
        >
          Delete
        </button>
        {isFetching && <span className="muted-sm">Loading books...</span>}
      </div>

      <div className="panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="muted">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <button
            className="btn"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
