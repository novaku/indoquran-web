import { NextResponse } from 'next/server';
import { favoriteService, FavoriteInput } from '@/services/favoriteService';

// GET /api/favorites?userId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID is required' 
      }, { status: 400 });
    }

    const favorites = await favoriteService.getFavoritesByUser(userId);
    
    return NextResponse.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch favorites';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// POST /api/favorites
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.surah_id || body.ayat_number === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: user_id, surah_id, ayat_number'
      }, { status: 400 });
    }
    
    const favoriteData: FavoriteInput = {
      user_id: body.user_id,
      surah_id: Number(body.surah_id),
      ayat_number: Number(body.ayat_number)
    };
    
    const favorite = await favoriteService.addFavorite(favoriteData);
    
    return NextResponse.json({
      success: true,
      data: favorite,
      message: 'Verse added to favorites successfully'
    }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add verse to favorites';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
