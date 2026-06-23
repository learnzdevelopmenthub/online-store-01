import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/app.js';
import { Book } from '../../src/models/Book.model.js';
import { Order } from '../../src/models/Order.model.js';
import { signAccessToken } from '../../src/utils/jwt.util.js';

vi.mock('../../src/services/image.service.js', () => ({
  resizeCoverImage: vi.fn(async (buffer: Buffer) => Buffer.from(`resized:${buffer.toString()}`)),
}));

vi.mock('../../src/services/r2.service.js', () => ({
  uploadFile: vi.fn(async (key: string) => key),
  deleteFile: vi.fn(async () => undefined),
  getPresignedGetUrl: vi.fn(async (key: string) => `https://signed.example.com/${key}`),
  getPublicUrl: vi.fn((key: string) => `https://cdn.example.com/${key}`),
}));

const app = createApp();

function token(role: 'buyer' | 'admin' = 'admin') {
  return signAccessToken({ sub: `${role}-1`, role, email: `${role}@test.local` });
}

async function seedBooks() {
  await Book.create([
    {
      title: 'Modern JavaScript',
      author: 'Asha Rao',
      description: 'JavaScript patterns for production apps',
      category: 'Technology',
      price: 49900,
      coverImageKey: 'covers/js.webp',
      pdfKey: 'pdfs/js.pdf',
      averageRating: 4.5,
      reviewCount: 10,
      totalSales: 12,
      isPublished: true,
    },
    {
      title: 'Business Basics',
      author: 'Mira Shah',
      description: 'Simple finance and operations',
      category: 'Business',
      price: 29900,
      coverImageKey: 'covers/business.webp',
      pdfKey: 'pdfs/business.pdf',
      averageRating: 3,
      isPublished: true,
    },
    {
      title: 'Draft Secrets',
      author: 'Hidden Author',
      description: 'Unpublished manuscript',
      category: 'Technology',
      price: 19900,
      coverImageKey: 'covers/draft.webp',
      pdfKey: 'pdfs/draft.pdf',
      isPublished: false,
    },
  ]);
  await Book.init();
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/books', () => {
  it('paginates and filters published books by category and price', async () => {
    await seedBooks();

    const res = await request(app)
      .get('/api/books')
      .query({ category: 'Technology', minPrice: 40000, maxPrice: 60000, page: 1, limit: 12 });

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(1);
    expect(res.body.books[0].title).toBe('Modern JavaScript');
    expect(res.body.books[0].coverImageUrl).toBe('https://cdn.example.com/covers/js.webp');
    expect(res.body.books.map((book: { title: string }) => book.title)).not.toContain(
      'Draft Secrets',
    );
  });
});

describe('GET /api/books/search', () => {
  it('matches title, author, description and excludes unpublished books', async () => {
    await seedBooks();

    const res = await request(app).get('/api/books/search').query({ q: 'JavaScript', page: 1 });

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(1);
    expect(res.body.books[0].title).toBe('Modern JavaScript');
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('POST /api/admin/books', () => {
  it('creates an unpublished book with mocked cover processing and R2 uploads', async () => {
    const res = await request(app)
      .post('/api/admin/books')
      .set('Authorization', `Bearer ${token('admin')}`)
      .field('title', 'New PDF')
      .field('author', 'Admin Writer')
      .field('description', 'A fresh upload')
      .field('category', 'Science')
      .field('price', '39900')
      .attach('coverImage', Buffer.from('cover'), {
        filename: 'cover.png',
        contentType: 'image/png',
      })
      .attach('pdf', Buffer.from('%PDF-1.4'), {
        filename: 'book.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.book.isPublished).toBe(false);
    expect(res.body.book.coverImageKey).toMatch(/^covers\/.+\.webp$/);
    expect(await Book.countDocuments()).toBe(1);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/admin/books')
      .set('Authorization', `Bearer ${token('admin')}`)
      .field('title', 'Missing fields');

    expect(res.status).toBe(400);
  });

  it('returns 403 for non-admin users', async () => {
    const res = await request(app)
      .post('/api/admin/books')
      .set('Authorization', `Bearer ${token('buyer')}`);

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/admin/books/:id', () => {
  it('soft deletes when orders reference the book', async () => {
    const book = await Book.create({
      title: 'Owned Book',
      author: 'Asha Rao',
      description: 'Purchased already',
      category: 'Technology',
      price: 49900,
      coverImageKey: 'covers/owned.webp',
      pdfKey: 'pdfs/owned.pdf',
      isPublished: true,
    });
    await Order.create({
      buyer: '000000000000000000000001',
      books: [{ book: book._id, price: book.price }],
      totalAmount: book.price,
      razorpayOrderId: 'order_soft',
      status: 'paid',
    });

    const res = await request(app)
      .delete(`/api/admin/books/${book._id.toString()}`)
      .set('Authorization', `Bearer ${token('admin')}`);

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('soft');
    const deleted = await Book.findById(book._id);
    expect(deleted?.isDeleted).toBe(true);
    expect(deleted?.isPublished).toBe(false);
  });

  it('hard deletes and removes R2 files when no orders exist', async () => {
    const { deleteFile } = await import('../../src/services/r2.service.js');
    const book = await Book.create({
      title: 'Draft Book',
      author: 'Asha Rao',
      description: 'No buyers yet',
      category: 'Technology',
      price: 49900,
      coverImageKey: 'covers/draft.webp',
      pdfKey: 'pdfs/draft.pdf',
      samplePdfKey: 'pdfs/samples/draft.pdf',
      isPublished: false,
    });

    const res = await request(app)
      .delete(`/api/admin/books/${book._id.toString()}`)
      .set('Authorization', `Bearer ${token('admin')}`);

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('hard');
    expect(await Book.findById(book._id)).toBeNull();
    expect(deleteFile).toHaveBeenCalledTimes(3);
  });
});
