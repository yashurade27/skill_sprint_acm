import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      success: true,
      session: {
        exists: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          idType: typeof session.user.id
        } : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Session test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}