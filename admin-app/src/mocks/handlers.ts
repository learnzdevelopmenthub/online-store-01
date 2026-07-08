import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_URL;

const books = [
  {
    _id: 'book-1',
    title: 'Practical JavaScript',
    author: 'Asha Rao',
    description: 'A hands-on guide to modern JavaScript.',
    category: 'Technology',
    price: 49900,
    coverImageKey: 'covers/book-1.webp',
    coverImageUrl: 'https://cdn.example.com/covers/book-1.webp',
    pdfKey: 'pdfs/book-1.pdf',
    samplePdfKey: null,
    averageRating: 4.5,
    reviewCount: 18,
    totalSales: 120,
    isPublished: false,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
];

const listResponse = {
  books,
  pagination: { page: 1, limit: 20, total: books.length, totalPages: 1 },
};
const firstBook = books[0]!;

const order = {
  _id: 'order-1',
  buyer: {
    _id: 'buyer-1',
    fullName: 'Buyer One',
    email: 'buyer@example.com',
    isActive: true,
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  books: [{ book: firstBook, price: 49900, downloadCount: 1, downloadLimit: 5 }],
  totalAmount: 49900,
  razorpayOrderId: 'rzp_order_1',
  razorpayPaymentId: 'pay_1',
  status: 'paid',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
};

const customer = {
  _id: 'buyer-1',
  fullName: 'Buyer One',
  email: 'buyer@example.com',
  isActive: true,
  createdAt: '2026-07-01T00:00:00.000Z',
  totalOrders: 1,
  totalSpend: 49900,
};

const settings = {
  _id: 'settings-1',
  storeName: 'EBookN',
  storeLogo: null,
  contactEmail: 'support@example.com',
  emailTemplate: 'Your books are ready.',
};

// Default handlers: no active session. Individual tests override via `server.use(...)`.
export const handlers = [
  http.post(`${API}/api/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
  http.get(`${API}/api/users/me`, () => new HttpResponse(null, { status: 401 })),
  http.get(`${API}/api/admin/books`, () => HttpResponse.json(listResponse)),
  http.get(`${API}/api/admin/dashboard`, () =>
    HttpResponse.json({
      stats: {
        totalRevenue: 49900,
        todayRevenue: 49900,
        monthRevenue: 49900,
        totalOrders: 1,
        todayOrders: 1,
      },
      topBooks: [{ bookId: firstBook._id, title: firstBook.title, revenue: 49900, sales: 1 }],
      recentOrders: [order],
    }),
  ),
  http.get(`${API}/api/admin/orders`, () =>
    HttpResponse.json({
      orders: [order],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }),
  ),
  http.get(`${API}/api/admin/orders/:id`, () => HttpResponse.json({ order })),
  http.post(`${API}/api/admin/orders/:id/refund`, () =>
    HttpResponse.json({ order: { ...order, status: 'refunded' } }),
  ),
  http.get(`${API}/api/admin/customers`, () =>
    HttpResponse.json({
      customers: [customer],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }),
  ),
  http.get(`${API}/api/admin/customers/:id`, () =>
    HttpResponse.json({ customer: { ...customer, orders: [order] } }),
  ),
  http.patch(`${API}/api/admin/customers/:id/suspend`, () =>
    HttpResponse.json({ customer: { ...customer, isActive: false } }),
  ),
  http.get(`${API}/api/admin/settings`, () => HttpResponse.json({ settings })),
  http.patch(`${API}/api/admin/settings`, async ({ request }) => {
    const body = (await request.json()) as Partial<typeof settings>;
    return HttpResponse.json({ settings: { ...settings, ...body } });
  }),
  http.get(`${API}/api/admin/books/:id`, () => HttpResponse.json({ book: firstBook })),
  http.post(`${API}/api/admin/books`, () =>
    HttpResponse.json({ book: firstBook }, { status: 201 }),
  ),
  http.patch(`${API}/api/admin/books/:id`, () => HttpResponse.json({ book: firstBook })),
  http.patch(`${API}/api/admin/books/:id/publish`, () => HttpResponse.json({ book: firstBook })),
  http.delete(`${API}/api/admin/books/:id`, () =>
    HttpResponse.json({ mode: 'hard', book: firstBook }),
  ),
  http.post(`${API}/api/admin/books/bulk`, () =>
    HttpResponse.json({ results: [{ id: firstBook._id, book: firstBook }] }),
  ),
];
