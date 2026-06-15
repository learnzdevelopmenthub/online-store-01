import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/** Validate (and coerce) the request body against a Zod schema. */
export const validateBody = (schema: ZodTypeAny): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
};
