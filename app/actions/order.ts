"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  createOrderSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
  type DbOrder,
} from "@/lib/types";

export async function createOrder(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    const data = Object.fromEntries(formData.entries());
    const parsed = createOrderSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input");
    }

    const { address_id, payment_method, notes }: CreateOrderInput = parsed.data;
    // Start a transaction
    await query("BEGIN");
    // Get cart items
    const cartResult = await query(
      `SELECT 
        ci.product_id,
        ci.quantity,
        p.price_cents,
        p.inventory as stock_quantity,
        p.is_active
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = $1 AND p.is_active = true`,
      [session.user.id]
    );
    const cartItems = cartResult.rows;
    if (cartItems.length === 0) {
      await query("ROLLBACK");
      throw new Error("Cart is empty");
    }
    // Check stock availability
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        await query("ROLLBACK");
        throw new Error(`Insufficient stock for product ID ${item.product_id}`);
      }
      if (!item.is_active) {
        await query("ROLLBACK");
        throw new Error(`Product ID ${item.product_id} is not available`);
      }
    }
    // Calculate total amount
    const totalCents = cartItems.reduce(
      (sum, item) => sum + item.price_cents * item.quantity,
      0
    );
    // Create order
    const orderResult = await query(
      `INSERT INTO orders (user_id, address_id, total_cents, payment_method, status, notes)
         VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING id`,
      [session.user.id, address_id, totalCents, payment_method, notes || null]
    );
    const orderId = orderResult.rows[0].id;
    // Insert order items and update product stock
    for (const item of cartItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_cents)
           VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price_cents]
      );
      await query(
        `UPDATE products SET inventory = inventory - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }
    // Clear cart
    await query("DELETE FROM cart_items WHERE user_id = $1", [session.user.id]);
    // Commit transaction
    await query("COMMIT");
    revalidatePath("/orders");
    return { success: true, message: "Order created successfully", orderId };
  } catch (error) {
    await query("ROLLBACK");
    console.error("Create order error:", error);
    return { success: false, message: "Failed to create order" };
  }
}

export async function updateOrderStatus(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = updateOrderStatusSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input: " + parsed.error.issues.map(i => i.message).join(", "));
    }
    const { id, status, payment_status }: UpdateOrderStatusInput = parsed.data;

    // Check if order exists first
    const orderExists = await query(
      "SELECT status FROM orders WHERE id = $1",
      [id]
    );

    if (orderExists.rows.length === 0) {
      throw new Error("Order not found");
    }

    const currentStatus = orderExists.rows[0].status;
    
    // Validate status transitions
    if (currentStatus === 'cancelled' && status !== 'cancelled') {
      throw new Error("Cannot change status of a cancelled order");
    }
    if (currentStatus === 'delivered' && status !== 'delivered') {
      throw new Error("Cannot change status of a delivered order");
    }

    // Build update query dynamically based on provided fields
    let updateQuery = "UPDATE orders SET status = $1";
    let params: any[] = [status];
    let paramCount = 1;

    if (payment_status !== undefined) {
      paramCount++;
      updateQuery += `, payment_status = $${paramCount}`;
      params.push(payment_status);
    }

    paramCount++;
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(id);

    const result = await query(updateQuery, params);
    const updatedOrder = result.rows[0];

    // Handle inventory restoration if order is cancelled
    if (status === "cancelled") {
      // Get order items to restore inventory
      const orderItems = await query(
        "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
        [id]
      );

      // Restore inventory for each item
      for (const item of orderItems.rows) {
        await query(
          "UPDATE products SET inventory = inventory + $1 WHERE id = $2",
          [item.quantity, item.product_id]
        );
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    return {
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    };
  } catch (error) {
    console.error("Update order status error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to update order status" };
  }
}

export async function cancelOrder(orderId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin or order owner
    const orderCheck = await query(
      "SELECT user_id FROM orders WHERE id = $1",
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      throw new Error("Order not found");
    }

    const order = orderCheck.rows[0];
    const isAdmin = session.user.role === "admin";
    const isOrderOwner = order.user_id === session.user.id;

    if (!isAdmin && !isOrderOwner) {
      throw new Error("Unauthorized: Can only cancel your own orders or must be admin");
    }

    // Check if order can be cancelled (not already delivered or cancelled)
    const statusCheck = await query(
      "SELECT status FROM orders WHERE id = $1",
      [orderId]
    );

    const currentStatus = statusCheck.rows[0].status;
    if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
      throw new Error(`Cannot cancel order with status: ${currentStatus}`);
    }

    // Use updateOrderStatus to handle the cancellation logic
    const formData = new FormData();
    formData.append('id', orderId.toString());
    formData.append('status', 'cancelled');

    return await updateOrderStatus(formData);
  } catch (error) {
    console.error("Cancel order error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to cancel order" };
  }
}
