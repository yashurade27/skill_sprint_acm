import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
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
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const result = await query(
      `SELECT 
        id,
        email,
        phone,
        role,
        email_verified,
        first_name,
        last_name,
        COALESCE(NULLIF(CONCAT(first_name, ' ', last_name), ' '), email) as display_name
      FROM users 
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error("Get single user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
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
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'user' or 'admin'" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentUser = existingUser.rows[0];

    // Prevent admin from demoting themselves
    if (parseInt(session.user.id!) === userId && role === "user") {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // Update the user role
    const result = await query(
      `UPDATE users 
       SET role = $1
       WHERE id = $2
       RETURNING id, email, phone, role, email_verified, first_name, last_name`,
      [role, userId]
    );

    const updatedUser = result.rows[0];

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
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
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentUser = existingUser.rows[0];

    // Prevent admin from deleting themselves
    if (parseInt(session.user.id!) === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user has orders
    const orderCheck = await query(
      "SELECT COUNT(*) as count FROM orders WHERE user_id = $1",
      [userId]
    );

    const orderCount = parseInt(orderCheck.rows[0].count);
    if (orderCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete user. They have ${orderCount} order(s). Consider deactivating instead.` },
        { status: 400 }
      );
    }

    // Safe to delete - no order references
    await query("DELETE FROM users WHERE id = $1", [userId]);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}