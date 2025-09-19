import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isAdmin = session.user.role === "admin";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT 
        o.id,
        o.user_id,
        o.address_id,
        o.total_cents,
        o.status,
        o.payment_status,
        o.payment_method,
        o.razorpay_order_id,
        o.razorpay_payment_id,
        o.placed_at,
        o.notes,
        u.email as user_email,
        u.name as user_name,
        a.line1,
        a.line2,
        a.city,
        a.state,
        a.postal_code,
        a.phone as address_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
    `;

    let whereConditions = [];
    let queryParams: any[] = [];
    let paramCount = 0;

    // If not admin, only show user's own orders
    if (!isAdmin) {
      paramCount++;
      whereConditions.push(`o.user_id = $${paramCount}`);
      queryParams.push(session.user.id);
    }

    // Filter by status if provided
    if (status) {
      paramCount++;
      whereConditions.push(`o.status = $${paramCount}`);
      queryParams.push(status);
    }

    // Add WHERE clause if we have conditions
    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Add ordering and pagination
    baseQuery += ` ORDER BY o.placed_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await query(baseQuery, queryParams);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM orders o`;
    let countParams: any[] = [];
    let countParamCount = 0;

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(" AND ")}`;
      if (!isAdmin) {
        countParamCount++;
        countParams.push(session.user.id);
      }
      if (status) {
        countParamCount++;
        countParams.push(status);
      }
    }

    const countResult = await query(countQuery, countParams);
    const totalOrders = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalOrders / limit);

    // Get order items for each order
    const orders = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await query(
          `SELECT 
            oi.product_id,
            oi.quantity,
            oi.price_cents,
            p.name as product_name,
            p.image_url
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1`,
          [order.id]
        );

        return {
          ...order,
          items: itemsResult.rows,
          total_amount: parseFloat((order.total_cents / 100).toFixed(2))
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          totalOrders,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
