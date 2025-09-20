"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  addToCartSchema,
  updateCartItemSchema,
  type AddToCartInput,
  type UpdateCartItemInput,
} from "@/lib/types";

export async function addToCart(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    const data = Object.fromEntries(formData.entries());
    const parsed = addToCartSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input");
    }
    const { product_id, quantity }: AddToCartInput = parsed.data;
    // Check if item already exists in cart
    const existing = await query(
      "SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [session.user.id, product_id]
    );
    if (existing.rows.length > 0) {
      // Update existing item
      await query(
        "UPDATE cart_items SET quantity = quantity + $1, updated_at = now() WHERE user_id = $2 AND product_id = $3",
        [quantity, session.user.id, product_id]
      );
    } else {
      // Add new item
      await query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)",
        [session.user.id, product_id, quantity]
      );
    }
    revalidatePath("/cart");
    return { success: true, message: "Item added to cart" };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, message: "Failed to add item to cart" };
  }
}

export async function updateCartItem(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    const data = Object.fromEntries(formData.entries());
    const parsed = updateCartItemSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input");
    }
    const { product_id, quantity }: UpdateCartItemInput = parsed.data;
    // Ensure the cart item belongs to the user
    const existing = await query(
      "SELECT id FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [session.user.id, product_id]
    );
    if (existing.rows.length === 0) {
      throw new Error("Cart item not found");
    }
    if (quantity <= 0) {
      // Remove item if quantity is zero or less
      await query(
        "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
        [session.user.id, product_id]
      );
    } else {
      // Update item quantity
      await query(
        "UPDATE cart_items SET quantity = $1, updated_at = now WHERE user_id = $2 AND product_id = $3",
        [quantity, session.user.id, product_id]
      );
    }
    revalidatePath("/cart");
    return { success: true, message: "Cart item updated" };
  } catch (error) {
    console.error("Update cart item error:", error);
    return { success: false, message: "Failed to update cart item" };
  }
}

export async function removeFromCart(productId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    await query(
      "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [session.user.id, productId]
    );
    revalidatePath("/cart");
    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { success: false, message: "Failed to remove item from cart" };
  }
}

export async function clearCart() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    await query("DELETE FROM cart_items WHERE user_id = $1", [session.user.id]);
    revalidatePath("/cart");
    return { success: true, message: "Cart cleared" };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, message: "Failed to clear cart" };
  }
}
