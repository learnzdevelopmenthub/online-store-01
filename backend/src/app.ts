import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';

export function createApp(): Express {
  const app = express();

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
  app.use('/api/users', usersRouter);

  // Error handler must be registered last.
  app.use(errorMiddleware);

  return app;
}
