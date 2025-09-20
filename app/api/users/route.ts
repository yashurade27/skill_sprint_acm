import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        id,
        email,
        phone,
        role,
        email_verified,
        first_name,
        last_name,
        COALESCE(NULLIF(CONCAT(first_name, ' ', last_name), ' '), email) as display_name
      FROM users
    `;

    const whereConditions = [];
    const params: any[] = [];
    let paramCount = 0;

    // Search in email or name
    if (search) {
      paramCount++;
      whereConditions.push(`(email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    // Filter by role
    if (role && role !== "all") {
      paramCount++;
      whereConditions.push(`role = $${paramCount}`);
      params.push(role);
    }

    // Add WHERE clause if we have conditions
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Add ordering and pagination
    sql += ` ORDER BY id DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM users`;
    
    if (whereConditions.length > 0) {
      countSql += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    const countResult = await query(countSql, params.slice(0, -2)); // Remove limit and offset
    const totalUsers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          page,
          limit,
          totalUsers,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}