import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';
import { isValidObjectId, Types } from 'mongoose';

import { Book, type BookDoc } from '../models/Book.model.js';
import { Order } from '../models/Order.model.js';
import {
  bulkBookSchema,
  createBookSchema,
  publishBookSchema,
  updateBookSchema,
  type BulkBookInput,
  type CreateBookInput,
  type PublishBookInput,
  type UpdateBookInput,
} from '../schemas/books.schema.js';
import { resizeCoverImage } from '../services/image.service.js';
import { deleteFile, getPublicUrl, uploadFile } from '../services/r2.service.js';
import { AppError } from '../utils/AppError.js';

const DEFAULT_PAGE_SIZE = 12;

type UploadedBookFiles = {
  coverImage?: Express.Multer.File[];
  pdf?: Express.Multer.File[];
  samplePdf?: Express.Multer.File[];
};

interface BookFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return parsed;
}

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseFilters(query: Record<string, unknown>): BookFilters {
  return {
    category:
      typeof query.category === 'string' && query.category.trim()
        ? query.category.trim()
        : undefined,
    minPrice: parseNumber(query.minPrice),
    maxPrice: parseNumber(query.maxPrice),
    minRating: parseNumber(query.minRating),
  };
}

function publicBookFilter(filters: BookFilters) {
  const query: Record<string, unknown> = { isPublished: true, isDeleted: false };
  if (filters.category) query.category = filters.category;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {
      ...(filters.minPrice !== undefined ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice } : {}),
    };
  }
  if (filters.minRating !== undefined) query.averageRating = { $gte: filters.minRating };
  return query;
}

function serializeBook(book: BookDoc, includePrivateKeys = false) {
  const json = book.toJSON() as unknown as Record<string, unknown>;
  return {
    ...json,
    coverImageUrl: getPublicUrl(book.coverImageKey),
    ...(includePrivateKeys ? {} : { pdfKey: undefined }),
  };
}

async function paginateBooks(baseQuery: Record<string, unknown>, page: number, limit: number) {
  const [books, total] = await Promise.all([
    Book.find(baseQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Book.countDocuments(baseQuery),
  ]);

  return {
    books: books.map((book) => serializeBook(book)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

function requireValidId(id: unknown): string {
  if (typeof id !== 'string' || !isValidObjectId(id)) {
    throw new AppError(404, 'Book not found');
  }
  return id;
}

function getUploadedFiles(req: Parameters<RequestHandler>[0]): UploadedBookFiles {
  return (req.files ?? {}) as UploadedBookFiles;
}

function validatePayload<T>(
  schema: {
    safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: unknown };
  },
  value: unknown,
): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
}

async function uploadCover(bookId: string, file: Express.Multer.File): Promise<string> {
  const cover = await resizeCoverImage(file.buffer);
  const key = `covers/${bookId}-${randomUUID()}.webp`;
  return uploadFile(key, cover, 'image/webp', 'public');
}

async function uploadPdf(
  bookId: string,
  file: Express.Multer.File,
  sample = false,
): Promise<string> {
  const prefix = sample ? 'pdfs/samples' : 'pdfs';
  const key = `${prefix}/${bookId}${sample ? '-sample' : ''}-${randomUUID()}.pdf`;
  return uploadFile(key, file.buffer, 'application/pdf', 'private');
}

async function hasOrders(bookId: string): Promise<boolean> {
  return Boolean(await Order.exists({ 'books.book': bookId }));
}

async function hardDeleteFiles(book: BookDoc): Promise<void> {
  await Promise.all([
    deleteFile(book.coverImageKey, 'public'),
    deleteFile(book.pdfKey, 'private'),
    book.samplePdfKey ? deleteFile(book.samplePdfKey, 'private') : Promise.resolve(),
  ]);
}

async function deleteBookById(bookId: string) {
  const book = await Book.findById(bookId);
  if (!book) {
    throw new AppError(404, 'Book not found');
  }

  if (await hasOrders(bookId)) {
    book.isDeleted = true;
    book.isPublished = false;
    await book.save();
    return { mode: 'soft', book: serializeBook(book, true) };
  }

  await hardDeleteFiles(book);
  await book.deleteOne();
  return { mode: 'hard', book: serializeBook(book, true) };
}

export const listBooks: RequestHandler = async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE);
  const data = await paginateBooks(publicBookFilter(parseFilters(req.query)), page, limit);
  res.status(200).json(data);
};

export const searchBooks: RequestHandler = async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE);
  const query = publicBookFilter(parseFilters(req.query));
  if (q) {
    query.$text = { $search: q };
  }
  const data = await paginateBooks(query, page, limit);
  res.status(200).json(data);
};

export const getFeaturedBooks: RequestHandler = async (_req, res) => {
  const books = await Book.find({ isPublished: true, isDeleted: false })
    .sort({ totalSales: -1, averageRating: -1 })
    .limit(8);
  res.status(200).json({ books: books.map((book) => serializeBook(book)) });
};

