import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/app.js';
import { Book } from '../../src/models/Book.model.js';
import { Order } from '../../src/models/Order.model.js';
import { signAccessToken } from '../../src/utils/jwt.util.js';

vi.mock('../../src/services/r2.service.js', () => ({
  getPresignedGetUrl: vi.fn(async () => 'https://signed.example/pdf?token=abc'),
  getPublicUrl: vi.fn((key: string) => `https://cdn.example/${key}`),
}));

const app = createApp();

const buyerId = new Types.ObjectId();

function token(userId = buyerId.toString(), role: 'buyer' | 'admin' = 'buyer') {
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

async function seedPaidOrder(
  bookId: Types.ObjectId,
  overrides: { buyer?: Types.ObjectId; downloadCount?: number; razorpayOrderId?: string } = {},
) {
  return Order.create({
    buyer: overrides.buyer ?? buyerId,
    books: [{ book: bookId, price: 49900, downloadCount: overrides.downloadCount ?? 0, downloadLimit: 5 }],
    totalAmount: 49900,
    razorpayOrderId: overrides.razorpayOrderId ?? `rzp_${new Types.ObjectId().toString()}`,
    status: 'paid',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/library', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/library');
    expect(res.status).toBe(401);
  });

  it('returns empty list for a user with no paid orders', async () => {
    const res = await request(app).get('/api/library').set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body.books).toEqual([]);
  });

  it('returns only books from the requesting user paid orders', async () => {
    const mine = await seedBook({ title: 'Mine' });
    const theirs = await seedBook({ title: 'Theirs' });
    await seedPaidOrder(mine._id);
    await seedPaidOrder(theirs._id, { buyer: new Types.ObjectId() });

    const res = await request(app).get('/api/library').set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(1);
    expect(res.body.books[0].book.title).toBe('Mine');
    expect(res.body.books[0].book.pdfKey).toBeUndefined();
    expect(res.body.books[0].downloadLimit).toBe(5);
  });

  it('excludes books from pending (unpaid) orders', async () => {
    const book = await seedBook();
    await Order.create({
      buyer: buyerId,
      books: [{ book: book._id, price: 49900 }],
      totalAmount: 49900,
      razorpayOrderId: 'rzp_pending_1',
      status: 'pending',
    });

    const res = await request(app).get('/api/library').set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body.books).toEqual([]);
  });
});

describe('GET /api/library/:bookId/download', () => {
  it('returns 401 without auth', async () => {
    const book = await seedBook();
    const res = await request(app).get(`/api/library/${book._id.toString()}/download`);
    expect(res.status).toBe(401);
  });

  it('returns a presigned url and increments downloadCount', async () => {
    const book = await seedBook();
    await seedPaidOrder(book._id);

    const res = await request(app)
      .get(`/api/library/${book._id.toString()}/download`)
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.url).toBe('https://signed.example/pdf?token=abc');
    expect(res.body.downloadCount).toBe(1);

    const order = await Order.findOne({ buyer: buyerId });
    expect(order?.books[0]?.downloadCount).toBe(1);
  });

  it('allows the 5th download but blocks the 6th with 403', async () => {
    const book = await seedBook();
    await seedPaidOrder(book._id, { downloadCount: 4 });

    const fifth = await request(app)
      .get(`/api/library/${book._id.toString()}/download`)
      .set('Authorization', `Bearer ${token()}`);
    expect(fifth.status).toBe(200);
    expect(fifth.body.downloadCount).toBe(5);

    const sixth = await request(app)
      .get(`/api/library/${book._id.toString()}/download`)
      .set('Authorization', `Bearer ${token()}`);
    expect(sixth.status).toBe(403);
    expect(sixth.body.error).toMatch(/download limit reached/i);
  });

  it('returns 404 for a book not in the user library', async () => {
    const book = await seedBook();
    const res = await request(app)
      .get(`/api/library/${book._id.toString()}/download`)
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(404);
  });

  it('does not let a buyer download another buyer book', async () => {
    const book = await seedBook();
    await seedPaidOrder(book._id, { buyer: new Types.ObjectId() });

    const res = await request(app)
      .get(`/api/library/${book._id.toString()}/download`)
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(404);
  });
});
