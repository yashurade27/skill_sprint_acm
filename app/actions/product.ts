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
      throw new Error("Unauthorized: Admin access required");
    }
    
    const data = Object.fromEntries(formData.entries());
    const parsed = createProductSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input: " + parsed.error.issues.map(i => i.message).join(", "));
    }
    
    const product: CreateProductInput = parsed.data;

    // Check if category exists (if provided)
    if (product.category_id) {
      const categoryCheck = await query(
        "SELECT id FROM categories WHERE id = $1",
        [product.category_id]
      );
      if (categoryCheck.rows.length === 0) {
        throw new Error("Category not found");
      }
    }

    const result = await query(
      `INSERT INTO products (name, description, price_cents, inventory, category_id, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        product.name,
        product.description || null,
        product.price_cents,
        product.inventory,
        product.category_id || null,
        product.image_url || null,
        product.is_active ?? true,
      ]
    );

    const productId = result.rows[0].id;
    revalidatePath("/admin/products");
    revalidatePath("/api/products"); // Revalidate API cache if using
    
    return { 
      success: true, 
      message: "Product created successfully",
      productId 
    };
  } catch (error) {
    console.error("Create product error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to create product" 
    };
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const data = Object.fromEntries(formData.entries());
    const parsed = updateProductSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input: " + parsed.error.issues.map(i => i.message).join(", "));
    }
    
    const product: UpdateProductInput = parsed.data;

    // Check if product exists
    const productCheck = await query(
      "SELECT id FROM products WHERE id = $1",
      [product.id]
    );
    if (productCheck.rows.length === 0) {
      throw new Error("Product not found");
    }

    // Check if category exists (if being updated)
    if (product.category_id) {
      const categoryCheck = await query(
        "SELECT id FROM categories WHERE id = $1",
        [product.category_id]
      );
      if (categoryCheck.rows.length === 0) {
        throw new Error("Category not found");
      }
    }

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

    const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, values);
    
    revalidatePath("/admin/products");
    revalidatePath(`/api/products/${product.id}`); // Revalidate specific product
    
    return { 
      success: true, 
      message: "Product updated successfully",
      product: result.rows[0]
    };
  } catch (error) {
    console.error("Update product error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update product" 
    };
  }
}

export async function deleteProduct(productId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    if (typeof productId !== "number" || productId <= 0) {
      throw new Error("Invalid product ID");
    }

    // Check if product exists
    const productCheck = await query(
      "SELECT id, name FROM products WHERE id = $1",
      [productId]
    );
    if (productCheck.rows.length === 0) {
      throw new Error("Product not found");
    }

    // Check if product has orders (prevent deletion if it has order history)
    const orderCheck = await query(
      "SELECT COUNT(*) as order_count FROM order_items WHERE product_id = $1",
      [productId]
    );
    
    if (parseInt(orderCheck.rows[0].order_count) > 0) {
      // Instead of deleting, deactivate the product
      await query(
        "UPDATE products SET is_active = false WHERE id = $1",
        [productId]
      );
      
      revalidatePath("/admin/products");
      return { 
        success: true, 
        message: "Product deactivated (has order history - cannot be deleted)" 
      };
    }

    // Safe to delete if no order history
    await query("DELETE FROM products WHERE id = $1", [productId]);
    
    revalidatePath("/admin/products");
    return { 
      success: true, 
      message: "Product deleted successfully" 
    };
  } catch (error) {
    console.error("Delete product error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to delete product" 
    };
  }
}

export async function updateProductInventory(productId: number, newInventory: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    if (typeof productId !== "number" || productId <= 0) {
      throw new Error("Invalid product ID");
    }
    
    if (typeof newInventory !== "number" || newInventory < 0) {
      throw new Error("Invalid inventory value - must be 0 or greater");
    }

    // Check if product exists
    const productCheck = await query(
      "SELECT id, name, inventory FROM products WHERE id = $1",
      [productId]
    );
    if (productCheck.rows.length === 0) {
      throw new Error("Product not found");
    }

    const oldInventory = productCheck.rows[0].inventory;
    
    await query(
      "UPDATE products SET inventory = $1 WHERE id = $2",
      [newInventory, productId]
    );
    
    revalidatePath("/admin/products");
    return { 
      success: true, 
      message: `Inventory updated: ${oldInventory} → ${newInventory}`,
      oldInventory,
      newInventory
    };
  } catch (error) {
    console.error("Update inventory error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update inventory" 
    };
  }
}