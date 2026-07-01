import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/app.js';
import { Book } from '../../src/models/Book.model.js';
import { Order } from '../../src/models/Order.model.js';
import { signAccessToken } from '../../src/utils/jwt.util.js';

vi.mock('../../src/services/razorpay.service.js', () => ({
  createRazorpayOrder: vi.fn(async (amount: number) => ({
    id: 'rzp_order_test_123',
    amount,
    currency: 'INR',
  })),
  verifyWebhookSignature: vi.fn(() => true),
  createRefund: vi.fn(async () => ({ id: 'ref_test_123' })),
}));

import * as razorpayService from '../../src/services/razorpay.service.js';

const app = createApp();

// Use a valid ObjectId for buyer — Order.buyer is typed as ObjectId
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

function webhookBody(razorpayOrderId: string, paymentId = 'pay_test_123') {
  return {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: razorpayOrderId,
        },
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(razorpayService.createRazorpayOrder).mockImplementation(async (amount) => ({
    id: 'rzp_order_test_123',
    amount,
    currency: 'INR',
  }));
  vi.mocked(razorpayService.verifyWebhookSignature).mockReturnValue(true);
});

describe('POST /api/orders', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/orders').send({ books: [] });
    expect(res.status).toBe(401);
  });

  it('returns 400 with empty books array', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token()}`)
      .send({ books: [] });
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-existent book', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token()}`)
      .send({ books: [fakeId] });
    expect(res.status).toBe(400);
  });

  it('returns 400 for unpublished book', async () => {
    const book = await seedBook({ isPublished: false });
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token()}`)
      .send({ books: [book._id.toString()] });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid bookId format', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token()}`)
      .send({ books: ['not-an-id'] });
    expect(res.status).toBe(400);
  });

  it('creates a pending order and returns razorpayOrderId', async () => {
    const book = await seedBook();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token()}`)
      .send({ books: [book._id.toString()] });

    expect(res.status).toBe(201);
    expect(res.body.razorpayOrderId).toBe('rzp_order_test_123');
    expect(res.body.amount).toBe(49900);
    expect(res.body.currency).toBe('INR');
    expect(res.body.keyId).toBeDefined();

    const saved = await Order.findOne({ razorpayOrderId: 'rzp_order_test_123' });
    expect(saved?.status).toBe('pending');
    expect(saved?.totalAmount).toBe(49900);
  });

  it('calculates total from DB prices, not client input', async () => {
    const book1 = await seedBook({ price: 29900 });
    const book2 = await seedBook({ title: 'Book 2', price: 19900 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token()}`)
      .send({ books: [book1._id.toString(), book2._id.toString()] });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(49800);
  });
});

describe('POST /api/orders/webhook', () => {
  it('returns 400 when X-Razorpay-Signature header is missing', async () => {
    const body = webhookBody('rzp_order_123');
    const res = await request(app).post('/api/orders/webhook').send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing signature/i);
  });

  it('returns 400 on invalid signature', async () => {
    vi.mocked(razorpayService.verifyWebhookSignature).mockReturnValue(false);
    const body = webhookBody('rzp_order_123');
    const res = await request(app)
      .post('/api/orders/webhook')
      .set('X-Razorpay-Signature', 'tampered_sig')
      .send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid signature/i);
  });

  it('updates order to paid on valid payment.captured event', async () => {
    const book = await seedBook();
    await Order.create({
      buyer: buyerId,
      books: [{ book: book._id, price: book.price }],
      totalAmount: book.price,
      razorpayOrderId: 'rzp_order_pending_456',
      status: 'pending',
    });

    const body = webhookBody('rzp_order_pending_456');
    const res = await request(app)
      .post('/api/orders/webhook')
      .set('X-Razorpay-Signature', 'valid_sig')
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const updated = await Order.findOne({ razorpayOrderId: 'rzp_order_pending_456' });
    expect(updated?.status).toBe('paid');
    expect(updated?.razorpayPaymentId).toBe('pay_test_123');
  });

  it('is idempotent — duplicate webhook returns 200 without changing paid order', async () => {
    const book = await seedBook();
    await Order.create({
      buyer: buyerId,
      books: [{ book: book._id, price: book.price }],
      totalAmount: book.price,
      razorpayOrderId: 'rzp_order_already_paid',
      status: 'paid',
      razorpayPaymentId: 'pay_original_123',
    });

    const body = webhookBody('rzp_order_already_paid', 'pay_duplicate_999');
    const res = await request(app)
      .post('/api/orders/webhook')
      .set('X-Razorpay-Signature', 'valid_sig')
      .send(body);

    expect(res.status).toBe(200);

    const order = await Order.findOne({ razorpayOrderId: 'rzp_order_already_paid' });
    expect(order?.razorpayPaymentId).toBe('pay_original_123');
  });

  it('returns 200 and ignores unknown event types', async () => {
    const body = { event: 'order.paid', payload: {} };
    const res = await request(app)
      .post('/api/orders/webhook')
      .set('X-Razorpay-Signature', 'valid_sig')
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  it('does not require auth — is a public endpoint', async () => {
    const book = await seedBook();
    await Order.create({
      buyer: buyerId,
      books: [{ book: book._id, price: book.price }],
      totalAmount: book.price,
      razorpayOrderId: 'rzp_order_public_test',
      status: 'pending',
    });

    const body = webhookBody('rzp_order_public_test');
    const res = await request(app)
      .post('/api/orders/webhook')
      .send(body); // No Authorization header — should still work

    expect(res.status).not.toBe(401);
  });
});

describe('GET /api/orders', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('returns empty list for user with no orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('returns orders for the authenticated user', async () => {
    const book = await seedBook();
    await Order.create({
      buyer: buyerId,
      books: [{ book: book._id, price: book.price }],
      totalAmount: book.price,
      razorpayOrderId: 'rzp_mine_789',
      status: 'paid',
    });

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].razorpayOrderId).toBe('rzp_mine_789');
    expect(res.body.pagination.total).toBe(1);
  });

  it('does not return other users orders', async () => {
    const book = await seedBook();
    const otherBuyerId = new Types.ObjectId();

    await Order.create({
      buyer: buyerId,
      books: [{ book: book._id, price: book.price }],
      totalAmount: book.price,
      razorpayOrderId: 'rzp_mine_001',
      status: 'paid',
    });
    await Order.create({
      buyer: otherBuyerId,
      books: [{ book: book._id, price: book.price }],
      totalAmount: book.price,
      razorpayOrderId: 'rzp_other_002',
      status: 'paid',
    });

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].razorpayOrderId).toBe('rzp_mine_001');
  });
});
