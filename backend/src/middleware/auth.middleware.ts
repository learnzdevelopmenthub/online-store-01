import type { RequestHandler } from 'express';

import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.util.js';

const BEARER_PREFIX = 'Bearer ';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  const token = header.slice(BEARER_PREFIX.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
};
