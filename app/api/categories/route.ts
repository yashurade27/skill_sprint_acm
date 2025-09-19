import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

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