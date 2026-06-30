import { Router } from 'express';

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get('/', getWishlist);
wishlistRouter.post('/:bookId', addToWishlist);
wishlistRouter.delete('/:bookId', removeFromWishlist);
