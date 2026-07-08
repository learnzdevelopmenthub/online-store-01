import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';

import type { BookDoc } from '../models/Book.model.js';
import { Book } from '../models/Book.model.js';
import { Order } from '../models/Order.model.js';
import { getPresignedGetUrl, getPublicUrl } from '../services/r2.service.js';
import { AppError } from '../utils/AppError.js';

const DOWNLOAD_URL_TTL_SECONDS = 900; // 15 minutes

/** Serialize a book for the library — public cover URL, private pdfKey stripped. */
function serializeBook(book: BookDoc) {
  const json = book.toJSON() as unknown as Record<string, unknown>;
  return {
    ...json,
    coverImageUrl: getPublicUrl(book.coverImageKey),
    pdfKey: undefined,
  };
}

/** GET /api/library — every book from the buyer's paid orders, de-duped by book. */
export const getLibrary: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const orders = await Order.find({ buyer: userId, status: 'paid' })
    .populate('books.book')
    .sort({ createdAt: -1 });

  const seen = new Set<string>();
  const books = [];

  for (const order of orders) {
    for (const line of order.books) {
      const book = line.book as unknown as BookDoc | null;
      if (!book?._id) continue;
      const bookId = book._id.toString();
      if (seen.has(bookId)) continue;
      seen.add(bookId);
      books.push({
        book: serializeBook(book),
        downloadCount: line.downloadCount ?? 0,
        downloadLimit: line.downloadLimit ?? 5,
        orderId: order._id,
      });
    }
  }

  res.status(200).json({ books });
};

/**
 * GET /api/library/:bookId/download — returns a time-limited presigned R2 URL
 * for a purchased book, enforcing the per-order download limit. The PDF itself
 * is never served through the backend.
 */
export const getDownloadUrl: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { bookId } = req.params;

  if (!isValidObjectId(bookId)) throw new AppError(404, 'Book not found in your library');

  const order = await Order.findOne({ buyer: userId, status: 'paid', 'books.book': bookId });
  if (!order) throw new AppError(404, 'Book not found in your library');

  const line = order.books.find((entry) => entry.book.toString() === bookId);
  if (!line) throw new AppError(404, 'Book not found in your library');

  const limit = line.downloadLimit ?? 5;
  const count = line.downloadCount ?? 0;
  if (count >= limit) {
    throw new AppError(403, 'Download limit reached. Contact support.');
  }

  const book = await Book.findById(bookId);
  if (!book) throw new AppError(404, 'Book not found');

  // Presign BEFORE incrementing — a failed presign must not burn a download.
  const url = await getPresignedGetUrl(book.pdfKey, DOWNLOAD_URL_TTL_SECONDS, 'private');

  // Atomic positional increment so concurrent clicks cannot exceed the limit.
  await Order.updateOne(
    { _id: order._id, 'books.book': bookId },
    { $inc: { 'books.$.downloadCount': 1 } },
  );

  res.status(200).json({ url, downloadCount: count + 1, downloadLimit: limit });
};
