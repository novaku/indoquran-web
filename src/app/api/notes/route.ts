import { NextResponse } from 'next/server';
import { noteService, NoteInput } from '@/services/noteService';
import { auth } from "@/app/api/auth/[...nextauth]/route";

// GET /api/notes?surahId=xxx&ayatNumber=xxx
// Gets all public notes for a specific ayat
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surahId = searchParams.get('surahId');
    const ayatNumber = searchParams.get('ayatNumber');
    const userId = searchParams.get('userId');

    if (!surahId || !ayatNumber) {
      return NextResponse.json({ 
        success: false, 
        message: 'Surah ID and ayat number are required' 
      }, { status: 400 });
    }

    // If userId is provided, fetch that user's note for this ayat
    if (userId) {
      const note = await noteService.getUserNoteForAyat(
        userId,
        Number(surahId),
        Number(ayatNumber)
      );
      
      return NextResponse.json({
        success: true,
        data: note
      });
    }

    // Otherwise fetch all public notes for this ayat
    const notes = await noteService.getNotesByAyat(
      Number(surahId),
      Number(ayatNumber)
    );
    
    return NextResponse.json({
      success: true,
      data: notes
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve notes';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// POST /api/notes
// Creates a new note
export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.surah_id || body.ayat_number === undefined || !body.content) {
      return NextResponse.json({
        success: false,
        message: 'Incomplete data: surah_id, ayat_number, and content are required'
      }, { status: 400 });
    }
    
    const noteData: NoteInput = {
      user_id: session.user.id as string,
      surah_id: Number(body.surah_id),
      ayat_number: Number(body.ayat_number),
      content: body.content,
      is_public: body.is_public === true
    };
    
    const note = await noteService.createNote(noteData);
    
    return NextResponse.json({
      success: true,
      data: note,
      message: 'Note created successfully'
    }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// PATCH /api/notes
// Updates an existing note
export async function PATCH(request: Request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.note_id) {
      return NextResponse.json({
        success: false,
        message: 'Note ID is required'
      }, { status: 400 });
    }
    
    // Get the note by ID
    const existingNote = await noteService.getNoteById(body.note_id);
    
    if (!existingNote) {
      return NextResponse.json({
        success: false,
        message: 'Note not found'
      }, { status: 404 });
    }
    
    // Check if the user owns this note
    if (existingNote.user_id !== session.user.id) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update this note'
      }, { status: 403 });
    }
    
    const updateData: Partial<NoteInput> = {};
    
    if (body.content !== undefined) {
      updateData.content = body.content;
    }
    
    if (body.is_public !== undefined) {
      updateData.is_public = body.is_public;
    }
    
    const updated = await noteService.updateNote(body.note_id, updateData);
    
    return NextResponse.json({
      success: updated,
      message: updated ? 'Note updated successfully' : 'No changes were made'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
