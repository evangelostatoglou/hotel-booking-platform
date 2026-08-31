import { z } from "zod";

export const loginSchema = z.object({
  email: z
  .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(30, 'Password must be less than 30 characters long')
    .regex(/[A-Z]/, 'Password must contain at least 1 capital letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
});

export type LoginInput = z.infer<typeof loginSchema>;



