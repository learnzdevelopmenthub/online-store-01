import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';

import { env } from '../config/env.js';
import { Book } from '../models/Book.model.js';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { createOrderSchema } from '../schemas/orders.schema.js';
import { sendOrderConfirmation } from '../services/email.service.js';
import { createRazorpayOrder, verifyWebhookSignature } from '../services/razorpay.service.js';
import { AppError } from '../utils/AppError.js';

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return parsed;
}

export const createOrder: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors[0]?.message ?? 'Invalid input');
  }

  const { books: bookIds } = parsed.data;

  for (const id of bookIds) {
    if (!isValidObjectId(id)) throw new AppError(400, `Invalid book id: ${id}`);
  }

  // Fetch from DB — never trust client-sent prices
  const books = await Book.find({ _id: { $in: bookIds }, isPublished: true, isDeleted: false });
  if (books.length !== bookIds.length) {
    throw new AppError(400, 'One or more books are unavailable or not found');
  }

  const totalAmount = books.reduce((sum, book) => sum + book.price, 0);
  const rzpOrder = await createRazorpayOrder(totalAmount);

  const order = await Order.create({
    buyer: userId,
    books: books.map((book) => ({
      book: book._id,
      price: book.price,
      downloadCount: 0,
      downloadLimit: 5,
    })),
    totalAmount,
    razorpayOrderId: rzpOrder.id,
    status: 'pending',
  });

  res.status(201).json({
    orderId: order._id,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    keyId: env.RAZORPAY_KEY_ID ?? '',
  });
};

interface WebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
  };
}

export const webhookHandler: RequestHandler = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (typeof signature !== 'string') {
    res.status(400).json({ message: 'Missing signature' });
    return;
  }

  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    res.status(400).json({ message: 'Raw body not available' });
    return;
  }

  const isValid = verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    res.status(400).json({ message: 'Invalid signature' });
    return;
  }

  const event = req.body as WebhookPayload;

  if (event.event !== 'payment.captured') {
    res.status(200).json({ received: true });
    return;
  }

  const paymentId = event.payload?.payment?.entity?.id;
  const razorpayOrderId = event.payload?.payment?.entity?.order_id;

  if (!razorpayOrderId) {
    res.status(400).json({ message: 'Missing order_id in payload' });
    return;
  }

  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  // Idempotency guard — duplicate webhook returns 200 with no side effects
  if (order.status === 'paid') {
    res.status(200).json({ received: true });
    return;
  }

  order.status = 'paid';
  order.razorpayPaymentId = paymentId ?? null;
  await order.save();

  const [buyer, books] = await Promise.all([
    User.findById(order.buyer).select('fullName email'),
    Book.find({ _id: { $in: order.books.map((line) => line.book) } }).select('title'),
  ]);

  if (buyer) {
    const booksById = new Map(books.map((book) => [book._id.toString(), book]));
    const emailBooks = order.books
      .map((line) => {
        const book = booksById.get(line.book.toString());
        return book ? { title: book.title, price: line.price } : null;
      })
      .filter((book): book is { title: string; price: number } => book !== null);

    void sendOrderConfirmation(buyer, order.toObject(), emailBooks).catch((error) => {
      console.error('orders: failed to send confirmation email', error);
    });
  }

  res.status(200).json({ received: true });
};

export const getOrders: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 10);

  const [orders, total] = await Promise.all([
    Order.find({ buyer: userId })
      .populate('books.book')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments({ buyer: userId }),
  ]);

  res.status(200).json({
    orders: orders.map((o) => o.toJSON()),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};
