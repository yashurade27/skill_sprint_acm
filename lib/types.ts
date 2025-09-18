import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user')
});

// Database user type
export const dbUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string(),
  phone: z.string().nullable(),
  role: z.string(),
  email_verified: z.boolean()
});

// Auth return user type
export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  phone: z.string().nullable(),
  email_verified: z.boolean()
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DbUser = z.infer<typeof dbUserSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;

// Extended session user type
export interface ExtendedUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string;
  phone?: string | null;
  email_verified?: boolean;
}