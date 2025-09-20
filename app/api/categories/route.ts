import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createCategorySchema, type CreateCategoryInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProductCount = searchParams.get("include_product_count") === "true";
    const onlyWithProducts = searchParams.get("only_with_products") === "true";

    let sql = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.created_at
    `;

    if (includeProductCount) {
      sql += `, COUNT(p.id) as product_count`;
    }

    sql += `
      FROM categories c
    `;

    if (includeProductCount || onlyWithProducts) {
      sql += ` LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true`;
    }

    if (onlyWithProducts) {
      sql += ` WHERE p.id IS NOT NULL`;
    }

    if (includeProductCount) {
      sql += ` GROUP BY c.id, c.name, c.slug, c.description, c.created_at`;
    }

    sql += ` ORDER BY c.name ASC`;

    const result = await query(sql);

    // Format product_count as number if included
    const formattedCategories = result.rows.map(category => ({
      ...category,
      ...(includeProductCount && { 
        product_count: parseInt(category.product_count) || 0 
      })
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: formattedCategories
      }
    });

  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const categoryData: CreateCategoryInput = parsed.data;

    // Check if slug already exists
    const slugCheck = await query(
      "SELECT id FROM categories WHERE slug = $1",
      [categoryData.slug]
    );

    if (slugCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    // Insert the category
    const result = await query(
      `INSERT INTO categories (name, slug, description) 
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, description, created_at`,
      [categoryData.name, categoryData.slug, categoryData.description || null]
    );

    const newCategory = result.rows[0];

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      data: {
        category: newCategory
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}