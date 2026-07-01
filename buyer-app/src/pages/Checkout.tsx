import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { formatPaise } from '../lib/format.ts';
import { useCreateOrderMutation } from '../store/api/ordersApi.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { clearCart } from '../store/slices/cartSlice.ts';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-checkout-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.auth.user);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/', { replace: true });
    }
  }, [items.length, navigate]);

  if (items.length === 0) return null;

  async function handlePayNow() {
    try {
      const result = await createOrder(items.map((item) => item.bookId)).unwrap();
      await loadRazorpayScript();

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: result.keyId,
          amount: result.amount,
          currency: result.currency,
          order_id: result.razorpayOrderId,
          name: 'EBookN',
          description: `${items.length} book${items.length > 1 ? 's' : ''}`,
          prefill: { name: user?.fullName, email: user?.email },
          theme: { color: '#e84393' },
          handler: () => resolve(),
          modal: { ondismiss: () => reject(new Error('dismissed')) },
        });
        rzp.open();
      });

      dispatch(clearCart());
      toast.success('Payment successful! Your books are in your library.');
      navigate('/orders');
    } catch (err) {
      const message = (err as Error).message;
      if (message === 'dismissed') {
        toast.info('Payment cancelled.');
      } else {
        const apiMsg = (err as { data?: { message?: string } }).data?.message;
        toast.error(apiMsg ?? 'Payment failed. Please try again.');
      }
    }
  }

  return (
    <section className="section">
      <h1 style={{ marginBottom: 'var(--sp-6)' }}>Checkout</h1>

      <div style={{ display: 'grid', gap: 'var(--sp-6)', gridTemplateColumns: '1fr auto' }}>
        <div>
          <h2 style={{ fontSize: '1rem', marginBottom: 'var(--sp-4)', color: 'var(--muted)' }}>
            Order Summary ({items.length} item{items.length > 1 ? 's' : ''})
          </h2>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-3)',
            }}
          >
            {items.map((item) => (
              <li
                key={item.bookId}
                className="panel"
                style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}
              >
                {item.coverImageUrl ? (
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    style={{
                      width: 56,
                      height: 72,
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 72,
                      background: 'var(--surface-3)',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 2 }}>
                    {item.author}
                  </p>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                  {formatPaise(item.price)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <aside
          className="panel"
          style={{
            width: 280,
            height: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-4)',
          }}
        >
          <h2 style={{ fontSize: '1rem' }}>Payment</h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border)',
              paddingTop: 'var(--sp-3)',
            }}
          >
            <span style={{ color: 'var(--muted)' }}>Total</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              {formatPaise(total)}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handlePayNow()}
            disabled={isCreating}
            style={{ width: '100%' }}
          >
            {isCreating ? 'Preparing...' : `Pay ${formatPaise(total)}`}
          </button>
          <Link
            to="/"
            className="btn btn-ghost"
            style={{ width: '100%', textAlign: 'center' }}
            onClick={() => {}}
          >
            Continue Shopping
          </Link>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
            Secured by Razorpay
          </p>
        </aside>
      </div>
    </section>
  );
}
