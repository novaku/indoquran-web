import { NextResponse } from 'next/server';
import { favoriteService } from '@/services/favoriteService';

interface RouteParams {
  params: {
    userId: string;
    surahId: string;
    ayatNumber: string;
  }
}

// GET /api/favorites/[userId]/[surahId]/[ayatNumber] - Check if verse is favorited
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId, surahId, ayatNumber } = params;
    
    if (!userId || !surahId || !ayatNumber) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      }, { status: 400 });
    }
    
    const isFavorite = await favoriteService.checkFavorite(
      userId,
      Number(surahId),
      Number(ayatNumber)
    );
    
    return NextResponse.json({
      success: true,
      data: { isFavorite }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to check favorite status'
    }, { status: 500 });
  }
}

// DELETE /api/favorites/[userId]/[surahId]/[ayatNumber] - Remove from favorites
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId, surahId, ayatNumber } = params;
    
    if (!userId || !surahId || !ayatNumber) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      }, { status: 400 });
    }
    
    const removed = await favoriteService.removeFavorite(
      userId,
      Number(surahId),
      Number(ayatNumber)
    );
    
    if (!removed) {
      return NextResponse.json({
        success: false,
        message: 'Favorite not found or already removed'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verse removed from favorites successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to remove verse from favorites'
    }, { status: 500 });
  }
}
