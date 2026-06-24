import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '../store/hooks.ts';

export function AdminRoute() {
  const status = useAppSelector((state) => state.auth.status);
  const role = useAppSelector((state) => state.auth.user?.role);

  if (status === 'idle') {
    return (
      <div className="app-shell">
        <div className="empty-state">
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
