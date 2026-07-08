import type { RequestHandler } from 'express';
import { isValidObjectId, Types } from 'mongoose';

import { Book } from '../models/Book.model.js';
import { Review } from '../models/Review.model.js';
import { moderateReviewSchema, submitReviewSchema } from '../schemas/reviews.schema.js';
import { AppError } from '../utils/AppError.js';
import { hasPurchased } from '../utils/purchase.js';

/** Narrow a route param to a valid ObjectId string, or fail with 404. */
function requireObjectIdParam(value: unknown, message: string): string {
  if (typeof value !== 'string' || !isValidObjectId(value)) throw new AppError(404, message);
  return value;
}

/** Recompute a book's averageRating + reviewCount from its visible reviews. */
async function recalcBookRating(bookId: string): Promise<void> {
  const [agg] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { bookId: new Types.ObjectId(bookId), isApproved: true, isFlagged: false } },
    { $group: { _id: '$bookId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const averageRating = agg ? Math.round(agg.avg * 10) / 10 : 0;
  const reviewCount = agg ? agg.count : 0;
  await Book.updateOne({ _id: bookId }, { $set: { averageRating, reviewCount } });
}

function serializePublicReview(review: unknown) {
  const json = (review as { toJSON: () => Record<string, unknown> }).toJSON();
  const buyer = json.buyerId as { fullName?: string } | null;
  return {
    _id: json._id,
    rating: json.rating,
    text: (json.text as string | null) ?? '',
    buyerName: buyer?.fullName ?? 'Anonymous',
    createdAt: json.createdAt,
  };
}

function serializeFlaggedReview(review: unknown) {
  const json = (review as { toJSON: () => Record<string, unknown> }).toJSON();
  const book = json.bookId as { _id?: unknown; title?: string } | null;
  const buyer = json.buyerId as { fullName?: string } | null;
  return {
    _id: json._id,
    rating: json.rating,
    text: (json.text as string | null) ?? '',
    bookId: book?._id ?? null,
    bookTitle: book?.title ?? 'Unknown book',
    buyerName: buyer?.fullName ?? 'Anonymous',
    createdAt: json.createdAt,
  };
}

/** POST /api/reviews/:bookId — purchase-gated upsert; recalculates book rating. */
export const submitReview: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookId = requireObjectIdParam(req.params.bookId, 'Book not found');

  const parsed = submitReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors[0]?.message ?? 'Invalid input');
  }

  const book = await Book.findOne({ _id: bookId, isDeleted: false });
  if (!book) throw new AppError(404, 'Book not found');

  const owned = await hasPurchased(userId, bookId);
  if (!owned) throw new AppError(403, 'You can only review books you have purchased');

  const review = await Review.findOneAndUpdate(
    { bookId, buyerId: userId },
    {
      $set: {
        rating: parsed.data.rating,
        text: parsed.data.text ?? null,
        isApproved: true,
        isFlagged: false,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );

  await recalcBookRating(bookId);

  res.status(200).json({ review: review!.toJSON() });
};

/** GET /api/reviews/:bookId — public list of approved, non-flagged reviews. */
export const getReviews: RequestHandler = async (req, res) => {
  const bookId = requireObjectIdParam(req.params.bookId, 'Book not found');

  const [reviews, book] = await Promise.all([
    Review.find({ bookId, isApproved: true, isFlagged: false })
      .populate('buyerId', 'fullName')
      .sort({ createdAt: -1 }),
    Book.findById(bookId),
  ]);

  res.status(200).json({
    reviews: reviews.map(serializePublicReview),
    averageRating: book?.averageRating ?? 0,
    reviewCount: book?.reviewCount ?? 0,
  });
};

/** POST /api/reviews/:reviewId/flag — mark a review for moderation. */
export const flagReview: RequestHandler = async (req, res) => {
  const reviewId = requireObjectIdParam(req.params.reviewId, 'Review not found');

  const review = await Review.findById(reviewId);
  if (!review) throw new AppError(404, 'Review not found');

  if (!review.isFlagged) {
    review.isFlagged = true;
    await review.save();
    await recalcBookRating(review.bookId.toString());
  }

  res.status(200).json({ flagged: true });
};

/** GET /api/admin/reviews/flagged — moderation queue. */
export const listFlaggedReviews: RequestHandler = async (_req, res) => {
  const reviews = await Review.find({ isFlagged: true })
    .populate('bookId', 'title')
    .populate('buyerId', 'fullName')
    .sort({ createdAt: -1 });

  res.status(200).json({ reviews: reviews.map(serializeFlaggedReview) });
};

/** PATCH /api/admin/reviews/:reviewId — approve (restore) or remove (delete). */
export const moderateReview: RequestHandler = async (req, res) => {
  const reviewId = requireObjectIdParam(req.params.reviewId, 'Review not found');

  const parsed = moderateReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors[0]?.message ?? 'Invalid input');
  }

  const review = await Review.findById(reviewId);
  if (!review) throw new AppError(404, 'Review not found');

  const bookId = review.bookId.toString();

  if (parsed.data.action === 'approve') {
    review.isApproved = true;
    review.isFlagged = false;
    await review.save();
  } else {
    await review.deleteOne();
  }

  await recalcBookRating(bookId);

  res.status(200).json({ action: parsed.data.action });
};
