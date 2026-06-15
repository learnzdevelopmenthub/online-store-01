import type { RequestHandler } from 'express';

import { AppError } from '../utils/AppError.js';

/** Must run after `requireAuth`. Guards admin-only routes. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    next(new AppError(403, 'Admin access required'));
    return;
  }
  next();
};
