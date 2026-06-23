import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './baseQuery.ts';

export interface AdminBook {
  _id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  coverImageKey: string;
  coverImageUrl: string;
  pdfKey: string;
  samplePdfKey?: string | null;
  averageRating: number;
  reviewCount: number;
  totalSales: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBooksResponse {
  books: AdminBook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type BulkBookAction = 'publish' | 'unpublish' | 'delete';

export const booksApi = createApi({
  reducerPath: 'adminBooksApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['AdminBooks'],
  endpoints: (builder) => ({
    getBooks: builder.query<AdminBooksResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/api/admin/books', params }),
      providesTags: ['AdminBooks'],
    }),
    getBook: builder.query<{ book: AdminBook }, string>({
      query: (id) => ({ url: `/api/admin/books/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'AdminBooks', id }],
    }),
    createBook: builder.mutation<{ book: AdminBook }, FormData>({
      query: (data) => ({ url: '/api/admin/books', method: 'post', data }),
      invalidatesTags: ['AdminBooks'],
    }),
    updateBook: builder.mutation<{ book: AdminBook }, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/api/admin/books/${id}`, method: 'patch', data }),
      invalidatesTags: (_result, _error, { id }) => ['AdminBooks', { type: 'AdminBooks', id }],
    }),
    deleteBook: builder.mutation<{ mode: 'soft' | 'hard'; book: AdminBook }, string>({
      query: (id) => ({ url: `/api/admin/books/${id}`, method: 'delete' }),
      invalidatesTags: ['AdminBooks'],
    }),
    publishBook: builder.mutation<
      { book: AdminBook },
      { id: string; isPublished: boolean; confirm?: boolean }
    >({
      query: ({ id, isPublished, confirm }) => ({
        url: `/api/admin/books/${id}/publish`,
        method: 'patch',
        data: { isPublished, confirm },
      }),
      invalidatesTags: (_result, _error, { id }) => ['AdminBooks', { type: 'AdminBooks', id }],
    }),
    bulkBooks: builder.mutation<
      { results: Array<{ id: string; error?: string; mode?: 'soft' | 'hard'; book?: AdminBook }> },
      { ids: string[]; action: BulkBookAction; confirm?: boolean }
    >({
      query: (data) => ({ url: '/api/admin/books/bulk', method: 'post', data }),
      invalidatesTags: ['AdminBooks'],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  usePublishBookMutation,
  useBulkBooksMutation,
} = booksApi;
