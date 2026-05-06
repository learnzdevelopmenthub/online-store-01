import 'dotenv/config';

import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function main(): Promise<void> {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`backend listening on :${env.PORT}`);
  });
}

main().catch((err: unknown) => {
  console.error('fatal: backend failed to start', err);
  process.exit(1);
});
