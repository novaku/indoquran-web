import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreatePrayerResponseRequest } from '@/types/prayer';
import { sanitizeHtml } from '@/utils/securityUtils';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const prayerId = parseInt(resolvedParams.id);

    // Get prayer details
    const [prayers] = await db.execute(
      `SELECT 
        p.id, p.author_name as authorName, p.content, p.user_id as userId, 
        p.created_at as createdAt, p.updated_at as updatedAt,
        ps.amiin_count as amiinCount, ps.comment_count as commentCount
      FROM prayers p
      LEFT JOIN prayer_stats ps ON p.id = ps.prayer_id
      WHERE p.id = ?`,
      [prayerId]
    );

    const prayerRows = prayers as any[];
    if (!prayerRows || prayerRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Prayer not found'
      }, { status: 404 });
    }

    const prayer = prayerRows[0];

    // Get user session to determine if they said Amiin already
    const session = await auth();
    let currentUserSaidAmiin = false;

    if (session?.user?.id) {
      const [amiinResults] = await db.execute(
        `SELECT id FROM prayer_responses WHERE prayer_id = ? AND user_id = ? AND response_type = 'amiin'`,
        [prayerId, session.user.id]
      );
      const amiinRows = amiinResults as any[];
      currentUserSaidAmiin = amiinRows.length > 0;
    }

    // Get the prayer comments
    const [comments] = await db.execute(
      `SELECT 
        c.id, c.content, c.user_id as userId, c.author_name as authorName,
        c.created_at as createdAt, c.updated_at as updatedAt
      FROM prayer_responses c
      WHERE c.prayer_id = ? AND c.response_type = 'comment'
      ORDER BY c.created_at DESC`,
      [prayerId]
    );

    return NextResponse.json({
      success: true,
      data: {
        prayer: {
          ...prayer,
          currentUserSaidAmiin
        },
        comments: comments || []
      }
    });

  } catch (error) {
    console.error('Error fetching prayer:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch prayer'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const prayerId = parseInt(resolvedParams.id);
    const body = await request.json() as CreatePrayerResponseRequest;
    
    // Get user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Determine response type (amiin or comment)
    const responseType = body.responseType === 'amiin' ? 'amiin' : 'comment';
    
    // Sanitize and validate the content
    const content = sanitizeHtml(body.content);
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Content is required'
      }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({
        success: false,
        message: 'Content must be less than 500 characters'
      }, { status: 400 });
    }

    // Check if prayer exists
    const [prayers] = await db.execute(
      `SELECT id FROM prayers WHERE id = ?`,
      [prayerId]
    );
    const prayerRows = prayers as any[];
    
    if (!prayerRows || prayerRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Prayer not found'
      }, { status: 404 });
    }

    // Determine author name
    let authorName = body.authorName || 'Anonymous';
    // Check if user has a name and no author name was provided (implicit use of display name)
    if (!body.authorName && session.user.name) {
      authorName = session.user.name;
    }

    // Handle parent ID for comment replies
    const parentId = responseType === 'comment' && body.parentId ? body.parentId : null;

    // Create the response (amiin or comment)
    const now = new Date();
    const [result] = await db.execute(
      `INSERT INTO prayer_responses (prayer_id, user_id, author_name, content, response_type, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [prayerId, session.user.id, authorName, content, responseType, parentId, now, now]
    );
    
    const insertResult = result as any;
    const responseId = insertResult.insertId;

    // Update the appropriate count based on response type
    if (responseType === 'amiin') {
      await db.execute(
        `INSERT INTO prayer_stats (prayer_id, amiin_count, comment_count)
        VALUES (?, 1, 0)
        ON DUPLICATE KEY UPDATE amiin_count = amiin_count + 1`,
        [prayerId]
      );
    } else {
      await db.execute(
        `INSERT INTO prayer_stats (prayer_id, comment_count, amiin_count)
        VALUES (?, 1, 0)
        ON DUPLICATE KEY UPDATE comment_count = comment_count + 1`,
        [prayerId]
      );
    }

    // Return the created response
    return NextResponse.json({
      success: true,
      message: responseType === 'amiin' ? 'Amiin added successfully' : 'Comment added successfully',
      data: {
        id: responseId,
        prayerId,
        userId: session.user.id,
        authorName,
        content,
        responseType,
        parentId,
        createdAt: now,
        updatedAt: now
      }
    });

  } catch (error) {
    console.error('Error adding prayer response:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add response to prayer'
    }, { status: 500 });
  }
}
