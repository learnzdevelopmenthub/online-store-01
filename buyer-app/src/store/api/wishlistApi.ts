import { createApi } from '@reduxjs/toolkit/query/react';

import type { Book } from './booksApi.ts';
import { axiosBaseQuery } from './baseQuery.ts';

export interface WishlistResponse {
  books: Book[];
}

export const wishlistApi = createApi({
  reducerPath: 'wishlistApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Wishlist'],
  endpoints: (builder) => ({
    getWishlist: builder.query<WishlistResponse, void>({
      query: () => ({ url: '/api/wishlist' }),
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<WishlistResponse, string>({
      query: (bookId) => ({ url: `/api/wishlist/${bookId}`, method: 'post' }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation<WishlistResponse, string>({
      query: (bookId) => ({ url: `/api/wishlist/${bookId}`, method: 'delete' }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } =
  wishlistApi;
