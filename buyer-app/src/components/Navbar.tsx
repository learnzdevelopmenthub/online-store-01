import { useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../store/hooks.ts';

export function Navbar() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
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
          <NavLink to="/profile" onClick={() => setOpen(false)}>
            My Library
          </NavLink>
          <NavLink to="/search" onClick={() => setOpen(false)}>
            Cart
          </NavLink>
          <NavLink to="/profile" onClick={() => setOpen(false)}>
            Orders
          </NavLink>
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
                <Link to="/profile">My Library</Link>
              </li>
              <li>
                <Link to="/profile">Order History</Link>
              </li>
              <li>
                <Link to="/profile">Wishlist</Link>
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
    </div>
  );
}
