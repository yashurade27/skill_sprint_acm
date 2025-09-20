import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateCategorySchema, type UpdateCategoryInput } from "@/lib/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const result = await query(
      `SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.created_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.slug, c.description, c.created_at`,
      [categoryId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: "Category not found" 
      }, { status: 404 });
    }

    const category = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        category: {
          ...category,
          product_count: parseInt(category.product_count) || 0
        }
      }
    });

  } catch (error) {
    console.error("Get single category error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}