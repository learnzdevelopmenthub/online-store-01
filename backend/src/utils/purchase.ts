import { isValidObjectId } from 'mongoose';

import { Order } from '../models/Order.model.js';

/**
 * True when the user has a `paid` order containing the given book.
 * Shared ownership gate for the library (M9) and review submission (M10).
 */
export async function hasPurchased(userId: string, bookId: string): Promise<boolean> {
  if (!isValidObjectId(userId) || !isValidObjectId(bookId)) return false;
  const owned = await Order.exists({ buyer: userId, 'books.book': bookId, status: 'paid' });
  return Boolean(owned);
}
