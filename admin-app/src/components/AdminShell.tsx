import { BookOpen, Flag, LayoutDashboard, LogOut } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '../store/api/authApi.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { clearCredentials } from '../store/slices/authSlice.ts';

export function AdminShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();

  async function onLogout() {
    try {
      await logout().unwrap();
    } catch {
      // Clear the client session regardless of network result.
    }
    dispatch(clearCredentials());
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header id="app-header">
        <nav className="top-nav">
          <div className="nav-inner">
            <Link to="/dashboard" className="brand" aria-label="EBookN Admin">
              <span>E</span>BookN Admin
            </Link>

            <div className="nav-links nav-links-open" style={{ flex: 1, justifyContent: 'center' }}>
              <NavLink to="/dashboard">
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
              <NavLink to="/books">
                <BookOpen size={16} />
                Books
              </NavLink>
              <NavLink to="/reviews">
                <Flag size={16} />
                Reviews
              </NavLink>
            </div>

            <div className="nav-tools">
              {user?.email && <span className="muted-sm admin-email">{user.email}</span>}
              <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main id="app-main" className="container">
        <Outlet />
      </main>
    </div>
  );
}
