import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createProductSchema, type CreateProductInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const isActive = searchParams.get("is_active");
    const isFeatured = searchParams.get("is_featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Check if user is admin for viewing inactive products
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    let sql = `
      SELECT 
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
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;

    const whereConditions = [];
    const params: unknown[] = [];
    let paramCount = 0;

    // For non-admin users, only show active products
    if (!isAdmin) {
      paramCount++;
      whereConditions.push(`p.is_active = $${paramCount}`);
      params.push(true);
    } else if (isActive !== null) {
      // Admin can filter by active status
      paramCount++;
      whereConditions.push(`p.is_active = $${paramCount}`);
      params.push(isActive === "true");
    }

    // Filter by featured status
    if (isFeatured !== null) {
      paramCount++;
      whereConditions.push(`p.is_featured = $${paramCount}`);
      params.push(isFeatured === "true");
    }

    // Filter by category
    if (category) {
      paramCount++;
      whereConditions.push(`c.slug = $${paramCount}`);
      params.push(category);
    }

    // Search in name and description
    if (search) {
      paramCount++;
      whereConditions.push(`(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    // Add WHERE clause if we have conditions
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Add ordering and pagination
    sql += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    
    if (whereConditions.length > 0) {
      countSql += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    const countResult = await query(countSql, params.slice(0, -2)); // Remove limit and offset
    const totalProducts = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalProducts / limit);

    // Format prices from cents to decimal
    const formattedProducts = result.rows.map(product => ({
      ...product,
      price: parseFloat((product.price_cents / 100).toFixed(2)),
      images: product.images || []
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          totalProducts,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const productData: CreateProductInput = parsed.data;

    // Check if category exists
    const categoryCheck = await query(
      "SELECT id FROM categories WHERE id = $1",
      [productData.category_id]
    );

    if (categoryCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    // Insert the product
    const result = await query(
      `INSERT INTO products (
        name, description, price_cents, inventory, category_id, 
        image_url, images, is_active, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
      RETURNING id, name, description, price_cents, inventory, category_id, 
                image_url, images, is_active, is_featured, created_at`,
      [
        productData.name,
        productData.description || null,
        productData.price_cents,
        productData.inventory,
        productData.category_id,
        productData.image_url || null,
        JSON.stringify(productData.images),
        productData.is_active,
        productData.is_featured
      ]
    );

    const newProduct = result.rows[0];

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: {
        product: {
          ...newProduct,
          price: parseFloat((newProduct.price_cents / 100).toFixed(2))
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}