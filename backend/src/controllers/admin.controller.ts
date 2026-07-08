import type { RequestHandler } from 'express';
import { isValidObjectId, Types } from 'mongoose';

import { Order, type OrderStatus } from '../models/Order.model.js';
import { StoreSettings } from '../models/StoreSettings.model.js';
import { User } from '../models/User.model.js';
import type { SuspendCustomerInput, UpdateSettingsInput } from '../schemas/admin.schema.js';
import { createRefund } from '../services/razorpay.service.js';
import { getStoreSettings } from '../services/settings.service.js';
import { AppError } from '../utils/AppError.js';

const ORDER_LIMIT = 20;
const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'failed', 'refunded'];

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return parsed;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function dateFilter(from: unknown, to: unknown) {
  const createdAt: Record<string, Date> = {};
  if (typeof from === 'string' && from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) createdAt.$gte = fromDate;
  }
  if (typeof to === 'string' && to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        toDate.setDate(toDate.getDate() + 1);
        createdAt.$lt = toDate;
      } else {
        createdAt.$lte = toDate;
      }
    }
  }
  return Object.keys(createdAt).length ? { createdAt } : {};
}

function todayBounds() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function monthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

function serializeOrder(order: unknown) {
  const json = (order as { toJSON: () => Record<string, unknown> }).toJSON();
  return json;
}

export const getDashboard: RequestHandler = async (_req, res) => {
  const { start: todayStart, end: todayEnd } = todayBounds();
  const { start: monthStart, end: monthEnd } = monthBounds();

  const [
    paidStats,
    todayPaidStats,
    monthPaidStats,
    totalOrders,
    todayOrders,
    topBooks,
    recentOrders,
  ] = await Promise.all([
    Order.aggregate<{ totalRevenue: number }>([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate<{ totalRevenue: number }>([
      { $match: { status: 'paid', createdAt: { $gte: todayStart, $lt: todayEnd } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate<{ totalRevenue: number }>([
      { $match: { status: 'paid', createdAt: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
    Order.aggregate<{ bookId: Types.ObjectId; title: string; revenue: number; sales: number }>([
      { $match: { status: 'paid' } },
      { $unwind: '$books' },
      { $group: { _id: '$books.book', revenue: { $sum: '$books.price' }, sales: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { _id: 0, bookId: '$_id', title: '$book.title', revenue: 1, sales: 1 } },
    ]),
    Order.find()
      .populate('buyer', 'fullName email')
      .populate('books.book', 'title author')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  res.status(200).json({
    stats: {
      totalRevenue: paidStats[0]?.totalRevenue ?? 0,
      todayRevenue: todayPaidStats[0]?.totalRevenue ?? 0,
      monthRevenue: monthPaidStats[0]?.totalRevenue ?? 0,
      totalOrders,
      todayOrders,
    },
    topBooks: topBooks.map((book) => ({ ...book, bookId: book.bookId.toString() })),
    recentOrders: recentOrders.map(serializeOrder),
  });
};

export const listAdminOrders: RequestHandler = async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, ORDER_LIMIT);
  const query: Record<string, unknown> = { ...dateFilter(req.query.from, req.query.to) };

  if (typeof req.query.status === 'string' && req.query.status) {
    if (!ORDER_STATUSES.includes(req.query.status as OrderStatus)) {
      throw new AppError(400, 'Invalid order status');
    }
    query.status = req.query.status;
  }

  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    const buyers = await User.find({ role: 'buyer', email: regex }).select('_id');
    query.buyer = { $in: buyers.map((buyer) => buyer._id) };
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('buyer', 'fullName email')
      .populate('books.book', 'title author coverImageKey')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    orders: orders.map(serializeOrder),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const getAdminOrder: RequestHandler = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new AppError(404, 'Order not found');

  const order = await Order.findById(id)
    .populate('buyer', 'fullName email isActive createdAt')
    .populate('books.book', 'title author coverImageKey pdfKey');
  if (!order) throw new AppError(404, 'Order not found');

  res.status(200).json({ order: serializeOrder(order) });
};

export const refundOrder: RequestHandler = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new AppError(404, 'Order not found');

  const order = await Order.findById(id);
  if (!order) throw new AppError(404, 'Order not found');
  if (order.status !== 'paid') throw new AppError(400, 'Only paid orders can be refunded');
  if (!order.razorpayPaymentId) throw new AppError(400, 'Order has no captured payment id');

  await createRefund(order.razorpayPaymentId, order.totalAmount);

  order.status = 'refunded';
  order.books.forEach((line) => {
    line.downloadCount = line.downloadLimit ?? 5;
  });
  await order.save();

  res.status(200).json({ order: order.toJSON() });
};

export const listCustomers: RequestHandler = async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, ORDER_LIMIT);
  const match: Record<string, unknown> = { role: 'buyer' };

  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    match.$or = [{ fullName: regex }, { email: regex }];
  }

  const [customers, total] = await Promise.all([
    User.aggregate<{
      _id: Types.ObjectId;
      fullName: string;
      email: string;
      isActive: boolean;
      createdAt: Date;
      totalOrders: number;
      totalSpend: number;
    }>([
      { $match: match },
      {
        $lookup: {
          from: 'orders',
          let: { buyerId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$buyer', '$$buyerId'] }, status: 'paid' } },
            {
              $group: { _id: null, totalOrders: { $sum: 1 }, totalSpend: { $sum: '$totalAmount' } },
            },
          ],
          as: 'orderStats',
        },
      },
      {
        $addFields: {
          totalOrders: { $ifNull: [{ $first: '$orderStats.totalOrders' }, 0] },
          totalSpend: { $ifNull: [{ $first: '$orderStats.totalSpend' }, 0] },
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          isActive: 1,
          createdAt: 1,
          totalOrders: 1,
          totalSpend: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]),
    User.countDocuments(match),
  ]);

  res.status(200).json({
    customers: customers.map((customer) => ({ ...customer, _id: customer._id.toString() })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const getCustomer: RequestHandler = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new AppError(404, 'Customer not found');

  const customer = await User.findOne({ _id: id, role: 'buyer' });
  if (!customer) throw new AppError(404, 'Customer not found');

  const orders = await Order.find({ buyer: id })
    .populate('books.book', 'title author')
    .sort({ createdAt: -1 });
  const paidOrders = orders.filter((order) => order.status === 'paid');

  res.status(200).json({
    customer: {
      ...customer.toJSON(),
      totalOrders: paidOrders.length,
      totalSpend: paidOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      orders: orders.map(serializeOrder),
    },
  });
};

export const suspendCustomer: RequestHandler = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new AppError(404, 'Customer not found');

  const { isActive } = req.body as SuspendCustomerInput;
  const customer = await User.findOneAndUpdate(
    { _id: id, role: 'buyer' },
    { isActive, refreshToken: isActive ? undefined : null },
    { returnDocument: 'after' },
  );
  if (!customer) throw new AppError(404, 'Customer not found');

  res.status(200).json({ customer });
};

export const getSettings: RequestHandler = async (_req, res) => {
  const settings = await getStoreSettings();
  res.status(200).json({ settings });
};

export const updateSettings: RequestHandler = async (req, res) => {
  const input = req.body as UpdateSettingsInput;
  const current = await getStoreSettings();

  const settings = await StoreSettings.findByIdAndUpdate(current._id, input, {
    returnDocument: 'after',
    runValidators: true,
  });
  res.status(200).json({ settings });
};
