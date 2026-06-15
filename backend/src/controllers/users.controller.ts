import type { RequestHandler } from 'express';

import { User } from '../models/User.model.js';
import type { ChangePasswordInput, UpdateProfileInput } from '../schemas/users.schema.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.util.js';

export const getMe: RequestHandler = async (req, res) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  res.status(200).json({ user });
};

export const updateMe: RequestHandler = async (req, res) => {
  const updates = req.body as UpdateProfileInput;
  const user = await User.findByIdAndUpdate(req.user?.id, updates, { returnDocument: 'after' });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  res.status(200).json({ user });
};

export const changePassword: RequestHandler = async (req, res) => {
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;

  const user = await User.findById(req.user?.id);
  if (!user || !user.passwordHash) {
    throw new AppError(400, 'Cannot change password for this account');
  }

  const ok = await verifyPassword(user.passwordHash, currentPassword);
  if (!ok) {
    throw new AppError(400, 'Current password is incorrect');
  }

  user.passwordHash = await hashPassword(newPassword);
  // Invalidate existing sessions on password change.
  user.refreshToken = null;
  await user.save();

  res.status(200).json({ message: 'Password updated' });
};
