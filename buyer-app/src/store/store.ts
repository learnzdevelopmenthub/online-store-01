import { configureStore } from '@reduxjs/toolkit';

import { setOnRefreshed, setOnRefreshFailed } from '../lib/axios.ts';
import { setAccessToken as setModuleToken } from '../lib/tokenManager.ts';
import { authApi } from './api/authApi.ts';
import { booksApi } from './api/booksApi.ts';
import { libraryApi } from './api/libraryApi.ts';
import { ordersApi } from './api/ordersApi.ts';
import { reviewsApi } from './api/reviewsApi.ts';
import { wishlistApi } from './api/wishlistApi.ts';
import authReducer, { clearCredentials, setAccessToken } from './slices/authSlice.ts';
import cartReducer from './slices/cartSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [authApi.reducerPath]: authApi.reducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [libraryApi.reducerPath]: libraryApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      booksApi.middleware,
      wishlistApi.middleware,
      ordersApi.middleware,
      libraryApi.middleware,
      reviewsApi.middleware,
    ),
});

// Mirror the Redux access token into the axios module (kept out of localStorage).
store.subscribe(() => {
  setModuleToken(store.getState().auth.accessToken);
});

// Bridge the axios 401-refresh interceptor back into Redux.
setOnRefreshed((token) => store.dispatch(setAccessToken(token)));
setOnRefreshFailed(() => store.dispatch(clearCredentials()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
