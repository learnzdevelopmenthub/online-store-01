import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { authApi } from '../src/store/api/authApi.ts';
import { booksApi } from '../src/store/api/booksApi.ts';
import { libraryApi } from '../src/store/api/libraryApi.ts';
import { ordersApi } from '../src/store/api/ordersApi.ts';
import { reviewsApi } from '../src/store/api/reviewsApi.ts';
import { wishlistApi } from '../src/store/api/wishlistApi.ts';
import authReducer from '../src/store/slices/authSlice.ts';
import cartReducer from '../src/store/slices/cartSlice.ts';

export function makeStore() {
  return configureStore({
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
