import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { auth } from '@/lib/auth';

// GET /api/notes/count?surahId=xxx&ayatNumber=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surahId = searchParams.get('surahId');
    const ayatNumber = searchParams.get('ayatNumber');
    
    // Get the authenticated user (if any)
    const session = await auth();
    const userId = session?.user?.id;

    if (!surahId || !ayatNumber) {
      return NextResponse.json({ 
        success: false, 
        message: 'Surah ID and ayat number are required' 
      }, { status: 400 });
    }

    // Count the number of notes for this ayat
    // For public API access, only count public notes
    const notes = await query({
      query: `
        SELECT COUNT(*) AS count 
        FROM ayat_notes 
        WHERE surah_id = ? AND ayat_number = ? AND is_public = 1
      `,
      values: [Number(surahId), Number(ayatNumber)]
    }) as [{ count: number }];
    
    return NextResponse.json({
      success: true,
      data: { count: notes[0]?.count || 0 }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve notes count';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
