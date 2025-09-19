import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const productId = parseInt(context.params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Check if user is admin (affects what products they can see)
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const result = await query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.price_cents,
        p.inventory,
        p.category_id,
        p.image_url,
        p.is_active,
        p.created_at,
        c.name as category_name,
        c.slug as category_slug,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 ${!isAdmin ? 'AND p.is_active = true' : ''}`,
      [productId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: "Product not found" 
      }, { status: 404 });
    }

    const product = result.rows[0];

    // Format the response
    const formattedProduct = {
      ...product,
      price: parseFloat((product.price_cents / 100).toFixed(2))
    };

    return NextResponse.json({
      success: true,
      data: {
        product: formattedProduct
      }
    });

  } catch (error) {
    console.error("Get single product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}