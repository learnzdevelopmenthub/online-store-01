import { Router } from 'express';

import { env } from '../config/env.js';
import { login, logout, refresh, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

// Rate limiter only in production. Disabled in test (so it doesn't bleed across
// cases — tested in isolation) and in development (the SPA refreshes on every
// mount, which would otherwise drain the 10/15min budget during normal local use).
if (env.isProd) {
  authRouter.use(authRateLimiter());
}

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', requireAuth, logout);
