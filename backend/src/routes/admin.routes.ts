import { Router } from 'express';

import {
  getAdminOrder,
  getCustomer,
  getDashboard,
  getSettings,
  listAdminOrders,
  listCustomers,
  refundOrder,
  suspendCustomer,
  updateSettings,
} from '../controllers/admin.controller.js';
import {
  bulkBooks,
  createBook,
  deleteBook,
  getAdminBook,
  listAdminBooks,
  publishBook,
  updateBook,
} from '../controllers/books.controller.js';
import { listFlaggedReviews, moderateReview } from '../controllers/reviews.controller.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { bookUpload } from '../middleware/upload.middleware.js';
import {
  refundOrderSchema,
  suspendCustomerSchema,
  updateSettingsSchema,
} from '../schemas/admin.schema.js';
import { validateBody } from '../middleware/validate.middleware.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/dashboard', getDashboard);

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

adminRouter.get('/orders', listAdminOrders);
adminRouter.get('/orders/:id', getAdminOrder);
adminRouter.post('/orders/:id/refund', validateBody(refundOrderSchema), refundOrder);

adminRouter.get('/customers', listCustomers);
adminRouter.get('/customers/:id', getCustomer);
adminRouter.patch('/customers/:id/suspend', validateBody(suspendCustomerSchema), suspendCustomer);

adminRouter.get('/settings', getSettings);
adminRouter.patch('/settings', validateBody(updateSettingsSchema), updateSettings);

// Review moderation (M10)
adminRouter.get('/reviews/flagged', listFlaggedReviews);
adminRouter.patch('/reviews/:reviewId', moderateReview);
