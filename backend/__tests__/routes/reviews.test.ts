import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/app.js';
import { Book } from '../../src/models/Book.model.js';
import { Order } from '../../src/models/Order.model.js';
import { Review } from '../../src/models/Review.model.js';
import { signAccessToken } from '../../src/utils/jwt.util.js';

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

async function grantOwnership(bookId: Types.ObjectId, buyer = buyerId) {
  return Order.create({
    buyer,
    books: [{ book: bookId, price: 49900 }],
    totalAmount: 49900,
    razorpayOrderId: `rzp_${new Types.ObjectId().toString()}`,
    status: 'paid',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/reviews/:bookId', () => {
  it('returns 401 without auth', async () => {
    const book = await seedBook();
    const res = await request(app).post(`/api/reviews/${book._id.toString()}`).send({ rating: 5 });
    expect(res.status).toBe(401);
  });

  it('returns 403 when the buyer has not purchased the book', async () => {
    const book = await seedBook();
    const res = await request(app)
      .post(`/api/reviews/${book._id.toString()}`)
      .set('Authorization', `Bearer ${token()}`)
      .send({ rating: 5, text: 'Great' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for an out-of-range rating', async () => {
    const book = await seedBook();
    await grantOwnership(book._id);
    const res = await request(app)
      .post(`/api/reviews/${book._id.toString()}`)
      .set('Authorization', `Bearer ${token()}`)
      .send({ rating: 9 });
    expect(res.status).toBe(400);
  });

  it('creates a review and recalculates the book rating', async () => {
    const book = await seedBook();
    await grantOwnership(book._id);

    const res = await request(app)
      .post(`/api/reviews/${book._id.toString()}`)
      .set('Authorization', `Bearer ${token()}`)
      .send({ rating: 4, text: 'Solid read' });

    expect(res.status).toBe(200);
    expect(res.body.review.rating).toBe(4);

    const updated = await Book.findById(book._id);
    expect(updated?.averageRating).toBe(4);
    expect(updated?.reviewCount).toBe(1);
  });

  it('replaces an existing review on re-submit (no duplicates)', async () => {
    const book = await seedBook();
    await grantOwnership(book._id);
    const url = `/api/reviews/${book._id.toString()}`;

    await request(app).post(url).set('Authorization', `Bearer ${token()}`).send({ rating: 2 });
    await request(app).post(url).set('Authorization', `Bearer ${token()}`).send({ rating: 5 });

    const count = await Review.countDocuments({ bookId: book._id, buyerId });
    expect(count).toBe(1);

    const updated = await Book.findById(book._id);
    expect(updated?.averageRating).toBe(5);
    expect(updated?.reviewCount).toBe(1);
  });
});

describe('GET /api/reviews/:bookId', () => {
  it('returns approved, non-flagged reviews (public, no auth)', async () => {
    const book = await seedBook();
    await Review.create({ bookId: book._id, buyerId, rating: 5, text: 'Loved it' });

    const res = await request(app).get(`/api/reviews/${book._id.toString()}`);
    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].rating).toBe(5);
  });

  it('hides flagged reviews from the public list', async () => {
    const book = await seedBook();
    await Review.create({ bookId: book._id, buyerId, rating: 5, isFlagged: true });

    const res = await request(app).get(`/api/reviews/${book._id.toString()}`);
    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(0);
  });
});

describe('POST /api/reviews/:reviewId/flag', () => {
  it('flags a review so it disappears from the public list', async () => {
    const book = await seedBook();
    const review = await Review.create({ bookId: book._id, buyerId, rating: 5 });

    const flagRes = await request(app)
      .post(`/api/reviews/${review._id.toString()}/flag`)
      .set('Authorization', `Bearer ${token()}`);
    expect(flagRes.status).toBe(200);

    const publicRes = await request(app).get(`/api/reviews/${book._id.toString()}`);
    expect(publicRes.body.reviews).toHaveLength(0);

    const flagged = await Review.findById(review._id);
    expect(flagged?.isFlagged).toBe(true);
  });
});

describe('admin review moderation', () => {
  const adminId = new Types.ObjectId().toString();

  it('requires admin for the flagged queue', async () => {
    const res = await request(app)
      .get('/api/admin/reviews/flagged')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(403);
  });

  it('lists flagged reviews for an admin', async () => {
    const book = await seedBook();
    await Review.create({ bookId: book._id, buyerId, rating: 3, isFlagged: true });

    const res = await request(app)
      .get('/api/admin/reviews/flagged')
      .set('Authorization', `Bearer ${token(adminId, 'admin')}`);
    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].bookTitle).toBe('Test Book');
  });

  it('approve restores a flagged review to the public list', async () => {
    const book = await seedBook();
    const review = await Review.create({
      bookId: book._id,
      buyerId,
      rating: 4,
      isFlagged: true,
      isApproved: true,
    });

    const res = await request(app)
      .patch(`/api/admin/reviews/${review._id.toString()}`)
      .set('Authorization', `Bearer ${token(adminId, 'admin')}`)
      .send({ action: 'approve' });
    expect(res.status).toBe(200);

    const publicRes = await request(app).get(`/api/reviews/${book._id.toString()}`);
    expect(publicRes.body.reviews).toHaveLength(1);

    const updated = await Book.findById(book._id);
    expect(updated?.reviewCount).toBe(1);
  });

  it('remove deletes the review and recalculates the rating', async () => {
    const book = await seedBook({ averageRating: 4, reviewCount: 1 });
    const review = await Review.create({
      bookId: book._id,
      buyerId,
      rating: 4,
      isFlagged: true,
    });

    const res = await request(app)
      .patch(`/api/admin/reviews/${review._id.toString()}`)
      .set('Authorization', `Bearer ${token(adminId, 'admin')}`)
      .send({ action: 'remove' });
    expect(res.status).toBe(200);

    expect(await Review.findById(review._id)).toBeNull();
    const updated = await Book.findById(book._id);
    expect(updated?.reviewCount).toBe(0);
    expect(updated?.averageRating).toBe(0);
  });
});
