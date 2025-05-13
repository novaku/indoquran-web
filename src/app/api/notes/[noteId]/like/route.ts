// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/src/app/api/notes/[noteId]/like/route.ts
import { NextResponse } from 'next/server';
import { noteService } from '@/services/noteService';
import { auth } from "@/lib/auth";

// POST /api/notes/[noteId]/like
export async function POST(
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
    
    // Check if already liked
    const alreadyLiked = await noteService.checkIfUserLikedNote(
      noteId,
      session.user.id as string
    );
    
    if (alreadyLiked) {
      return NextResponse.json({
        success: false,
        message: 'You have already liked this note'
      }, { status: 400 });
    }
    
    const liked = await noteService.likeNote(noteId, session.user.id as string);
    
    return NextResponse.json({
      success: liked,
      message: liked ? 'Note liked successfully' : 'Failed to like note'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to like note';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// DELETE /api/notes/[noteId]/like
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
    
    const unliked = await noteService.unlikeNote(noteId, session.user.id as string);
    
    return NextResponse.json({
      success: unliked,
      message: unliked ? 'Note unliked successfully' : 'You have not liked this note'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to unlike note';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
