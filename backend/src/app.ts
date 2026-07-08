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
import { contactRouter } from './routes/contact.routes.js';
import { libraryRouter } from './routes/library.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { reviewsRouter } from './routes/reviews.routes.js';
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
  // Capture the raw request body so the Razorpay webhook handler can verify
  // the HMAC-SHA256 X-Razorpay-Signature before any DB read/write.
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as unknown as Record<string, unknown>).rawBody = buf;
      },
    }),
  );
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
  app.use('/api/orders', ordersRouter);
  app.use('/api/library', libraryRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/contact', contactRouter);

  // Error handler must be registered last.
  app.use(errorMiddleware);

  return app;
}
