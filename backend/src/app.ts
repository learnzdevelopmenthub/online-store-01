import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { booksRouter } from './routes/books.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { wishlistRouter } from './routes/wishlist.routes.js';

export function createApp(): Express {
  const app = express();

  // Behind Caddy in production: trust the first proxy hop so req.ip / req.secure
  // and express-rate-limit use the real client IP from X-Forwarded-For.
  if (env.isProd) {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  if (!env.isTest) {
    app.use(morgan('dev'));
  }

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/books', booksRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/wishlist', wishlistRouter);

  // Error handler must be registered last.
  app.use(errorMiddleware);

  return app;
}
