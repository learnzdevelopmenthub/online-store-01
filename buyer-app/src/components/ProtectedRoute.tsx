import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '../store/hooks.ts';

export function ProtectedRoute() {
  const status = useAppSelector((state) => state.auth.status);

  if (status === 'idle') {
    return (
      <div className="empty-state">
        <p>Loading session...</p>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
