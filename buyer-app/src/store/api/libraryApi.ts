import { createApi } from '@reduxjs/toolkit/query/react';

import type { Book } from './booksApi.ts';
import { axiosBaseQuery } from './baseQuery.ts';

export interface LibraryItem {
  book: Book;
  downloadCount: number;
  downloadLimit: number;
  orderId: string;
}

export interface LibraryResponse {
  books: LibraryItem[];
}

export interface DownloadResponse {
  url: string;
  downloadCount: number;
  downloadLimit: number;
}

export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Library'],
  endpoints: (builder) => ({
    getLibrary: builder.query<LibraryResponse, void>({
      query: () => ({ url: '/api/library' }),
      providesTags: ['Library'],
    }),
    // GET endpoint modelled as a mutation: triggered on click, refreshes counts.
    getDownloadUrl: builder.mutation<DownloadResponse, string>({
      query: (bookId) => ({ url: `/api/library/${bookId}/download` }),
      invalidatesTags: ['Library'],
    }),
  }),
});

export const { useGetLibraryQuery, useGetDownloadUrlMutation } = libraryApi;
