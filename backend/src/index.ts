import 'dotenv/config';

import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { seedAdmin } from './utils/seedAdmin.js';

async function main(): Promise<void> {
  await connectDB();
  await seedAdmin();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`backend listening on :${env.PORT}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`${signal} received — shutting down`);
    server.close(() => {
      void disconnectDB().finally(() => process.exit(0));
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err: unknown) => {
  console.error('fatal: backend failed to start', err);
  process.exit(1);
});
