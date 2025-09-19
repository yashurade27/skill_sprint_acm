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

    // Get all addresses for the user with default status
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
      WHERE a.user_id = $1 
      ORDER BY (CASE WHEN u.default_address_id = a.id THEN 0 ELSE 1 END), a.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        addresses: result.rows
      }
    });

  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}