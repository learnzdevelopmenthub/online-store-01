import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { hashPassword } from './password.util.js';

/** Idempotently ensure the single admin account exists (seeded from env). */
export async function seedAdmin(): Promise<void> {
  const email = env.ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
    }
    return;
  }

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  await User.create({
    fullName: 'Store Admin',
    email,
    passwordHash,
    role: 'admin',
    isActive: true,
  });
  console.log(`seed: created admin account ${email}`);
}
