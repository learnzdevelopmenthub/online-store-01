import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './baseQuery.ts';

export interface FlaggedReview {
  _id: string;
  rating: number;
  text: string;
  bookId: string | null;
  bookTitle: string;
  buyerName: string;
  createdAt: string;
}

export type ReviewAction = 'approve' | 'remove';

export const reviewsApi = createApi({
  reducerPath: 'adminReviewsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['FlaggedReviews'],
  endpoints: (builder) => ({
    getFlaggedReviews: builder.query<{ reviews: FlaggedReview[] }, void>({
      query: () => ({ url: '/api/admin/reviews/flagged' }),
      providesTags: ['FlaggedReviews'],
    }),
    moderateReview: builder.mutation<{ action: ReviewAction }, { reviewId: string; action: ReviewAction }>({
      query: ({ reviewId, action }) => ({
        url: `/api/admin/reviews/${reviewId}`,
        method: 'patch',
        data: { action },
      }),
      invalidatesTags: ['FlaggedReviews'],
    }),
  }),
});

export const { useGetFlaggedReviewsQuery, useModerateReviewMutation } = reviewsApi;
