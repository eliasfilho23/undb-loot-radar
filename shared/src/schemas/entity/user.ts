import { z } from '@/zod';

export const User = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
});

export type User = z.infer<typeof User>;
