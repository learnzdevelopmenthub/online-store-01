import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './baseQuery.ts';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface AdminOrderBook {
  book: { _id: string; title: string; author?: string; coverImageKey?: string; pdfKey?: string };
  price: number;
  downloadCount: number;
  downloadLimit: number;
}

export interface AdminOrder {
  _id: string;
  buyer: { _id: string; fullName: string; email: string; isActive?: boolean; createdAt?: string };
  books: AdminOrderBook[];
  totalAmount: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardResponse {
  stats: {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    totalOrders: number;
    todayOrders: number;
  };
  topBooks: Array<{ bookId: string; title: string; revenue: number; sales: number }>;
  recentOrders: AdminOrder[];
}

export interface OrdersResponse {
  orders: AdminOrder[];
  pagination: Pagination;
}

export interface Customer {
  _id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpend: number;
}

export interface CustomerDetail extends Customer {
  orders: AdminOrder[];
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: Pagination;
}

export interface StoreSettings {
  _id: string;
  storeName: string;
  storeLogo?: string | null;
  contactEmail: string;
  emailTemplate: string;
}

export const adminApi = createApi({
  reducerPath: 'adminManagementApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Dashboard', 'Orders', 'Customers', 'Settings'],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, void>({
      query: () => ({ url: '/api/admin/dashboard' }),
      providesTags: ['Dashboard'],
    }),
    getOrders: builder.query<
      OrdersResponse,
      { page?: number; status?: string; from?: string; to?: string; search?: string } | void
    >({
      query: (params) => ({ url: '/api/admin/orders', params }),
      providesTags: ['Orders'],
    }),
    getOrder: builder.query<{ order: AdminOrder }, string>({
      query: (id) => ({ url: `/api/admin/orders/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),
    refundOrder: builder.mutation<{ order: AdminOrder }, string>({
      query: (id) => ({ url: `/api/admin/orders/${id}/refund`, method: 'post', data: {} }),
      invalidatesTags: ['Dashboard', 'Orders'],
    }),
    getCustomers: builder.query<CustomersResponse, { page?: number; search?: string } | void>({
      query: (params) => ({ url: '/api/admin/customers', params }),
      providesTags: ['Customers'],
    }),
    getCustomer: builder.query<{ customer: CustomerDetail }, string>({
      query: (id) => ({ url: `/api/admin/customers/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Customers', id }],
    }),
    suspendCustomer: builder.mutation<{ customer: Customer }, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/api/admin/customers/${id}/suspend`,
        method: 'patch',
        data: { isActive },
      }),
      invalidatesTags: ['Customers'],
    }),
    getSettings: builder.query<{ settings: StoreSettings }, void>({
      query: () => ({ url: '/api/admin/settings' }),
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<{ settings: StoreSettings }, Partial<StoreSettings>>({
      query: (data) => ({ url: '/api/admin/settings', method: 'patch', data }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useRefundOrderMutation,
  useGetCustomersQuery,
  useGetCustomerQuery,
  useSuspendCustomerMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = adminApi;
