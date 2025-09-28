import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";

export async function GET() {
  try {
    const isDbHealthy = await checkDatabaseHealth();
    
    return NextResponse.json({
      success: true,
      status: "healthy",
      database: isDbHealthy ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check error:", error);
    
    return NextResponse.json({
      success: false,
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}