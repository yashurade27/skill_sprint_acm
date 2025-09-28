import { NextResponse } from "next/server";

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    // Log database URL details (without exposing credentials)
    const urlInfo = databaseUrl ? {
      exists: true,
      protocol: databaseUrl.split('://')[0],
      length: databaseUrl.length,
      hasCredentials: databaseUrl.includes('@'),
      // Extract host without credentials for debugging
      host: databaseUrl.includes('@') 
        ? databaseUrl.split('@')[1]?.split('/')[0] 
        : 'No host found'
    } : {
      exists: false
    };

    console.log('Database URL Info:', urlInfo);

    return NextResponse.json({
      success: true,
      database: {
        configured: !!databaseUrl,
        urlInfo,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Database config check error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}