import { Router } from 'express';

import { submitContact } from '../controllers/contact.controller.js';
import { contactSchema } from '../schemas/contact.schema.js';
import { validateBody } from '../middleware/validate.middleware.js';

export const contactRouter = Router();

contactRouter.post('/', validateBody(contactSchema), submitContact);
