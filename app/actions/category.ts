"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/types";

export async function createCategory(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = createCategorySchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input: " + parsed.error.issues.map(i => i.message).join(", "));
    }

    const category: CreateCategoryInput = parsed.data;

    // Generate slug from name if not provided
    const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if name or slug already exists
    const existingCheck = await query(
      "SELECT id FROM categories WHERE name = $1 OR slug = $2",
      [category.name, slug]
    );

    if (existingCheck.rows.length > 0) {
      throw new Error("Category name or slug already exists");
    }

    const result = await query(
      `INSERT INTO categories (name, slug, description)
       VALUES ($1, $2, $3) RETURNING id`,
      [
        category.name,
        slug,
        category.description || null,
      ]
    );

    const categoryId = result.rows[0].id;
    revalidatePath("/admin/categories");
    revalidatePath("/api/categories"); // Revalidate API cache

    return {
      success: true,
      message: "Category created successfully",
      categoryId,
    };
  } catch (error) {
    console.error("Create category error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function updateCategory(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = updateCategorySchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input: " + parsed.error.issues.map(i => i.message).join(", "));
    }

    const category: UpdateCategoryInput = parsed.data;

    // Check if category exists
    const categoryCheck = await query(
      "SELECT id, name, slug FROM categories WHERE id = $1",
      [category.id]
    );

    if (categoryCheck.rows.length === 0) {
      throw new Error("Category not found");
    }

    const existingCategory = categoryCheck.rows[0];

    // If updating name or slug, check for duplicates
    if (category.name || category.slug) {
      const newSlug = category.slug || (category.name ? 
        category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 
        existingCategory.slug
      );

      const duplicateCheck = await query(
        "SELECT id FROM categories WHERE (name = $1 OR slug = $2) AND id != $3",
        [category.name || existingCategory.name, newSlug, category.id]
      );

      if (duplicateCheck.rows.length > 0) {
        throw new Error("Category name or slug already exists");
      }

      // Add slug to update data if name was changed but slug wasn't provided
      if (category.name && !category.slug) {
        (category as UpdateCategoryInput & { slug: string }).slug = newSlug;
      }
    }

    // Build dynamic query parts
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(category)) {
      if (key !== "id" && value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(category.id); // For WHERE clause

    const sql = `UPDATE categories SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, values);

    revalidatePath("/admin/categories");
    revalidatePath(`/api/categories/${category.id}`);

    return {
      success: true,
      message: "Category updated successfully",
      category: result.rows[0],
    };
  } catch (error) {
    console.error("Update category error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteCategory(categoryId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    if (typeof categoryId !== "number" || categoryId <= 0) {
      throw new Error("Invalid category ID");
    }

    // Check if category exists
    const categoryCheck = await query(
      "SELECT id, name FROM categories WHERE id = $1",
      [categoryId]
    );

    if (categoryCheck.rows.length === 0) {
      throw new Error("Category not found");
    }

    // Check if category has products
    const productCheck = await query(
      "SELECT COUNT(*) as product_count FROM products WHERE category_id = $1",
      [categoryId]
    );

    if (parseInt(productCheck.rows[0].product_count) > 0) {
      throw new Error("Cannot delete category: It contains products. Remove products first or assign them to another category.");
    }

    await query("DELETE FROM categories WHERE id = $1", [categoryId]);

    revalidatePath("/admin/categories");
    revalidatePath("/api/categories");

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    console.error("Delete category error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}