import { Schema, model, type Types } from 'mongoose';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderBook {
  book: Types.ObjectId;
  price: number;
  downloadCount?: number;
  downloadLimit?: number;
}

export interface IOrder {
  buyer: Types.ObjectId;
  books: IOrderBook[];
  totalAmount: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  status?: OrderStatus;
}

const orderBookSchema = new Schema<IOrderBook>(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    price: { type: Number, required: true, min: 0 },
    downloadCount: { type: Number, default: 0, min: 0 },
    downloadLimit: { type: Number, default: 5, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    books: { type: [orderBookSchema], required: true, default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

orderSchema.index({ 'books.book': 1 });

export const Order = model<IOrder>('Order', orderSchema);
