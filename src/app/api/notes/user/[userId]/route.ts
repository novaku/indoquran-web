// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/src/app/api/notes/user/[userId]/route.ts
import { NextResponse } from 'next/server';
import { noteService } from '@/services/noteService';
import { auth } from "@/lib/auth";

// GET /api/notes/user/[userId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await the params object since it's a promise in Next.js 15
    const resolvedParams = await params;
    const userId = resolvedParams.userId;
    
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const includePrivate = url.searchParams.get('includePrivate') === 'true';
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const order = url.searchParams.get('order') || 'desc';
    const surahId = Number(url.searchParams.get('surahId')) || undefined;
    const ayatNumber = Number(url.searchParams.get('ayatNumber')) || undefined;
    
    // Determine if current user is requesting their own notes
    const isOwnNotes = session.user.id === userId;
    
    // Only include private notes if user is requesting their own notes
    const finalIncludePrivate = isOwnNotes && includePrivate;
    
    // Get notes directly using the available getNotesByUser function
    // This returns an array of notes, not a paginated result
    const notes = await noteService.getNotesByUser(userId);
    
    return NextResponse.json({
      success: true,
      data: {
        notes: notes,
        pagination: {
          total: notes.length,
          page: 1,
          limit: notes.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user notes';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
