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
    // Await the params object before destructuring
    const paramsObj = await params;
    const { userId, surahId, ayatNumber } = paramsObj;
    
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check favorite status';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// DELETE /api/favorites/[userId]/[surahId]/[ayatNumber] - Remove from favorites
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Await the params object before destructuring
    const paramsObj = await params;
    const { userId, surahId, ayatNumber } = paramsObj;
    
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove verse from favorites';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
