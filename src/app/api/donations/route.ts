import { NextRequest, NextResponse } from 'next/server';
import { getDonations } from '@/services/donationService';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    
    console.log(`API: Fetching donation data for year=${year}, month=${month}`);
    
    // Use the service function to get donation data
    const donationData = await getDonations(year, month);
    
    // Add response headers for caching control and CORS
    const headers = new Headers();
    headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', '0');
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: donationData
    }, { 
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error fetching donation data:', error);
    
    // Include more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      success: false, 
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch donation data',
      details: errorMessage,
      path: request.nextUrl.pathname
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}
