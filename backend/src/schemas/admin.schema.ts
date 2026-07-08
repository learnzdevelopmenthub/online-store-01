import { z } from 'zod';

export const refundOrderSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export const suspendCustomerSchema = z.object({
  isActive: z.boolean(),
});

export const updateSettingsSchema = z.object({
  storeName: z.string().trim().min(1).max(120).optional(),
  storeLogo: z.string().trim().url().nullable().optional(),
  contactEmail: z.string().trim().email().optional(),
  emailTemplate: z.string().trim().min(1).max(5000).optional(),
});

export type RefundOrderInput = z.infer<typeof refundOrderSchema>;
export type SuspendCustomerInput = z.infer<typeof suspendCustomerSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
