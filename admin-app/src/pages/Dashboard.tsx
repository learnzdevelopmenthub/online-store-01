import { Link } from 'react-router-dom';

import { StatusBadge } from '../components/StatusBadge.tsx';
import { formatPaise } from '../lib/format.ts';
import { useGetDashboardQuery } from '../store/api/adminApi.ts';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel stat-card">
      <p className="muted-sm">{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useGetDashboardQuery();
  const stats = data?.stats;

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Store Admin</p>
          <h1>Dashboard</h1>
          <p className="muted">Sales, recent orders, and top-performing books.</p>
        </div>
      </div>

      {isLoading && <p className="muted">Loading dashboard...</p>}

      <div className="admin-stats-grid">
        <StatCard label="Total revenue" value={formatPaise(stats?.totalRevenue ?? 0)} />
        <StatCard label="Today" value={formatPaise(stats?.todayRevenue ?? 0)} />
        <StatCard label="This month" value={formatPaise(stats?.monthRevenue ?? 0)} />
        <StatCard label="Total orders" value={stats?.totalOrders ?? 0} />
        <StatCard label="Today orders" value={stats?.todayOrders ?? 0} />
      </div>

      <div className="admin-split-grid">
        <div className="panel admin-table-wrap">
          <div className="section-head compact">
            <h2>Top books</h2>
            <Link className="btn btn-ghost btn-sm" to="/books">
              Books
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Sales</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topBooks ?? []).map((book) => (
                <tr key={book.bookId}>
                  <td>{book.title}</td>
                  <td>{book.sales}</td>
                  <td>{formatPaise(book.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel admin-table-wrap">
          <div className="section-head compact">
            <h2>Recent orders</h2>
            <Link className="btn btn-ghost btn-sm" to="/orders">
              Orders
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders ?? []).map((order) => (
                <tr key={order._id}>
                  <td>
                    <Link to={`/orders/${order._id}`}>{order.buyer?.email ?? 'Unknown'}</Link>
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>{formatPaise(order.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
