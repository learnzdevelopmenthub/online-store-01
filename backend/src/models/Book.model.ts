import { Schema, model, type HydratedDocument } from 'mongoose';

export interface IBook {
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  coverImageKey: string;
  pdfKey: string;
  samplePdfKey?: string | null;
  averageRating?: number;
  reviewCount?: number;
  totalSales?: number;
  isPublished?: boolean;
  isDeleted?: boolean;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    coverImageKey: { type: String, required: true },
    pdfKey: { type: String, required: true },
    samplePdfKey: { type: String, default: null },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    totalSales: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1, isPublished: 1, price: 1 });

export type BookDoc = HydratedDocument<IBook>;

export const Book = model<IBook>('Book', bookSchema);
