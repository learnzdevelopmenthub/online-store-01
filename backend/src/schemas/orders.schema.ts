import { z } from 'zod';

export const createOrderSchema = z.object({
  books: z.array(z.string().min(1)).min(1, 'Cart is empty'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
