import type { CookieOptions, RequestHandler, Response } from 'express';

import { User, type UserDoc, type UserRole } from '../models/User.model.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import { AppError } from '../utils/AppError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type RefreshTokenPayload,
} from '../utils/jwt.util.js';
import { hashPassword, hashToken, verifyPassword, verifyToken } from '../utils/password.util.js';

const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/** Issue an access token and a rotated refresh token (cookie + hashed in DB). */
async function issueSession(user: UserDoc, res: Response): Promise<string> {
  const userId = user._id.toString();
  const accessToken = signAccessToken({
    sub: userId,
    role: user.role as UserRole,
    email: user.email,
  });
  const refreshToken = signRefreshToken({ sub: userId });
  user.refreshToken = await hashToken(refreshToken);
  await user.save();
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  return accessToken;
}

export const register: RequestHandler = async (req, res) => {
  const { fullName, email, password } = req.body as RegisterInput;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ fullName, email, passwordHash });

  // Verification email is a stub until M12.
  console.log(`auth: verification email stub for ${email}`);

  res.status(201).json({ user });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email });
  // Generic error — never reveal whether the email exists.
  if (!user || !user.passwordHash) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordOk = await verifyPassword(user.passwordHash, password);
  if (!passwordOk) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new AppError(403, 'Your account has been suspended. Contact support.');
  }

  const accessToken = await issueSession(user, res);
  res.status(200).json({ accessToken, user });
};

export const refresh: RequestHandler = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) {
    throw new AppError(401, 'Refresh token missing');
  }

  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, 'Invalid refresh token');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.refreshToken) {
    throw new AppError(401, 'Invalid refresh token');
  }

  const matches = await verifyToken(user.refreshToken, token);
  if (!matches) {
    throw new AppError(401, 'Invalid refresh token');
  }

  if (!user.isActive) {
    throw new AppError(403, 'Your account has been suspended. Contact support.');
  }

  // Rotation: issueSession overwrites the stored hash + sets a new cookie.
  const accessToken = await issueSession(user, res);
  res.status(200).json({ accessToken });
};

export const logout: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/auth',
  });
  res.status(204).send();
};
