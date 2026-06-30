import type { RequestHandler } from 'express';
import { isValidObjectId, Types } from 'mongoose';

import type { BookDoc } from '../models/Book.model.js';
import { Book } from '../models/Book.model.js';
import { Order } from '../models/Order.model.js';
import { Wishlist } from '../models/Wishlist.model.js';
import { getPublicUrl } from '../services/r2.service.js';
import { AppError } from '../utils/AppError.js';

function serializeBook(book: BookDoc) {
  const json = book.toJSON() as unknown as Record<string, unknown>;
  return {
    ...json,
    coverImageUrl: getPublicUrl(book.coverImageKey),
    pdfKey: undefined,
  };
}

function requireValidBookId(id: unknown): string {
  if (typeof id !== 'string' || !isValidObjectId(id)) {
    throw new AppError(404, 'Book not found');
  }
  return id;
}

function populatedBooks(wishlist: { books: unknown[] }): BookDoc[] {
  return wishlist.books as BookDoc[];
}

export const getWishlist: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const wishlist = await Wishlist.findOne({ userId }).populate('books');
  if (!wishlist) {
    res.status(200).json({ books: [] });
    return;
  }
  res.status(200).json({ books: populatedBooks(wishlist).map(serializeBook) });
};

export const addToWishlist: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookId = requireValidBookId(req.params.bookId);

  const book = await Book.findOne({ _id: bookId, isPublished: true, isDeleted: false });
  if (!book) throw new AppError(404, 'Book not found');

  // Guard: Order.buyer is ObjectId; skip the check if userId is not a valid ObjectId string.
  if (isValidObjectId(userId)) {
    const owned = await Order.exists({ buyer: userId, 'books.book': bookId, status: 'paid' });
    if (owned) throw new AppError(409, 'You already own this book');
  }

  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, books: [new Types.ObjectId(bookId)] });
  } else {
    const alreadyIn = wishlist.books.some((id) => id.toString() === bookId);
    if (alreadyIn) throw new AppError(409, 'Book is already in your wishlist');
    wishlist.books.push(new Types.ObjectId(bookId));
    await wishlist.save();
  }

  await wishlist.populate('books');
  res.status(200).json({ books: populatedBooks(wishlist).map(serializeBook) });
};

export const removeFromWishlist: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookId = requireValidBookId(req.params.bookId);

  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    res.status(200).json({ books: [] });
    return;
  }

  wishlist.books = wishlist.books.filter((id) => id.toString() !== bookId);
  await wishlist.save();

  await wishlist.populate('books');
  res.status(200).json({ books: populatedBooks(wishlist).map(serializeBook) });
};
