import { NextResponse } from 'next/server';
import { noteService } from '@/services/noteService';
import { auth } from "@/app/api/auth/[...nextauth]/route";

// DELETE /api/notes/[noteId]
export async function DELETE(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = Number(params.noteId);
    
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // First get the note
    const note = await noteService.getNoteById(noteId);
    
    if (!note) {
      return NextResponse.json({
        success: false,
        message: 'Note not found'
      }, { status: 404 });
    }
    
    // Check if this note belongs to the user
    const userNote = note.user_id === session.user.id;
    
    if (!userNote) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to delete this note'
      }, { status: 403 });
    }
    
    const deleted = await noteService.deleteNote(noteId);
    
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Note deleted successfully' : 'Failed to delete note'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
