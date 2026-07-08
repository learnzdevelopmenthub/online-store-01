import { Router } from 'express';

import { getDownloadUrl, getLibrary } from '../controllers/library.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const libraryRouter = Router();

libraryRouter.use(requireAuth);

libraryRouter.get('/', getLibrary);
libraryRouter.get('/:bookId/download', getDownloadUrl);
