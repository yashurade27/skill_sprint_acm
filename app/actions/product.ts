"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/lib/types";

export async function createProduct(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const data = Object.fromEntries(formData.entries());
    const parsed = createProductSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input");
    }
    const product: CreateProductInput = parsed.data;

    await query(
      `INSERT INTO products (name, description, price_cents, inventory, category_id, image_url, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        product.name,
        product.description || null,
        product.price_cents,
        product.inventory,
        product.category_id,
        product.image_url || null,
        product.is_active,
      ]
    );

    revalidatePath("/admin/products");
    return { success: true, message: "Product created successfully" };
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, message: "Failed to create product" };
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const data = Object.fromEntries(formData.entries());
    const parsed = updateProductSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input");
    }
    const product: UpdateProductInput = parsed.data;

    // Build dynamic query parts
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(product)) {
      if (key !== "id" && value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    if (fields.length === 0) {
      throw new Error("No fields to update");
    }
    values.push(product.id); // For WHERE clause

    const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = $${idx}`;
    await query(sql, values);
    revalidatePath("/admin/products");
    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, message: "Failed to update product" };
  }
}

export async function deleteProduct(productId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (typeof productId !== "number" || productId <= 0) {
      throw new Error("Invalid product ID");
    }

    await query("DELETE FROM products WHERE id = $1", [productId]);
    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, message: "Failed to delete product" };
  }
}

export async function updateProductInventory(productId: number, newInventory: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    if (typeof productId !== "number" || productId <= 0) {
      throw new Error("Invalid product ID");
    }
    if (typeof newInventory !== "number" || newInventory < 0) {
      throw new Error("Invalid inventory value");
    }
    await query("UPDATE products SET inventory = $1 WHERE id = $2", [newInventory, productId]);
    return { success: true, message: "Inventory updated successfully" };
    } catch (error) {
    console.error("Update inventory error:", error);
    return { success: false, message: "Failed to update inventory" };
  }
}