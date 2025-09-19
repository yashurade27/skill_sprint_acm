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

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name too long'),
  description: z.string().optional(),
  price_cents: z.number().int().min(0, 'Price must be positive'),
  inventory: z.number().int().min(0, 'Inventory must be non-negative').default(0),
  category_id: z.number().int().positive('Category is required'),
  image_url: z.string().url('Invalid image URL').optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  is_active: z.boolean().default(true)
});

export const updateProductSchema = z.object({
  id: z.number().int().positive('Product ID is required'),
  name: z.string().min(1, 'Product name is required').max(255, 'Product name too long').optional(),
  description: z.string().optional(),
  price_cents: z.number().int().min(0, 'Price must be positive').optional(),
  inventory: z.number().int().min(0, 'Inventory must be non-negative').optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed').optional(),
  category_id: z.number().int().positive('Category is required').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  is_active: z.boolean().optional()
});

export const dbProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price_cents: z.number(),
  inventory: z.number(),
  category_id: z.number().nullable(),
  image_url: z.string().nullable(),
  images: z.array(z.string()).nullable(),
  is_active: z.boolean(),
  created_at: z.date()
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional()
});

export const updateCategorySchema = z.object({
  id: z.number().int().positive('Category ID is required'),
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long').optional(),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only').optional(),
  description: z.string().optional()
});

export const dbCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  created_at: z.date()
});

// Cart schemas
export const addToCartSchema = z.object({
  product_id: z.number().int().positive('Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
});

export const updateCartItemSchema = z.object({
  user_id: z.number().int().positive('User ID is required'),
  product_id: z.number().int().positive('Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
});

export const dbCartItemSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  product_id: z.number(),
  quantity: z.number(),
  created_at: z.date()
});

// Address schemas
export const createAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  phone: z.string().optional()
});

export const updateAddressSchema = z.object({
  id: z.number().int().positive('Address ID is required'),
  line1: z.string().min(1, 'Address line 1 is required').optional(),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(1, 'State is required').optional(),
  postal_code: z.string().min(1, 'Postal code is required').optional(),
  phone: z.string().optional()
});

export const dbAddressSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  line1: z.string(),
  line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  phone: z.string().nullable(),
  created_at: z.date()
});

// Order schemas
export const createOrderSchema = z.object({
  address_id: z.number().int().positive('Address is required'),
  payment_method: z.enum(['razorpay', 'cod', 'upi']).default('razorpay'),
  notes: z.string().optional()
});

export const updateOrderStatusSchema = z.object({
  id: z.number().int().positive('Order ID is required'),
  status: z.enum(['pending', 'paid', 'confirmed', 'delivered', 'cancelled']),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional()
});

export const dbOrderSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  address_id: z.number().nullable(),
  total_cents: z.number(),
  status: z.string(),
  payment_status: z.string(),
  payment_method: z.string().nullable(),
  razorpay_order_id: z.string().nullable(),
  razorpay_payment_id: z.string().nullable(),
  placed_at: z.date(),
  notes: z.string().nullable()
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DbUser = z.infer<typeof dbUserSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;

// Product types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DbProduct = z.infer<typeof dbProductSchema>;

// Category types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DbCategory = z.infer<typeof dbCategorySchema>;

// Cart types
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type DbCartItem = z.infer<typeof dbCartItemSchema>;

// Address types
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type DbAddress = z.infer<typeof dbAddressSchema>;

// Order types
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type DbOrder = z.infer<typeof dbOrderSchema>;

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