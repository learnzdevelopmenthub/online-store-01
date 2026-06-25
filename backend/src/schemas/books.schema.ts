import { z } from 'zod';

const priceSchema = z.coerce.number().int().nonnegative();

export const createBookSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1),
  price: priceSchema,
});

export const updateBookSchema = createBookSchema.partial();

export const publishBookSchema = z.object({
  isPublished: z.boolean(),
  confirm: z.boolean().optional().default(false),
});

export const bulkBookSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(['publish', 'unpublish', 'delete']),
  confirm: z.boolean().optional().default(false),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type PublishBookInput = z.infer<typeof publishBookSchema>;
export type BulkBookInput = z.infer<typeof bulkBookSchema>;
