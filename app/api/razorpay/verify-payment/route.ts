import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shipping_address,
      total_cents
    } = await request.json();

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Create order in database
    const orderResult = await query(
      `INSERT INTO orders (user_id, total_cents, status, payment_status, payment_method, razorpay_order_id, razorpay_payment_id, placed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [
        session.user.id,
        total_cents,
        'confirmed',
        'paid',
        'razorpay',
        razorpay_order_id,
        razorpay_payment_id
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

    // Create shipping address if provided
    if (shipping_address) {
      await query(
        `INSERT INTO addresses (user_id, line1, city, state, postal_code, phone)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          session.user.id,
          `${shipping_address.firstName} ${shipping_address.lastName}, ${shipping_address.address}`,
          shipping_address.city,
          shipping_address.state,
          shipping_address.pincode,
          shipping_address.phone
        ]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: orderId,
          status: 'confirmed',
          payment_status: 'paid',
          total_amount: total_cents / 100
        }
      }
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}