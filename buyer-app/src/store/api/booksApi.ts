import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './baseQuery.ts';

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  coverImageKey: string;
  coverImageUrl: string;
  samplePdfKey?: string | null;
  averageRating: number;
  reviewCount: number;
  totalSales: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface BooksResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookDetailResponse {
  book: Book;
  relatedBooks: Book[];
}

export const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Books'],
  endpoints: (builder) => ({
    getBooks: builder.query<BooksResponse, BookFilters | void>({
      query: (params) => ({ url: '/api/books', params }),
      providesTags: ['Books'],
    }),
    getBook: builder.query<BookDetailResponse, string>({
      query: (id) => ({ url: `/api/books/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Books', id }],
    }),
    searchBooks: builder.query<BooksResponse, BookFilters & { q?: string }>({
      query: (params) => ({ url: '/api/books/search', params }),
      providesTags: ['Books'],
    }),
    getFeatured: builder.query<{ books: Book[] }, void>({
      query: () => ({ url: '/api/books/featured' }),
      providesTags: ['Books'],
    }),
    getNewReleases: builder.query<{ books: Book[] }, void>({
      query: () => ({ url: '/api/books/new-releases' }),
      providesTags: ['Books'],
    }),
    getByCategory: builder.query<BooksResponse, BookFilters & { category: string }>({
      query: (params) => ({ url: '/api/books', params }),
      providesTags: ['Books'],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useSearchBooksQuery,
  useGetFeaturedQuery,
  useGetNewReleasesQuery,
  useGetByCategoryQuery,
} = booksApi;
