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
    register: builder.mutation<
      { user: User },
      { fullName: string; email: string; password: string }
    >({
      query: (body) => ({ url: '/api/auth/register', method: 'post', data: body }),
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/api/auth/login', method: 'post', data: body }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/api/auth/logout', method: 'post' }),
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => ({ url: '/api/users/me', method: 'get' }),
    }),
    updateProfile: builder.mutation<{ user: User }, { fullName?: string; avatar?: string }>({
      query: (body) => ({ url: '/api/users/me', method: 'patch', data: body }),
    }),
    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: '/api/users/me/password', method: 'patch', data: body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
