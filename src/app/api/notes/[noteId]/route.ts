// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/src/app/api/notes/[noteId]/route.ts
import { NextResponse } from 'next/server';
import { noteService } from '@/services/noteService';
import { auth } from "@/lib/auth";

// DELETE /api/notes/[noteId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const resolvedParams = await params;
    const noteId = Number(resolvedParams.noteId);
    
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // Check if the note exists
    const note = await noteService.getNoteById(noteId);
    if (!note) {
      return NextResponse.json({
        success: false,
        message: 'Note not found'
      }, { status: 404 });
    }
    
    // Verify ownership (only note owner can delete their note)
    if (note.user_id !== session.user.id) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to delete this note'
      }, { status: 403 });
    }
    
    // Delete the note
    const deleted = await noteService.deleteNote(noteId);
    
    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Note deleted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete note'
      }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
