import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { addToCartSchema, type AddToCartInput } from "@/lib/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all cart items for the user with product details
    const result = await query(
      `SELECT 
        ci.id,
        ci.product_id,
        ci.quantity,
        ci.created_at,
        p.name,
        p.price,
        p.image_url,
        p.stock_quantity,
        p.is_active
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1 AND p.is_active = true
      ORDER BY ci.created_at DESC`,
      [session.user.id]
    );

    // Calculate cart totals
    const items = result.rows;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      success: true,
      data: {
        items,
        totalItems,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { product_id, quantity }: AddToCartInput = parsed.data;

    // Verify product exists and is active
    const productCheck = await query(
      "SELECT id, stock_quantity, is_active FROM products WHERE id = $1",
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const product = productCheck.rows[0];
    if (!product.is_active) {
      return NextResponse.json(
        { error: "Product is not available" },
        { status: 400 }
      );
    }

    if (product.stock_quantity < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existing = await query(
      "SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [session.user.id, product_id]
    );

    if (existing.rows.length > 0) {
      // Update existing item
      const newQuantity = existing.rows[0].quantity + quantity;
      
      if (product.stock_quantity < newQuantity) {
        return NextResponse.json(
          { error: "Insufficient stock for requested quantity" },
          { status: 400 }
        );
      }

      await query(
        "UPDATE cart_items SET quantity = $1, updated_at = now() WHERE user_id = $2 AND product_id = $3",
        [newQuantity, session.user.id, product_id]
      );
    } else {
      // Add new item
      await query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)",
        [session.user.id, product_id, quantity]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item added to cart successfully"
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}