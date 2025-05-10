import { NextResponse } from 'next/server';
import { bookmarkService, BookmarkInput } from '@/services/bookmarkService';

// GET /api/bookmarks?userId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID pengguna diperlukan' 
      }, { status: 400 });
    }

    const bookmarks = await bookmarkService.getBookmarksByUser(userId);
    
    return NextResponse.json({
      success: true,
      data: bookmarks
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil data bookmark';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// POST /api/bookmarks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.surah_id || body.ayat_number === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak lengkap: user_id, surah_id, ayat_number diperlukan'
      }, { status: 400 });
    }
    
    const bookmarkData: BookmarkInput = {
      user_id: body.user_id,
      surah_id: Number(body.surah_id),
      ayat_number: Number(body.ayat_number),
      title: body.title || null,
      notes: body.notes || null
    };
    
    const bookmark = await bookmarkService.createBookmark(bookmarkData);
    
    return NextResponse.json({
      success: true,
      data: bookmark,
      message: 'Bookmark created successfully'
    }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create bookmark';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
