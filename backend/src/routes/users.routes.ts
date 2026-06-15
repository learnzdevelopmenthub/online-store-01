import { Router } from 'express';

import { changePassword, getMe, updateMe } from '../controllers/users.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { changePasswordSchema, updateProfileSchema } from '../schemas/users.schema.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/me', getMe);
usersRouter.patch('/me', validateBody(updateProfileSchema), updateMe);
usersRouter.patch('/me/password', validateBody(changePasswordSchema), changePassword);
