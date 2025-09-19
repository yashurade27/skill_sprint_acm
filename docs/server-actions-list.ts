// ========================================
// SERVER ACTIONS (app/actions/)
// Use for form submissions and mutations
// ========================================

// product-actions.ts
// export async function createProduct(formData: FormData) {
//   // Admin: Create new product
// }

// export async function updateProduct(id: number, formData: FormData) {
//   // Admin: Update existing product
// }

// export async function deleteProduct(id: number) {
//   // Admin: Delete product
// }

// export async function updateInventory(productId: number, quantity: number) {
//   // Admin: Update product inventory
// }

// cart-actions.ts
// export async function addToCart(userId: number, productId: number, quantity: number) {
//   // Add item to user's cart
// }

// export async function updateCartItem(userId: number, productId: number, quantity: number) {
//   // Update cart item quantity
// }

// export async function removeFromCart(userId: number, productId: number) {
//   // Remove item from cart
// }

// export async function clearCart(userId: number) {
//   // Clear entire cart
// }

// order-actions.ts
export async function createOrder(formData: FormData) {
  // Create new order from cart
}

export async function updateOrderStatus(orderId: number, status: string) {
  // Admin: Update order status
}

export async function cancelOrder(orderId: number) {
  // User/Admin: Cancel order
}

// address-actions.ts
export async function createAddress(formData: FormData) {
  // Create new shipping address
}

export async function updateAddress(id: number, formData: FormData) {
  // Update existing address
}

export async function deleteAddress(id: number) {
  // Delete address
}

// category-actions.ts
export async function createCategory(formData: FormData) {
  // Admin: Create new category
}

export async function updateCategory(id: number, formData: FormData) {
  // Admin: Update category
}

export async function deleteCategory(id: number) {
  // Admin: Delete category
}

// review-actions.ts (if using reviews)
export async function createReview(formData: FormData) {
  // Create product review
}

export async function updateReview(id: number, formData: FormData) {
  // Update review
}

export async function deleteReview(id: number) {
  // Delete review
}