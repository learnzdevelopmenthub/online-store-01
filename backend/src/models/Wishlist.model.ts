import { Schema, model, type Types } from 'mongoose';

export interface IWishlist {
  userId: string;
  books: Types.ObjectId[];
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    books: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
