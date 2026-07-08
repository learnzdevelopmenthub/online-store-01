import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/app.js';
import { Book } from '../../src/models/Book.model.js';
import { Order } from '../../src/models/Order.model.js';
import { StoreSettings } from '../../src/models/StoreSettings.model.js';
import { User } from '../../src/models/User.model.js';
import { signAccessToken } from '../../src/utils/jwt.util.js';
import { hashPassword } from '../../src/utils/password.util.js';

vi.mock('../../src/services/razorpay.service.js', () => ({
  createRazorpayOrder: vi.fn(),
  verifyWebhookSignature: vi.fn(() => true),
  createRefund: vi.fn(async () => ({ id: 'rfnd_test_123' })),
}));

import * as razorpayService from '../../src/services/razorpay.service.js';

const app = createApp();
const adminId = new Types.ObjectId().toString();

function adminToken() {
  return signAccessToken({ sub: adminId, role: 'admin', email: 'admin@test.local' });
}

async function seedBuyer(overrides: Record<string, unknown> = {}) {
  return User.create({
    fullName: 'Buyer One',
    email: `buyer-${new Types.ObjectId().toString()}@test.local`,
    passwordHash: await hashPassword('password123'),
    role: 'buyer',
    isActive: true,
    ...overrides,
  });
}

async function seedBook(overrides: Record<string, unknown> = {}) {
  return Book.create({
    title: 'Admin Book',
    author: 'Author',
    description: 'A book',
    category: 'Technology',
    price: 49900,
    coverImageKey: 'covers/admin.webp',
    pdfKey: 'pdfs/admin.pdf',
    isPublished: true,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('admin dashboard and orders', () => {
  it('aggregates revenue and order counts from paid orders only', async () => {
    const buyer = await seedBuyer();
    const book = await seedBook({ title: 'Revenue Book', price: 20000 });
    await Order.create({
      buyer: buyer._id,
      books: [{ book: book._id, price: 20000 }],
      totalAmount: 20000,
      razorpayOrderId: 'rzp_paid',
      status: 'paid',
    });
    await Order.create({
      buyer: buyer._id,
      books: [{ book: book._id, price: 20000 }],
      totalAmount: 20000,
      razorpayOrderId: 'rzp_refunded',
      status: 'refunded',
    });

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.totalRevenue).toBe(20000);
    expect(res.body.stats.totalOrders).toBe(2);
    expect(res.body.topBooks[0].title).toBe('Revenue Book');
    expect(res.body.recentOrders).toHaveLength(2);
  });

  it('filters orders by status, date range, and buyer email', async () => {
    const buyer = await seedBuyer({ email: 'match@test.local' });
    const otherBuyer = await seedBuyer({ email: 'other@test.local' });
    const book = await seedBook();
    const inside = await Order.create({
      buyer: buyer._id,
      books: [{ book: book._id, price: 10000 }],
      totalAmount: 10000,
      razorpayOrderId: 'rzp_inside',
      status: 'paid',
    });
    await Order.create({
      buyer: otherBuyer._id,
      books: [{ book: book._id, price: 10000 }],
      totalAmount: 10000,
      razorpayOrderId: 'rzp_other',
      status: 'pending',
    });

    const day = inside.createdAt.toISOString().slice(0, 10);
    const res = await request(app)
      .get('/api/admin/orders')
      .query({ status: 'paid', search: 'match@', from: day, to: day })
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].razorpayOrderId).toBe('rzp_inside');
    expect(res.body.pagination.total).toBe(1);
  });

  it('refunds a paid order and blocks further library downloads', async () => {
    const buyer = await seedBuyer();
    const book = await seedBook();
    const order = await Order.create({
      buyer: buyer._id,
      books: [{ book: book._id, price: book.price, downloadCount: 1, downloadLimit: 5 }],
      totalAmount: book.price,
      razorpayOrderId: 'rzp_refund_me',
      razorpayPaymentId: 'pay_refund_me',
      status: 'paid',
    });

    const refundRes = await request(app)
      .post(`/api/admin/orders/${order._id.toString()}/refund`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({});

    expect(refundRes.status).toBe(200);
    expect(razorpayService.createRefund).toHaveBeenCalledWith('pay_refund_me', book.price);

    const updated = await Order.findById(order._id);
    expect(updated?.status).toBe('refunded');
    expect(updated?.books[0]?.downloadCount).toBe(5);

    const buyerToken = signAccessToken({
      sub: buyer._id.toString(),
      role: 'buyer',
      email: buyer.email,
    });
    const downloadRes = await request(app)
      .get(`/api/library/${book._id.toString()}/download`)
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(downloadRes.status).toBe(404);
  });
});

describe('admin customers and settings', () => {
  it('suspends a buyer and blocks their next login with the support message', async () => {
    const buyer = await seedBuyer({ email: 'suspend@test.local' });

    const suspendRes = await request(app)
      .patch(`/api/admin/customers/${buyer._id.toString()}/suspend`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ isActive: false });
    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.customer.isActive).toBe(false);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'suspend@test.local', password: 'password123' });
    expect(loginRes.status).toBe(403);
    expect(loginRes.body.error).toBe('Your account has been suspended. Contact support.');
  });

  it('persists store settings updates', async () => {
    const res = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({
        storeName: 'GetzMyBook',
        contactEmail: 'support@test.local',
        emailTemplate: 'Your digital order is ready.',
      });

    expect(res.status).toBe(200);
    expect(res.body.settings.storeName).toBe('GetzMyBook');

    const saved = await StoreSettings.findOne();
    expect(saved?.contactEmail).toBe('support@test.local');
    expect(saved?.emailTemplate).toBe('Your digital order is ready.');
  });
});
