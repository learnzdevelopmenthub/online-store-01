import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '../store/hooks.ts';

export function ProtectedRoute() {
  const status = useAppSelector((state) => state.auth.status);

  if (status === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
