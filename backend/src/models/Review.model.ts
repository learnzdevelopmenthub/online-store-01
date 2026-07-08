import { Schema, model, type Types } from 'mongoose';

export interface IReview {
  bookId: Types.ObjectId;
  buyerId: Types.ObjectId;
  rating: number;
  text?: string | null;
  isFlagged?: boolean;
  isApproved?: boolean;
}

const reviewSchema = new Schema<IReview>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: null, trim: true, maxlength: 2000 },
    // New reviews are visible immediately; moderation only handles flagged ones.
    isApproved: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

// One review per buyer per book — re-submitting replaces the existing review.
reviewSchema.index({ bookId: 1, buyerId: 1 }, { unique: true });

export const Review = model<IReview>('Review', reviewSchema);
