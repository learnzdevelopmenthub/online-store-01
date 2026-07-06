import { z } from 'zod';

/** PEM keys are stored inline in env with literal `\n` escapes; restore real newlines. */
const decodePem = (value: string): string => value.replace(/\\n/g, '\n');
const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Auth — RS256 access tokens + HMAC-signed refresh tokens
  JWT_PRIVATE_KEY: z.string().min(1, 'JWT_PRIVATE_KEY is required').transform(decodePem),
  JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY is required').transform(decodePem),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET is required'),

  // Admin seed
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters'),

  // Comma-separated allowed CORS origins → string[]
  CORS_ORIGIN: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  // Reserved for later milestones — optional so placeholder values don't fail boot
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Razorpay — optional so test/dev boots don't require real credentials.
  // The service validates these at call time.
  RAZORPAY_KEY_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  RAZORPAY_KEY_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  RAZORPAY_WEBHOOK_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),

  // Cloudflare R2. The service validates these at call time so test/dev boots do
  // not require real object-storage credentials.
  R2_ACCOUNT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_ACCESS_KEY_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_SECRET_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_PUBLIC_BUCKET: z.string().default('books-public'),
  R2_PRIVATE_BUCKET: z.string().default('books-private'),
  R2_PUBLIC_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables — see logged field errors above.');
}

export const env = {
  ...parsed.data,
  isTest: parsed.data.NODE_ENV === 'test',
  isProd: parsed.data.NODE_ENV === 'production',
} as const;
