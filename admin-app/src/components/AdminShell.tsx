import { BookOpen, LayoutDashboard, LogOut } from 'lucide-react';
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
    <div className="min-h-screen bg-base-200">
      <header className="border-b border-base-300 bg-base-100">
        <div className="navbar mx-auto max-w-7xl px-4">
          <div className="navbar-start">
            <Link to="/dashboard" className="text-xl font-bold">
              Store Admin
            </Link>
          </div>
          <nav className="navbar-center hidden gap-2 md:flex">
            <NavLink to="/dashboard" className="btn btn-ghost btn-sm">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/books" className="btn btn-ghost btn-sm">
              <BookOpen className="h-4 w-4" />
              Books
            </NavLink>
          </nav>
          <div className="navbar-end gap-2">
            <span className="hidden text-sm text-base-content/70 lg:inline">{user?.email}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
