import type { RequestHandler } from 'express';

import type { ContactInput } from '../schemas/contact.schema.js';
import { sendContactMessage } from '../services/email.service.js';

export const submitContact: RequestHandler = async (req, res) => {
  const { name, email, subject, message } = req.body as ContactInput;
  await sendContactMessage(name, email, subject, message);
  res.status(200).json({ message: 'Message sent' });
};
