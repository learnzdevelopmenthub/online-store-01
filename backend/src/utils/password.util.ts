import argon2 from 'argon2';

// OWASP 2026 recommended Argon2id parameters: 64 MB memory, 3 iterations.
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // KiB = 64 MB
  timeCost: 3,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}

/** Refresh tokens are stored as Argon2id hashes (never in plaintext). */
export function hashToken(token: string): Promise<string> {
  return argon2.hash(token, ARGON2_OPTIONS);
}

export function verifyToken(hash: string, token: string): Promise<boolean> {
  return argon2.verify(hash, token);
}
