import { createApi } from '@reduxjs/toolkit/query/react';

import type { User } from '../slices/authSlice.ts';
import { axiosBaseQuery } from './baseQuery.ts';

interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/api/auth/login', method: 'post', data: body }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/api/auth/logout', method: 'post' }),
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => ({ url: '/api/users/me', method: 'get' }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
