import { Router } from 'express';

import { env } from '../config/env.js';
import { login, logout, refresh, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

// Rate limiter disabled under test so it doesn't bleed across cases (tested in isolation).
if (!env.isTest) {
  authRouter.use(authRateLimiter());
}

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', requireAuth, logout);
