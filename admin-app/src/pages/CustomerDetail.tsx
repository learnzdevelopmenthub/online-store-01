import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { StatusBadge } from '../components/StatusBadge.tsx';
import { formatPaise } from '../lib/format.ts';
import { useGetCustomerQuery } from '../store/api/adminApi.ts';

export default function CustomerDetailPage() {
  const id = useParams().id ?? '';
  const { data, isLoading } = useGetCustomerQuery(id, { skip: !id });
  const customer = data?.customer;

  if (isLoading) {
    return (
      <div className="empty-state section">
        <p>Loading customer...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="empty-state section">
        <p>Customer not found.</p>
        <Link className="btn" to="/customers">
          Customers
        </Link>
      </div>
    );
  }

  return (
    <section className="section">
      <Link to="/customers" className="btn btn-ghost btn-sm">
        <ArrowLeft size={16} />
        Customers
      </Link>

      <div className="section-head">
        <div>
          <p className="eyebrow">Customer detail</p>
          <h1>{customer.fullName}</h1>
          <p className="muted">{customer.email}</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="panel stat-card">
          <p className="muted-sm">Status</p>
          <strong>{customer.isActive ? 'Active' : 'Suspended'}</strong>
        </div>
        <div className="panel stat-card">
          <p className="muted-sm">Paid orders</p>
          <strong>{customer.totalOrders}</strong>
        </div>
        <div className="panel stat-card">
          <p className="muted-sm">Total spend</p>
          <strong>{formatPaise(customer.totalSpend)}</strong>
        </div>
      </div>

      <div className="panel admin-table-wrap">
        <h2>Purchase history</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <Link to={`/orders/${order._id}`}>{order.razorpayOrderId}</Link>
                </td>
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
    </section>
  );
}
