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

// Default handlers: no active session. Individual tests override via `server.use(...)`.
export const handlers = [
  http.post(`${API}/api/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
  http.get(`${API}/api/users/me`, () => new HttpResponse(null, { status: 401 })),
  http.get(`${API}/api/admin/books`, () => HttpResponse.json(listResponse)),
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
