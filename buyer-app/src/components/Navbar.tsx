import { Search, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../store/hooks.ts';

export function Navbar() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [q, setQ] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = q.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="navbar mx-auto max-w-7xl px-4">
        <div className="navbar-start">
          <Link to="/" className="text-xl font-bold">
            Learnz Books
          </Link>
        </div>
        <form onSubmit={onSubmit} className="navbar-center hidden w-full max-w-md md:flex">
          <label className="input input-bordered flex w-full items-center gap-2">
            <Search className="h-4 w-4" aria-hidden="true" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="grow"
              placeholder="Search books"
              aria-label="Search books"
            />
          </label>
        </form>
        <nav className="navbar-end gap-2">
          <Link to="/search" className="btn btn-ghost btn-sm md:hidden" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
          <Link to="/profile" className="btn btn-ghost btn-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{user ? 'Profile' : 'Log in'}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
