import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateProductSchema, type UpdateProductInput } from "@/lib/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);
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
        p.images,
        p.is_active,
        p.is_featured,
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
      price: parseFloat((product.price_cents / 100).toFixed(2)),
      images: product.images || []
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const params = await context.params;
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();
    console.log("Raw request body:", JSON.stringify(body, null, 2));
    console.log("Images type:", typeof body.images, "Is array:", Array.isArray(body.images));
    
    // Validate input
    const parsed = updateProductSchema.safeParse({ ...body, id: productId });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updateData: UpdateProductInput = parsed.data;
    console.log("Parsed updateData:", JSON.stringify(updateData, null, 2));

    // Check if product exists
    const existingProduct = await query(
      "SELECT id FROM products WHERE id = $1",
      [productId]
    );

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if category exists (if category_id is being updated)
    if (updateData.category_id) {
      const categoryCheck = await query(
        "SELECT id FROM categories WHERE id = $1",
        [updateData.category_id]
      );

      if (categoryCheck.rows.length === 0) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 }
        );
      }
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    let paramCount = 0;

    if (updateData.name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(updateData.name);
    }

    if (updateData.description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(updateData.description);
    }

    if (updateData.price_cents !== undefined) {
      paramCount++;
      updateFields.push(`price_cents = $${paramCount}`);
      updateValues.push(updateData.price_cents);
    }

    if (updateData.inventory !== undefined) {
      paramCount++;
      updateFields.push(`inventory = $${paramCount}`);
      updateValues.push(updateData.inventory);
    }

    if (updateData.category_id !== undefined) {
      paramCount++;
      updateFields.push(`category_id = $${paramCount}`);
      updateValues.push(updateData.category_id);
    }

    if (updateData.image_url !== undefined) {
      paramCount++;
      updateFields.push(`image_url = $${paramCount}`);
      updateValues.push(updateData.image_url);
    }

    if (updateData.images !== undefined) {
      paramCount++;
      updateFields.push(`images = $${paramCount}::jsonb`);
      updateValues.push(JSON.stringify(updateData.images));
      console.log("Adding images to update:", updateData.images, "Type:", typeof updateData.images);
    }

    if (updateData.is_active !== undefined) {
      paramCount++;
      updateFields.push(`is_active = $${paramCount}`);
      updateValues.push(updateData.is_active);
    }

    if (updateData.is_featured !== undefined) {
      paramCount++;
      updateFields.push(`is_featured = $${paramCount}`);
      updateValues.push(updateData.is_featured);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Add product ID to parameters
    paramCount++;
    updateValues.push(productId);

    console.log("Final SQL:", `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCount}`);
    console.log("Final values:", updateValues);

    // Execute update
    const result = await query(
      `UPDATE products 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, name, description, price_cents, inventory, category_id, 
                 image_url, images, is_active, is_featured, created_at`,
      updateValues
    );

    const updatedProduct = result.rows[0];

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: {
        product: {
          ...updatedProduct,
          price: parseFloat((updatedProduct.price_cents / 100).toFixed(2))
        }
      }
    });

  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const params = await context.params;
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await query(
      "SELECT id, name FROM products WHERE id = $1",
      [productId]
    );

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product is referenced in any orders
    const orderCheck = await query(
      "SELECT COUNT(*) as count FROM order_items WHERE product_id = $1",
      [productId]
    );

    const orderCount = parseInt(orderCheck.rows[0].count);
    if (orderCount > 0) {
      // If product has orders, just mark as inactive instead of deleting
      await query(
        "UPDATE products SET is_active = false WHERE id = $1",
        [productId]
      );

      return NextResponse.json({
        success: true,
        message: "Product deactivated (has existing orders)"
      });
    }

    // Safe to delete - no order references
    await query("DELETE FROM products WHERE id = $1", [productId]);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}