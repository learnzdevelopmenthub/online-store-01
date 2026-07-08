import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './baseQuery.ts';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const supportApi = createApi({
  reducerPath: 'supportApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    submitContact: builder.mutation<{ message: string }, ContactPayload>({
      query: (data) => ({ url: '/api/contact', method: 'post', data }),
    }),
  }),
});

export const { useSubmitContactMutation } = supportApi;
