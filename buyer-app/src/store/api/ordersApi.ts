import { createApi } from '@reduxjs/toolkit/query/react';

import type { Book } from './booksApi.ts';
import { axiosBaseQuery } from './baseQuery.ts';

export interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface OrderBook {
  book: Book;
  price: number;
  downloadCount: number;
  downloadLimit: number;
}

export interface Order {
  _id: string;
  buyer: string;
  books: OrderBook[];
  totalAmount: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, string[]>({
      query: (books) => ({ url: '/api/orders', method: 'post', data: { books } }),
      invalidatesTags: ['Orders'],
    }),
    getOrderHistory: builder.query<OrderHistoryResponse, void>({
      query: () => ({ url: '/api/orders' }),
      providesTags: ['Orders'],
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrderHistoryQuery } = ordersApi;
