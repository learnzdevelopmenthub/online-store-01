import { Link } from 'react-router-dom';

import { formatPaise } from '../lib/format.ts';
import { useGetOrderHistoryQuery } from '../store/api/ordersApi.ts';

const STATUS_STYLES: Record<string, { background: string; color: string; label: string }> = {
  pending: { background: 'rgba(245,158,11,0.12)', color: '#d97706', label: 'Pending' },
  paid: { background: 'rgba(34,197,94,0.12)', color: '#16a34a', label: 'Paid' },
  failed: { background: 'rgba(239,68,68,0.12)', color: '#dc2626', label: 'Failed' },
  refunded: { background: 'rgba(148,163,184,0.12)', color: 'var(--muted)', label: 'Refunded' },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending!;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 600,
        background: style.background,
        color: style.color,
        textTransform: 'capitalize',
      }}
    >
      {style.label}
    </span>
  );
}

export default function OrderHistoryPage() {
  const { data, isLoading } = useGetOrderHistoryQuery();

  if (isLoading) {
    return (
      <div className="empty-state section">
        <p>Loading orders...</p>
      </div>
    );
  }

  const orders = data?.orders ?? [];

  if (orders.length === 0) {
    return (
      <div className="empty-state section">
        <p>You haven&apos;t placed any orders yet.</p>
        <Link className="btn btn-ghost" to="/search">
          Browse books
        </Link>
      </div>
    );
  }

  return (
    <section className="section">
      <h1 style={{ marginBottom: 'var(--sp-6)' }}>Order History</h1>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {orders.map((order) => (
          <li key={order._id} className="panel">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'var(--sp-3)',
                flexWrap: 'wrap',
                gap: 'var(--sp-2)',
              }}
            >
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 2 }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                  {order.razorpayOrderId}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <StatusBadge status={order.status} />
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                  {formatPaise(order.totalAmount)}
                </span>
              </div>
            </div>

            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--sp-3)',
              }}
            >
              {order.books.map((ob, i) => {
                const book = ob.book;
                return (
                  <li
                    key={book?._id ?? i}
                    style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}
                  >
                    {book?.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        style={{
                          width: 40,
                          height: 52,
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 52,
                          background: 'var(--surface-3)',
                          borderRadius: 'var(--radius-sm)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {book?._id ? (
                        <Link
                          to={`/books/${book._id}`}
                          style={{ fontWeight: 500, fontSize: '0.9rem' }}
                        >
                          {book.title}
                        </Link>
                      ) : (
                        <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>Unknown Book</p>
                      )}
                      {book?.author && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{book.author}</p>
                      )}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', flexShrink: 0 }}>
                      {formatPaise(ob.price)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
