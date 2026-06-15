import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../utils/AppError.js';

// 4-arg signature is required for Express to register this as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.flatten().fieldErrors });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Mongo duplicate-key (e.g. unique email) → 409
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
};
