import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = parseInt(context.params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Get order with user and address details
    const orderResult = await query(
      `SELECT 
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
        u.phone as user_phone,
        a.line1,
        a.line2,
        a.city,
        a.state,
        a.postal_code,
        a.phone as address_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderResult.rows[0];

    // Authorization check: Users can only see their own orders, admins can see all
    const isAdmin = session.user.role === "admin";
    const isOrderOwner = order.user_id === session.user.id;

    if (!isAdmin && !isOrderOwner) {
      return NextResponse.json({ 
        error: "Unauthorized: You can only view your own orders" 
      }, { status: 403 });
    }

    // Get order items with product details
    const itemsResult = await query(
      `SELECT 
        oi.id as order_item_id,
        oi.product_id,
        oi.qty as quantity,
        oi.unit_price_cents as price_cents,
        p.name as product_name,
        p.description as product_description,
        p.image_url,
        p.is_active as product_active,
        c.name as category_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE oi.order_id = $1
      ORDER BY oi.id`,
      [orderId]
    );

    // Format the response
    const formattedOrder = {
      ...order,
      total_amount: parseFloat((order.total_cents / 100).toFixed(2)),
      items: itemsResult.rows.map(item => ({
        ...item,
        price_amount: parseFloat((item.price_cents / 100).toFixed(2)),
        line_total: parseFloat(((item.price_cents * item.quantity) / 100).toFixed(2))
      }))
    };

    return NextResponse.json({
      success: true,
      data: {
        order: formattedOrder
      }
    });

  } catch (error) {
    console.error("Get single order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}