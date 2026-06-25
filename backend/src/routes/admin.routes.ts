import { Router } from 'express';

import {
  bulkBooks,
  createBook,
  deleteBook,
  getAdminBook,
  listAdminBooks,
  publishBook,
  updateBook,
} from '../controllers/books.controller.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { bookUpload } from '../middleware/upload.middleware.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/books', listAdminBooks);
adminRouter.get('/books/:id', getAdminBook);
adminRouter.post(
  '/books',
  bookUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'samplePdf', maxCount: 1 },
  ]),
  createBook,
);
adminRouter.patch(
  '/books/:id',
  bookUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'samplePdf', maxCount: 1 },
  ]),
  updateBook,
);
adminRouter.delete('/books/:id', deleteBook);
adminRouter.patch('/books/:id/publish', publishBook);
adminRouter.post('/books/bulk', bulkBooks);
