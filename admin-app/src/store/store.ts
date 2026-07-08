import { configureStore } from '@reduxjs/toolkit';

import { setOnRefreshed, setOnRefreshFailed } from '../lib/axios.ts';
import { setAccessToken as setModuleToken } from '../lib/tokenManager.ts';
import { authApi } from './api/authApi.ts';
import { booksApi } from './api/booksApi.ts';
import { reviewsApi } from './api/reviewsApi.ts';
import authReducer, { clearCredentials, setAccessToken } from './slices/authSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, booksApi.middleware, reviewsApi.middleware),
});

store.subscribe(() => {
  setModuleToken(store.getState().auth.accessToken);
});

setOnRefreshed((token) => store.dispatch(setAccessToken(token)));
setOnRefreshFailed(() => store.dispatch(clearCredentials()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
