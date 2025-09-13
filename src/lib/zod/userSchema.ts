import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(80),
  email: z.string().email().max(255).optional(), //email can be nullable
  phone: z.string().min(10).max(15),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  createdAt: z.string().optional(),
})
