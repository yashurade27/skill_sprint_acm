import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(context.params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get("include_products") === "true";

    // Get category details
    const categoryResult = await query(
      `SELECT 
        id,
        name,
        slug,
        description,
        created_at
      FROM categories 
      WHERE id = $1`,
      [categoryId]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ 
        error: "Category not found" 
      }, { status: 404 });
    }

    const category = categoryResult.rows[0];

    // Get products in this category if requested
    if (includeProducts) {
      const productsResult = await query(
        `SELECT 
          id,
          name,
          description,
          price_cents,
          inventory,
          image_url,
          is_active,
          created_at
        FROM products 
        WHERE category_id = $1 AND is_active = true
        ORDER BY created_at DESC`,
        [categoryId]
      );

      // Format prices from cents to decimal
      const formattedProducts = productsResult.rows.map(product => ({
        ...product,
        price: parseFloat((product.price_cents / 100).toFixed(2))
      }));

      category.products = formattedProducts;
      category.product_count = formattedProducts.length;
    } else {
      // Just get product count
      const countResult = await query(
        "SELECT COUNT(*) as product_count FROM products WHERE category_id = $1 AND is_active = true",
        [categoryId]
      );
      category.product_count = parseInt(countResult.rows[0].product_count);
    }

    return NextResponse.json({
      success: true,
      data: {
        category
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