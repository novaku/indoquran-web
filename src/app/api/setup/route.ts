import { NextResponse } from 'next/server';
import { initDatabase, testConnection } from '@/utils/db';

export async function GET() {
  try {
    // Test the database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to the database'
      }, { status: 500 });
    }
    
    // Initialize database tables
    const isInitialized = await initDatabase();
    if (!isInitialized) {
      return NextResponse.json({
        success: false, 
        message: 'Failed to initialize database tables'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'An error occurred during database initialization'
    }, { status: 500 });
  }
}
