import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  supabaseId: z.string().min(1),
  name: z.string().min(1).max(80),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(15),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  createdAt: z.string().optional(),
});
