import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { StatusBadge } from '../components/StatusBadge.tsx';
import { formatPaise } from '../lib/format.ts';
import { useGetOrdersQuery, type OrderStatus } from '../store/api/adminApi.ts';

const STATUSES: Array<OrderStatus | ''> = ['', 'pending', 'paid', 'failed', 'refunded'];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  const { data, isFetching } = useGetOrdersQuery({
    page,
    status: status || undefined,
    search: submittedSearch || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSubmittedSearch(search.trim());
  }

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Order management</p>
          <h1>Orders</h1>
          <p className="muted">Search, filter, inspect, and refund customer orders.</p>
        </div>
      </div>

      <div className="panel admin-toolbar">
        <form className="admin-search-form" onSubmit={onSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search buyer email"
            aria-label="Search buyer email"
          />
          <button className="btn btn-sm" type="submit">
            <Search size={16} />
            Search
          </button>
        </form>
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          aria-label="Status filter"
        >
          {STATUSES.map((value) => (
            <option key={value || 'all'} value={value}>
              {value ? value[0]!.toUpperCase() + value.slice(1) : 'All statuses'}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(event) => {
            setPage(1);
            setFrom(event.target.value);
          }}
          aria-label="From date"
        />
        <input
          type="date"
          value={to}
          onChange={(event) => {
            setPage(1);
            setTo(event.target.value);
          }}
          aria-label="To date"
        />
        {isFetching && <span className="muted-sm">Loading orders...</span>}
      </div>

      <div className="panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Buyer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(data?.orders ?? []).map((order) => (
              <tr key={order._id}>
                <td>
                  <Link to={`/orders/${order._id}`}>{order.razorpayOrderId}</Link>
                </td>
                <td>{order.buyer?.email ?? 'Unknown'}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>{formatPaise(order.totalAmount)}</td>
                <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
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
