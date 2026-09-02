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

export const registerSchema = z.object({
  email: z
  .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(30, 'Password must be less than 30 characters long')
    .regex(/[A-Z]/, 'Password must contain at least 1 capital letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number'),
  
  firstName: z.string().trim().min(1).max(25),
  lastName: z.string().trim().min(1).max(25),
  phone: z.string().trim().min(1).max(13).optional()

});



export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;


