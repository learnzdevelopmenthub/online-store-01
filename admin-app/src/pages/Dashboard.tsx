import { useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '../store/api/authApi.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { clearCredentials } from '../store/slices/authSlice.ts';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Clear the client session regardless of network result.
    }
    dispatch(clearCredentials());
    navigate('/login');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-base-100">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-sm opacity-70">{user?.email}</p>
      <button type="button" className="btn btn-ghost" onClick={onLogout}>
        Log out
      </button>
    </main>
  );
}