export const getNewReleases: RequestHandler = async (_req, res) => {
  const books = await Book.find({ isPublished: true, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(8);
  res.status(200).json({ books: books.map((book) => serializeBook(book)) });
};

export const getBook: RequestHandler = async (req, res) => {
  const id = requireValidId(req.params.id);
  const book = await Book.findOne({ _id: id, isPublished: true, isDeleted: false });
  if (!book) {
    throw new AppError(404, 'Book not found');
  }
  const related = await Book.find({
    _id: { $ne: book._id },
    category: book.category,
    isPublished: true,
    isDeleted: false,
  })
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(4);
  res.status(200).json({
    book: serializeBook(book),
    relatedBooks: related.map((item) => serializeBook(item)),
  });
};

export const listAdminBooks: RequestHandler = async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 20);
  const [books, total] = await Promise.all([
    Book.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Book.countDocuments({ isDeleted: false }),
  ]);
  res.status(200).json({
    books: books.map((book) => serializeBook(book, true)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const createBook: RequestHandler = async (req, res) => {
  const payload = validatePayload<CreateBookInput>(createBookSchema, req.body);
  const files = getUploadedFiles(req);
  const coverImage = files.coverImage?.[0];
  const pdf = files.pdf?.[0];
  const samplePdf = files.samplePdf?.[0];

  if (!coverImage || !pdf) {
    throw new AppError(400, 'Cover image and PDF file are required');
  }

  const bookId = new Types.ObjectId();
  const coverImageKey = await uploadCover(bookId.toString(), coverImage);
  const pdfKey = await uploadPdf(bookId.toString(), pdf);
  const samplePdfKey = samplePdf ? await uploadPdf(bookId.toString(), samplePdf, true) : null;

  const book = await Book.create({
    _id: bookId,
    ...payload,
    coverImageKey,
    pdfKey,
    samplePdfKey,
    isPublished: false,
  });

  res.status(201).json({ book: serializeBook(book, true) });
};

export const updateBook: RequestHandler = async (req, res) => {
  const id = requireValidId(req.params.id);
  const payload = validatePayload<UpdateBookInput>(updateBookSchema, req.body);
  const book = await Book.findById(id);
  if (!book) {
    throw new AppError(404, 'Book not found');
  }

  const files = getUploadedFiles(req);
  const newCover = files.coverImage?.[0] ? await uploadCover(id, files.coverImage[0]) : null;
  const newPdf = files.pdf?.[0] ? await uploadPdf(id, files.pdf[0]) : null;
  const newSample = files.samplePdf?.[0] ? await uploadPdf(id, files.samplePdf[0], true) : null;

  const oldCover = newCover ? book.coverImageKey : null;
  const oldPdf = newPdf ? book.pdfKey : null;
  const oldSample = newSample ? book.samplePdfKey : null;

  Object.assign(book, payload);
  if (newCover) book.coverImageKey = newCover;
  if (newPdf) book.pdfKey = newPdf;
  if (newSample) book.samplePdfKey = newSample;
  await book.save();

  await Promise.all([
    oldCover ? deleteFile(oldCover, 'public') : Promise.resolve(),
    oldPdf ? deleteFile(oldPdf, 'private') : Promise.resolve(),
    oldSample ? deleteFile(oldSample, 'private') : Promise.resolve(),
  ]);

  res.status(200).json({ book: serializeBook(book, true) });
};

export const deleteBook: RequestHandler = async (req, res) => {
  const id = requireValidId(req.params.id);
  const result = await deleteBookById(id);
  res.status(200).json(result);
};

export const publishBook: RequestHandler = async (req, res) => {
  const id = requireValidId(req.params.id);
  const payload = validatePayload<PublishBookInput>(publishBookSchema, req.body);
  const book = await Book.findById(id);
  if (!book || book.isDeleted) {
    throw new AppError(404, 'Book not found');
  }

  if (!payload.isPublished && !payload.confirm && (await hasOrders(id))) {
    throw new AppError(409, 'Book has orders. Confirm before unpublishing.');
  }

  book.isPublished = payload.isPublished;
  await book.save();
  res.status(200).json({ book: serializeBook(book, true) });
};

export const bulkBooks: RequestHandler = async (req, res) => {
  const payload = validatePayload<BulkBookInput>(bulkBookSchema, req.body);
  const ids = payload.ids.map(requireValidId);
  const results = [];

  for (const id of ids) {
    if (payload.action === 'delete') {
      results.push({ id, ...(await deleteBookById(id)) });
      continue;
    }

    const isPublished = payload.action === 'publish';
    const book = await Book.findById(id);
    if (!book || book.isDeleted) {
      results.push({ id, error: 'Book not found' });
      continue;
    }
    if (!isPublished && !payload.confirm && (await hasOrders(id))) {
      results.push({ id, error: 'Book has orders. Confirm before unpublishing.' });
      continue;
    }
    book.isPublished = isPublished;
    await book.save();
    results.push({ id, book: serializeBook(book, true) });
  }

  res.status(200).json({ results });
};
