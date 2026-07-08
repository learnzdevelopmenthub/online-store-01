import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_URL;

const books = [
  {
    _id: 'book-1',
    title: 'Practical JavaScript',
    author: 'Asha Rao',
    description: 'A hands-on guide to modern JavaScript for working developers.',
    category: 'Technology',
    price: 49900,
    coverImageKey: 'covers/book-1.webp',
    coverImageUrl: 'https://cdn.example.com/covers/book-1.webp',
    samplePdfKey: 'pdfs/samples/book-1-sample.pdf',
    averageRating: 4.5,
    reviewCount: 18,
    totalSales: 120,
    isPublished: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
];

const listResponse = {
  books,
  pagination: { page: 1, limit: 12, total: books.length, totalPages: 1 },
};

// Default handlers: no active session. Individual tests override via `server.use(...)`.
export const handlers = [
  http.post(`${API}/api/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
  http.get(`${API}/api/users/me`, () => new HttpResponse(null, { status: 401 })),
  http.get(`${API}/api/books`, () => HttpResponse.json(listResponse)),
  http.get(`${API}/api/books/search`, () => HttpResponse.json(listResponse)),
  http.get(`${API}/api/books/featured`, () => HttpResponse.json({ books })),
  http.get(`${API}/api/books/new-releases`, () => HttpResponse.json({ books })),
  http.get(`${API}/api/books/:id`, () =>
    HttpResponse.json({ book: books[0], relatedBooks: books }),
  ),
  http.get(`${API}/api/library`, () => HttpResponse.json({ books: [] })),
  http.get(`${API}/api/reviews/:bookId`, () =>
    HttpResponse.json({ reviews: [], averageRating: 0, reviewCount: 0 }),
  ),
];
