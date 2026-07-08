import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { StatusBadge } from '../components/StatusBadge.tsx';
import { formatPaise } from '../lib/format.ts';
import { useGetOrderQuery, useRefundOrderMutation } from '../store/api/adminApi.ts';

export default function OrderDetailPage() {
  const id = useParams().id ?? '';
  const { data, isLoading } = useGetOrderQuery(id, { skip: !id });
  const [refundOrder, refundState] = useRefundOrderMutation();
  const order = data?.order;

  async function onRefund() {
    if (!order) return;
    if (!window.confirm('Refund this order? Downloads from this order will be blocked.')) return;
    try {
      await refundOrder(order._id).unwrap();
      toast.success('Order refunded');
    } catch {
      toast.error('Could not refund order');
    }
  }

  if (isLoading) {
    return (
      <div className="empty-state section">
        <p>Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="empty-state section">
        <p>Order not found.</p>
        <Link className="btn" to="/orders">
          Orders
        </Link>
      </div>
    );
  }

  return (
    <section className="section">
      <Link to="/orders" className="btn btn-ghost btn-sm">
        <ArrowLeft size={16} />
        Orders
      </Link>

      <div className="section-head">
        <div>
          <p className="eyebrow">Order detail</p>
          <h1>{order.razorpayOrderId}</h1>
          <p className="muted">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <div className="admin-actions">
          <StatusBadge status={order.status} />
          <button
            type="button"
            className="btn btn-danger"
            disabled={order.status !== 'paid' || refundState.isLoading}
            onClick={() => void onRefund()}
          >
            <RotateCcw size={16} />
            Refund
          </button>
        </div>
      </div>

      <div className="admin-split-grid">
        <div className="panel">
          <h2>Buyer</h2>
          <p>{order.buyer?.fullName ?? 'Unknown buyer'}</p>
          <p className="muted">{order.buyer?.email ?? 'No email'}</p>
        </div>
        <div className="panel">
          <h2>Payment</h2>
          <p>Total: {formatPaise(order.totalAmount)}</p>
          <p className="muted-sm">Payment ID: {order.razorpayPaymentId ?? 'Not captured'}</p>
        </div>
      </div>

      <div className="panel admin-table-wrap">
        <h2>Books</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Downloads</th>
            </tr>
          </thead>
          <tbody>
            {order.books.map((line, index) => (
              <tr key={line.book?._id ?? index}>
                <td>
                  <strong>{line.book?.title ?? 'Unknown book'}</strong>
                  {line.book?.author && <p className="muted-sm">{line.book.author}</p>}
                </td>
                <td>{formatPaise(line.price)}</td>
                <td>
                  {line.downloadCount} / {line.downloadLimit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
