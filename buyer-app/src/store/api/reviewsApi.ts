import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './baseQuery.ts';

export interface Review {
  _id: string;
  rating: number;
  text: string;
  buyerName: string;
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export interface SubmitReviewArgs {
  bookId: string;
  rating: number;
  text?: string;
}

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Reviews'],
  endpoints: (builder) => ({
    getReviews: builder.query<ReviewsResponse, string>({
      query: (bookId) => ({ url: `/api/reviews/${bookId}` }),
      providesTags: ['Reviews'],
    }),
    submitReview: builder.mutation<{ review: unknown }, SubmitReviewArgs>({
      query: ({ bookId, rating, text }) => ({
        url: `/api/reviews/${bookId}`,
        method: 'post',
        data: { rating, text },
      }),
      invalidatesTags: ['Reviews'],
    }),
    flagReview: builder.mutation<{ flagged: boolean }, string>({
      query: (reviewId) => ({ url: `/api/reviews/${reviewId}/flag`, method: 'post' }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

export const { useGetReviewsQuery, useSubmitReviewMutation, useFlagReviewMutation } = reviewsApi;
