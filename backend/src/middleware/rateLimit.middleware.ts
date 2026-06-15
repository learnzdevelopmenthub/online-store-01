import rateLimit from 'express-rate-limit';

/** Factory returning a fresh limiter: 10 requests / 15 min / IP on auth routes. */
export const authRateLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  });
