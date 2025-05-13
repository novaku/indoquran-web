// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/src/app/api/favorites/[userId]/[surahId]/[ayatNumber]/route.ts
import { NextResponse } from 'next/server';
import { favoriteService } from '@/services/favoriteService';

// GET /api/favorites/[userId]/[surahId]/[ayatNumber] - Check if verse is favorited
export async function GET(
  request: Request, 
  { params }: { params: Promise<{
    userId: string;
    surahId: string;
    ayatNumber: string;
  }> }
) {
  try {
    // Await the params object since it's a promise in Next.js 15
    const resolvedParams = await params;
    const { userId, surahId, ayatNumber } = resolvedParams;
    
    if (!userId || !surahId || !ayatNumber) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      }, { status: 400 });
    }
    
    const favorite = await favoriteService.checkFavorite(
      userId,
      Number(surahId),
      Number(ayatNumber)
    );
    
    return NextResponse.json({
      success: true,
      isFavorited: !!favorite,
      data: favorite || null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check favorite status';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// POST /api/favorites/[userId]/[surahId]/[ayatNumber] - Add a favorite
export async function POST(
  request: Request,
  { params }: { params: Promise<{
    userId: string;
    surahId: string;
    ayatNumber: string;
  }> }
) {
  try {
    const resolvedParams = await params;
    const { userId, surahId, ayatNumber } = resolvedParams;
    
    if (!userId || !surahId || !ayatNumber) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      }, { status: 400 });
    }
    
    const newFavorite = await favoriteService.addFavorite({
      user_id: userId,
      surah_id: Number(surahId),
      ayat_number: Number(ayatNumber)
    });
    
    return NextResponse.json({
      success: true,
      message: 'Favorite added successfully',
      data: newFavorite
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add favorite';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// DELETE /api/favorites/[userId]/[surahId]/[ayatNumber] - Remove a favorite
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{
    userId: string;
    surahId: string;
    ayatNumber: string;
  }> }
) {
  try {
    const resolvedParams = await params;
    const { userId, surahId, ayatNumber } = resolvedParams;
    
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
        message: 'Favorite not found or already deleted'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove favorite';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
