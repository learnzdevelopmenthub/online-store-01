import { Link } from 'react-router-dom';

import { formatPaise } from '../lib/format.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { closeCart, removeFromCart } from '../store/slices/cartSlice.ts';

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const { items, open } = useAppSelector((state) => state.cart);
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200,
          }}
          onClick={() => dispatch(closeCart())}
          aria-hidden="true"
        />
      )}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100dvh',
          width: 'min(400px, 100vw)',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform var(--transition-slow)',
          boxShadow: 'var(--shadow-lg)',
        }}
        aria-label="Shopping cart"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--sp-5) var(--sp-6)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
            Cart{' '}
            {items.length > 0 && (
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--muted)',
                  fontWeight: 400,
                }}
              >
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => dispatch(closeCart())}
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-4) var(--sp-6)' }}>
          {items.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--sp-4)',
                paddingTop: 'var(--sp-16)',
                color: 'var(--muted)',
                textAlign: 'center',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.4 }}
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p>Your cart is empty</p>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => dispatch(closeCart())}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {items.map((item) => (
                <li
                  key={item.bookId}
                  style={{
                    display: 'flex',
                    gap: 'var(--sp-3)',
                    padding: 'var(--sp-3)',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius)',
                    alignItems: 'flex-start',
                  }}
                >
                  <Link
                    to={`/books/${item.bookId}`}
                    onClick={() => dispatch(closeCart())}
                    style={{ flexShrink: 0 }}
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
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 56,
                          height: 72,
                          background: 'var(--surface-3)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      />
                    )}
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: 'var(--text-heading)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                      {item.author}
                    </p>
                    <p
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        marginTop: 'var(--sp-2)',
                      }}
                    >
                      {formatPaise(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => dispatch(removeFromCart(item.bookId))}
                    aria-label={`Remove ${item.title} from cart`}
                    style={{ flexShrink: 0, color: 'var(--muted)' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div
            style={{
              padding: 'var(--sp-5) var(--sp-6)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-4)',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ color: 'var(--muted)' }}>Total</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {formatPaise(total)}
              </span>
            </div>
            <button type="button" className="btn btn-primary" disabled style={{ width: '100%' }}>
              Checkout — coming soon
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => dispatch(closeCart())}
              style={{ width: '100%' }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
