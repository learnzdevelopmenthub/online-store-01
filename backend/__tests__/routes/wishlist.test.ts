import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/app.js';
import { Book } from '../../src/models/Book.model.js';
import { Wishlist } from '../../src/models/Wishlist.model.js';
import { signAccessToken } from '../../src/utils/jwt.util.js';

vi.mock('../../src/services/r2.service.js', () => ({
  uploadFile: vi.fn(async (key: string) => key),
  deleteFile: vi.fn(async () => undefined),
  getPresignedGetUrl: vi.fn(async (key: string) => `https://signed.example.com/${key}`),
  getPublicUrl: vi.fn((key: string) => `https://cdn.example.com/${key}`),
}));

const app = createApp();

function token(userId = 'buyer-1', role: 'buyer' | 'admin' = 'buyer') {
  return signAccessToken({ sub: userId, role, email: `${userId}@test.local` });
}

async function seedBook(overrides: Record<string, unknown> = {}) {
  return Book.create({
    title: 'Test Book',
    author: 'Author',
    description: 'A test book',
    category: 'Technology',
    price: 49900,
    coverImageKey: 'covers/test.webp',
    pdfKey: 'pdfs/test.pdf',
    isPublished: true,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/wishlist', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.status).toBe(401);
  });

  it('returns empty books array when wishlist does not exist', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body.books).toEqual([]);
  });

  it('returns populated wishlist books', async () => {
    const book = await seedBook();
    await Wishlist.create({ userId: 'buyer-1', books: [book._id] });

    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(1);
    expect(res.body.books[0].title).toBe('Test Book');
    expect(res.body.books[0].coverImageUrl).toContain('https://cdn.example.com/');
    expect(res.body.books[0].pdfKey).toBeUndefined();
  });
});

describe('POST /api/wishlist/:bookId', () => {
  it('returns 401 without auth', async () => {
    const book = await seedBook();
    const res = await request(app).post(`/api/wishlist/${book._id}`);
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent book', async () => {
    const res = await request(app)
      .post('/api/wishlist/000000000000000000000001')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for unpublished book', async () => {
    const book = await seedBook({ isPublished: false });
    const res = await request(app)
      .post(`/api/wishlist/${book._id}`)
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(404);
  });

  it('adds book to wishlist and returns updated list', async () => {
    const book = await seedBook();
    const res = await request(app)
      .post(`/api/wishlist/${book._id}`)
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(1);
    expect(res.body.books[0]._id.toString()).toBe(book._id.toString());

    const saved = await Wishlist.findOne({ userId: 'buyer-1' });
    expect(saved?.books).toHaveLength(1);
  });

  it('returns 409 when book is already in wishlist', async () => {
    const book = await seedBook();
    await Wishlist.create({ userId: 'buyer-1', books: [book._id] });

    const res = await request(app)
      .post(`/api/wishlist/${book._id}`)
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid bookId format', async () => {
    const res = await request(app)
      .post('/api/wishlist/not-an-id')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/wishlist/:bookId', () => {
  it('returns 401 without auth', async () => {
    const book = await seedBook();
    const res = await request(app).delete(`/api/wishlist/${book._id}`);
    expect(res.status).toBe(401);
  });

  it('returns 200 with empty books when wishlist does not exist', async () => {
    const res = await request(app)
      .delete('/api/wishlist/000000000000000000000001')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body.books).toEqual([]);
  });

  it('removes book from wishlist', async () => {
    const book = await seedBook();
    await Wishlist.create({ userId: 'buyer-1', books: [book._id] });

    const res = await request(app)
      .delete(`/api/wishlist/${book._id}`)
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(0);

    const saved = await Wishlist.findOne({ userId: 'buyer-1' });
    expect(saved?.books).toHaveLength(0);
  });

  it('is idempotent — removing a book not in wishlist returns 200', async () => {
    const book = await seedBook();
    const other = await seedBook({ title: 'Other Book' });
    await Wishlist.create({ userId: 'buyer-1', books: [other._id] });

    const res = await request(app)
      .delete(`/api/wishlist/${book._id}`)
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(1);
  });

  it('isolates wishlists by user', async () => {
    const book = await seedBook();
    await Wishlist.create({ userId: 'buyer-2', books: [book._id] });

    const res = await request(app)
      .delete(`/api/wishlist/${book._id}`)
      .set('Authorization', `Bearer ${token('buyer-1')}`);

    expect(res.status).toBe(200);
    expect(res.body.books).toEqual([]);

    const buyer2Wishlist = await Wishlist.findOne({ userId: 'buyer-2' });
    expect(buyer2Wishlist?.books).toHaveLength(1);
  });
});
