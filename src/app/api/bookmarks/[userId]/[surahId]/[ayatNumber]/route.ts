import { NextResponse } from 'next/server';
import { bookmarkService } from '@/services/bookmarkService';

interface RouteParams {
  params: {
    userId: string;
    surahId: string;
    ayatNumber: string;
  }
}

// GET /api/bookmarks/[userId]/[surahId]/[ayatNumber]
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
    
    const bookmark = await bookmarkService.getBookmark(
      userId,
      Number(surahId),
      Number(ayatNumber)
    );
    
    if (!bookmark) {
      return NextResponse.json({
        success: false,
        message: 'Bookmark not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookmark';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// DELETE /api/bookmarks/[userId]/[surahId]/[ayatNumber]
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId, surahId, ayatNumber } = params;
    
    if (!userId || !surahId || !ayatNumber) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      }, { status: 400 });
    }
    
    const deleted = await bookmarkService.deleteBookmark(
      userId,
      Number(surahId),
      Number(ayatNumber)
    );
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Bookmark not found or already deleted'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete bookmark';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// PUT /api/bookmarks/[userId]/[surahId]/[ayatNumber]
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // Await the params object before destructuring
    const paramsObj = await params;
    const { userId, surahId, ayatNumber } = paramsObj;
    const body = await request.json();
    
    if (!userId || !surahId || !ayatNumber) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      }, { status: 400 });
    }
    
    // First, check if the bookmark exists
    const bookmark = await bookmarkService.getBookmark(
      userId,
      Number(surahId),
      Number(ayatNumber)
    );
    
    if (!bookmark) {
      return NextResponse.json({
        success: false,
        message: 'Bookmark not found'
      }, { status: 404 });
    }
    
    // Update the bookmark
    const updated = await bookmarkService.updateBookmark(bookmark.bookmark_id, {
      title: body.title,
      notes: body.notes
    });
    
    if (!updated) {
      return NextResponse.json({
        success: false,
        message: 'No changes were made'
      }, { status: 400 });
    }
    
    // Get the updated bookmark
    const updatedBookmark = await bookmarkService.getBookmark(
      userId,
      Number(surahId),
      Number(ayatNumber)
    );
    
    return NextResponse.json({
      success: true,
      data: updatedBookmark,
      message: 'Bookmark updated successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update bookmark';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
