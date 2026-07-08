import { Router } from 'express';

import { flagReview, getReviews, submitReview } from '../controllers/reviews.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const reviewsRouter = Router();

// Public — anyone can read a book's approved, non-flagged reviews.
reviewsRouter.get('/:bookId', getReviews);

// Protected routes
reviewsRouter.use(requireAuth);
reviewsRouter.post('/:bookId', submitReview);
reviewsRouter.post('/:reviewId/flag', flagReview);
