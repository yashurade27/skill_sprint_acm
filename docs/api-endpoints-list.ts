// ========================================
// API ENDPOINTS (app/api/)
// Use for data fetching and external integrations
// ========================================

// AUTHENTICATION
// GET /api/auth/session - Get current session (NextAuth)
// POST /api/auth/signin - Login user (NextAuth)
// POST /api/auth/signout - Logout user (NextAuth)
// POST /api/auth/register - Register new user with OTP
// POST /api/auth/verify-otp - Verify email OTP
// POST /api/auth/resend-otp - Resend OTP

// USER PROFILE
// GET /api/profile - Get current user profile
// PUT /api/profile - Update user profile (name, phone, etc.)
// PUT /api/profile/password - Change user password
// POST /api/profile/avatar - Upload profile picture

// PRODUCTS
// GET /api/products - Get all products (with filters)
// GET /api/products/[id] - Get single product
// GET /api/products/category/[slug] - Get products by category
// GET /api/products/search?q=query - Search products
// POST /api/products - Admin: Create product
// PUT /api/products/[id] - Admin: Update product
// DELETE /api/products/[id] - Admin: Delete product

// CATEGORIES
// GET /api/categories - Get all categories
// GET /api/categories/[id] - Get single category
// POST /api/categories - Admin: Create category
// PUT /api/categories/[id] - Admin: Update category
// DELETE /api/categories/[id] - Admin: Delete category

// CART
// GET /api/cart - Get user's cart items
// POST /api/cart - Add item to cart
// PUT /api/cart/[itemId] - Update cart item
// DELETE /api/cart/[itemId] - Remove from cart
// DELETE /api/cart - Clear entire cart

// ORDERS
// GET /api/orders - Get user's orders (or all for admin)
// GET /api/orders/[id] - Get single order details
// POST /api/orders - Create new order
// PUT /api/orders/[id] - Update order (admin)
// DELETE /api/orders/[id] - Cancel order

// ADDRESSES
// GET /api/addresses - Get user's addresses
// GET /api/addresses/[id] - Get single address
// POST /api/addresses - Create new address
// PUT /api/addresses/[id] - Update address
// DELETE /api/addresses/[id] - Delete address

// PAYMENTS
// POST /api/payments/create-order - Create Razorpay order
// POST /api/payments/verify - Verify Razorpay payment
// POST /api/payments/webhook - Razorpay webhook
// GET /api/payments/[orderId] - Get payment details

// ADMIN
// GET /api/admin/dashboard - Admin dashboard stats
// GET /api/admin/orders - All orders for admin
// GET /api/admin/users - All users for admin
// PUT /api/admin/orders/[id]/status - Update order status
// GET /api/admin/analytics - Sales analytics

// REVIEWS (if implemented)
// GET /api/reviews/product/[productId] - Get product reviews
// POST /api/reviews - Create review
// PUT /api/reviews/[id] - Update review
// DELETE /api/reviews/[id] - Delete review

// INVENTORY (if needed)
// PUT /api/inventory/[productId] - Update product inventory
// GET /api/inventory/low-stock - Get low stock products

// NOTIFICATIONS (if needed)
// GET /api/notifications - Get user notifications
// POST /api/notifications/send - Send notification
// PUT /api/notifications/[id]/read - Mark as read

// FILE UPLOADS
// POST /api/upload/image - Upload product images
// DELETE /api/upload/image/[filename] - Delete image

// ANALYTICS (future)
// GET /api/analytics/sales - Sales analytics
// GET /api/analytics/products - Product performance
// GET /api/analytics/customers - Customer analytics