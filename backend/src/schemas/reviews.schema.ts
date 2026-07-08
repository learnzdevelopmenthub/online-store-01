import { z } from 'zod';

export const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().max(2000).optional(),
});

export const moderateReviewSchema = z.object({
  action: z.enum(['approve', 'remove']),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
