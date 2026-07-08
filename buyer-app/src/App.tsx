import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { BuyerShell } from './components/Navbar.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import api from './lib/axios.ts';
import { setAccessToken as setModuleToken } from './lib/tokenManager.ts';
import BookDetailPage from './pages/BookDetail.tsx';
import CategoryPage from './pages/Category.tsx';
import CheckoutPage from './pages/Checkout.tsx';
import ContactPage from './pages/Contact.tsx';
import FAQPage from './pages/FAQ.tsx';
import Home from './pages/Home.tsx';
import LibraryPage from './pages/Library.tsx';
import Login from './pages/Login.tsx';
import OrderHistoryPage from './pages/OrderHistory.tsx';
import Profile from './pages/Profile.tsx';
import Register from './pages/Register.tsx';
import SearchPage from './pages/Search.tsx';
import WishlistPage from './pages/Wishlist.tsx';
import { useLazyGetMeQuery } from './store/api/authApi.ts';
import { useAppDispatch } from './store/hooks.ts';
import { clearCredentials, setCredentials } from './store/slices/authSlice.ts';
import { store } from './store/store.ts';

function AppRoutes() {
  const dispatch = useAppDispatch();
  const [triggerGetMe] = useLazyGetMeQuery();

  // On mount: try to silently restore the session from the refresh cookie.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await api.post<{ accessToken: string }>('/api/auth/refresh');
        if (!active) return;
        setModuleToken(res.data.accessToken);
        const me = await triggerGetMe().unwrap();
        if (!active) return;
        dispatch(setCredentials({ user: me.user, accessToken: res.data.accessToken }));
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
      <Route element={<BuyerShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
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
