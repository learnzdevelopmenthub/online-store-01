import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AdminRoute } from './components/AdminRoute.tsx';
import api from './lib/axios.ts';
import { setAccessToken as setModuleToken } from './lib/tokenManager.ts';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import { useLazyGetMeQuery } from './store/api/authApi.ts';
import { useAppDispatch } from './store/hooks.ts';
import { clearCredentials, setCredentials } from './store/slices/authSlice.ts';
import { store } from './store/store.ts';

function AppRoutes() {
  const dispatch = useAppDispatch();
  const [triggerGetMe] = useLazyGetMeQuery();

  // On mount: silently restore an admin session from the refresh cookie.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await api.post<{ accessToken: string }>('/api/auth/refresh');
        if (!active) return;
        setModuleToken(res.data.accessToken);
        const me = await triggerGetMe().unwrap();
        if (!active) return;
        if (me.user.role === 'admin') {
          dispatch(setCredentials({ user: me.user, accessToken: res.data.accessToken }));
        } else {
          dispatch(clearCredentials());
        }
      } catch {
        if (active) dispatch(clearCredentials());
      }
    })();
    return () => {
      active = false;
    };
  }, [dispatch, triggerGetMe]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route element={<AdminRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
