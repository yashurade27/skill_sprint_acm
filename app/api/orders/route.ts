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
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
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

    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];
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
    const countParams: (string | number)[] = [];

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(" AND ")}`;
      if (!isAdmin) {
        countParams.push(session.user.id);
      }
      if (status) {
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
            oi.qty as quantity,
            oi.unit_price_cents as price_cents,
            p.name as product_name,
            p.image_url
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1`,
          [order.id]
        );

        // Calculate total from items if total_cents is null
        let calculatedTotal = order.total_cents;
        if (!calculatedTotal && itemsResult.rows.length > 0) {
          calculatedTotal = itemsResult.rows.reduce((sum, item) => {
            return sum + (item.price_cents * item.quantity);
          }, 0);
        }

        return {
          ...order,
          items: itemsResult.rows.map(item => ({
            ...item,
            price_amount: parseFloat((item.price_cents / 100).toFixed(2)),
            line_total: parseFloat(((item.price_cents * item.quantity) / 100).toFixed(2))
          })),
          total_amount: calculatedTotal ? parseFloat((calculatedTotal / 100).toFixed(2)) : 0
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      items,
      shipping_address,
      total_cents,
      payment_method = 'cod',
      notes = ''
    } = await request.json();

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    if (!total_cents || total_cents <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    // Create address if provided
    let addressId = null;
    if (shipping_address) {
      // Update user's name if provided and different
      if (shipping_address.firstName || shipping_address.lastName) {
        await query(
          `UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3`,
          [
            shipping_address.firstName || null,
            shipping_address.lastName || null,
            session.user.id
          ]
        );
      }

      const addressResult = await query(
        `INSERT INTO addresses (user_id, line1, line2, city, state, postal_code, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          session.user.id,
          shipping_address.address,
          null, // line2 can be used for apartment/suite
          shipping_address.city,
          shipping_address.state,
          shipping_address.pincode,
          shipping_address.phone
        ]
      );
      addressId = addressResult.rows[0].id;
    }

    // Create order
    const orderResult = await query(
      `INSERT INTO orders (user_id, address_id, total_cents, status, payment_status, payment_method, notes, placed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [
        session.user.id,
        addressId,
        total_cents,
        'confirmed',
        payment_method === 'cod' ? 'pending' : 'pending',
        payment_method,
        notes
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, qty, unit_price_cents)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price_cents]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: orderId,
          status: 'confirmed',
          payment_status: payment_method === 'cod' ? 'pending' : 'pending',
          total_amount: total_cents / 100
        }
      }
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
