import { NextResponse } from 'next/server';
import { noteService } from '@/services/noteService';
import { auth } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
  params: {
    userId: string;
  }
}

// GET /api/notes/user/[userId]
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    // Await the params object before destructuring
    const paramsObj = await params;
    const userId = paramsObj.userId;
    
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // Users should only be able to access their own notes
    if (session.user.id !== userId) {
      return NextResponse.json({
        success: false,
        message: 'You can only access your own notes'
      }, { status: 403 });
    }
    
    // Get all notes for the user
    const notes = await noteService.getNotesByUser(userId);
    
    // For each note, get the surah name to display in the UI
    const notesWithSurahInfo = await Promise.all(notes.map(async (note) => {
      try {
        // Fetch surah data (You might want to use a more efficient approach like batch loading)
        const surahResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surah/${note.surah_id}`);
        const surahData = await surahResponse.json();
        
        return {
          ...note,
          surah_name: surahData.name_latin || `Surah ${note.surah_id}`,
          surah_name_arabic: surahData.name_arabic || ''
        };
      } catch (error) {
        // If there's an error fetching surah data, just return the note as is
        return {
          ...note,
          surah_name: `Surah ${note.surah_id}`,
          surah_name_arabic: ''
        };
      }
    }));
    
    return NextResponse.json({
      success: true,
      data: notesWithSurahInfo
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve user notes';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
