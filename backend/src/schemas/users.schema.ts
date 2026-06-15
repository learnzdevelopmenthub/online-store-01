import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120).optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
  })
  .refine((data) => data.fullName !== undefined || data.avatar !== undefined, {
    message: 'Provide at least one field to update',
  });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
