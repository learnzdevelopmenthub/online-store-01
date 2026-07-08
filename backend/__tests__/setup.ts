import { generateKeyPairSync } from 'node:crypto';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Provide all env vars BEFORE any module imports `config/env.ts`.
// A fresh RSA keypair keeps the RS256 access-token path exercised end-to-end.
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.NODE_ENV = 'test';
process.env.JWT_PRIVATE_KEY = privateKey;
process.env.JWT_PUBLIC_KEY = publicKey;
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'admin-test-password';
process.env.CORS_ORIGIN = 'http://localhost:5173';
// Real connection comes from the in-memory server below; this just satisfies validation.
process.env.MONGODB_URI = 'mongodb://localhost:27017/online-store-01-test';
process.env.RAZORPAY_KEY_ID = 'rzp_test_key_id';
process.env.RAZORPAY_KEY_SECRET = 'rzp_test_key_secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.BUYER_APP_URL = 'http://localhost:3000';
process.env.SMTP_HOST = 'smtp.test.local';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'user';
process.env.SMTP_PASS = 'pass';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key]?.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
