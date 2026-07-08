import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { adminApi } from '../src/store/api/adminApi.ts';
import { authApi } from '../src/store/api/authApi.ts';
import { booksApi } from '../src/store/api/booksApi.ts';
import { reviewsApi } from '../src/store/api/reviewsApi.ts';
import authReducer from '../src/store/slices/authSlice.ts';

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [booksApi.reducerPath]: booksApi.reducer,
      [reviewsApi.reducerPath]: reviewsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        adminApi.middleware,
        authApi.middleware,
        booksApi.middleware,
        reviewsApi.middleware,
      ),
  });
}

export type TestStore = ReturnType<typeof makeStore>;

export function renderWithProviders(
  ui: ReactElement,
  { store = makeStore(), route = '/' }: { store?: TestStore; route?: string } = {},
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}
