import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const addressId = parseInt(params.id);
    if (isNaN(addressId)) {
      return NextResponse.json({ error: "Invalid address ID" }, { status: 400 });
    }

    // Get single address with ownership check and default status
    const result = await query(
      `SELECT 
        a.id,
        a.line1,
        a.line2,
        a.city,
        a.state,
        a.postal_code,
        a.phone,
        a.created_at,
        CASE WHEN u.default_address_id = a.id THEN true ELSE false END as is_default
      FROM addresses a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = $1 AND a.user_id = $2`,
      [addressId, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: "Address not found or you don't have permission to view it" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        address: result.rows[0]
      }
    });

  } catch (error) {
    console.error("Get single address error:", error);
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 }
    );
  }
}