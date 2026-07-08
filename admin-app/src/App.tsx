import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AdminShell } from './components/AdminShell.tsx';
import { AdminRoute } from './components/AdminRoute.tsx';
import api from './lib/axios.ts';
import { setAccessToken as setModuleToken } from './lib/tokenManager.ts';
import BookFormPage from './pages/BookForm.tsx';
import BooksPage from './pages/Books.tsx';
import CustomerDetailPage from './pages/CustomerDetail.tsx';
import CustomersPage from './pages/Customers.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import OrderDetailPage from './pages/OrderDetail.tsx';
import OrdersPage from './pages/Orders.tsx';
import ReviewsPage from './pages/Reviews.tsx';
import SettingsPage from './pages/Settings.tsx';
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
        <Route element={<AdminShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/new" element={<BookFormPage />} />
          <Route path="/books/:id/edit" element={<BookFormPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
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
