import { useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { openCart } from '../store/slices/cartSlice.ts';
import { CartDrawer } from './CartDrawer.tsx';

export function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) => state.cart.items.length);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = q.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  }

  return (
    <nav className="top-nav">
      <div className="nav-inner">
        <button
          type="button"
          className="menu-toggle"
          id="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link className="brand" to="/">
          <span>E</span>BookN
        </Link>
        <div className={`nav-links ${open ? 'open' : ''}`} id="nav-links">
          <NavLink to="/" onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/search" onClick={() => setOpen(false)}>
            Browse
          </NavLink>
          <NavLink to="/category/Technology" onClick={() => setOpen(false)}>
            Categories
          </NavLink>
          {user && (
            <NavLink to="/wishlist" onClick={() => setOpen(false)}>
              Wishlist
            </NavLink>
          )}
          {user && (
            <NavLink to="/library" onClick={() => setOpen(false)}>
              My Library
            </NavLink>
          )}
          {user && (
            <NavLink to="/orders" onClick={() => setOpen(false)}>
              Orders
            </NavLink>
          )}
          <NavLink to="/search" onClick={() => setOpen(false)}>
            Help
          </NavLink>
        </div>
        <div className="nav-tools">
          <form className="search-inline" id="global-search" onSubmit={onSubmit}>
            <input
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              aria-label="Search books"
              placeholder="Search books..."
            />
            <button type="submit" aria-label="Search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => dispatch(openCart())}
            aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            style={{ position: 'relative' }}
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
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  padding: '0 4px',
                }}
                aria-hidden="true"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
          {user ? (
            <Link className="btn btn-sm btn-ghost" to="/profile" aria-label="Profile">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="nav-label">{user.fullName.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link className="btn btn-sm btn-primary" to="/login">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="footer" id="app-footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <span>E</span>BookN
            </div>
            <p className="footer-desc">
              Your digital PDF bookstore. Browse, purchase, and download books securely. Powered by
              Razorpay checkout.
            </p>
          </div>
          <div>
            <div className="footer-heading">Browse</div>
            <ul className="footer-links">
              <li>
                <Link to="/search">All Books</Link>
              </li>
              <li>
                <Link to="/category/Technology">Categories</Link>
              </li>
              <li>
                <Link to="/category/Fiction">Fiction</Link>
              </li>
              <li>
                <Link to="/category/Technology">Technology</Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">Account</div>
            <ul className="footer-links">
              <li>
                <Link to="/library">My Library</Link>
              </li>
              <li>
                <Link to="/orders">Order History</Link>
              </li>
              <li>
                <Link to="/wishlist">Wishlist</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">Support</div>
            <ul className="footer-links">
              <li>
                <Link to="/search">Contact Us</Link>
              </li>
              <li>
                <Link to="/search">FAQ</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} EBookN. Digital PDF Bookstore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export function BuyerShell() {
  return (
    <div className="app-shell">
      <header id="app-header">
        <Navbar />
      </header>
      <main id="app-main" className="container">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
