import { randomUUID } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import type { UserRole } from '../models/User.model.js';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
}

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  // Pin algorithms to block algorithm-confusion / "none" attacks.
  return jwt.verify(token, env.JWT_PUBLIC_KEY, { algorithms: ['RS256'] }) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  // jwtid makes every issued refresh token unique so rotation invalidates the old one
  // (identical {sub} payloads signed in the same second would otherwise collide).
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: REFRESH_TOKEN_TTL,
    jwtid: randomUUID(),
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
    algorithms: ['HS256'],
  }) as RefreshTokenPayload;
}
