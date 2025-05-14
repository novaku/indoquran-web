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
    
    // Parse pagination parameters from query string
    const url = new URL(request.url);
    const commentPage = Math.max(1, parseInt(url.searchParams.get('commentPage') || '1', 10));
    const commentsPerPage = Math.max(1, Math.min(50, parseInt(url.searchParams.get('commentsPerPage') || '10', 10)));

    // Get prayer details with counts directly from prayer_responses
    const [prayers] = await db.execute(
      `SELECT 
        p.id, p.author_name as authorName, p.content, p.user_id as userId, 
        p.created_at as createdAt, p.updated_at as updatedAt,
        COALESCE((SELECT COUNT(*) FROM prayer_responses WHERE prayer_id = p.id AND response_type = 'amiin'), 0) as amiinCount,
        COALESCE((SELECT COUNT(*) FROM prayer_responses WHERE prayer_id = p.id AND response_type = 'comment'), 0) as commentCount
      FROM prayers p
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

    // Get the comment count for pagination
    const [countResult] = await db.execute(
      `SELECT COUNT(*) AS total FROM prayer_responses 
       WHERE prayer_id = ? AND response_type = 'comment'`,
      [prayerId]
    );
    
    const countRows = countResult as any[];
    const totalComments = parseInt(countRows[0]?.total?.toString() || '0', 10);
    const totalCommentPages = Math.max(1, Math.ceil(totalComments / commentsPerPage));
    
    // Calculate offset for pagination
    const offset = (commentPage - 1) * commentsPerPage;

    // Get the prayer comments with pagination
    // MySQL prepared statements don't support parameter placeholders for LIMIT and OFFSET
    // We need to explicitly include these values in the query
    const commentQuery = `
      SELECT 
        c.id, c.content, c.user_id as userId, c.author_name as authorName,
        c.created_at as createdAt, c.updated_at as updatedAt, 
        c.parent_id as parentId, c.response_type as responseType,
        c.prayer_id as prayerId
      FROM prayer_responses c
      WHERE c.prayer_id = ? AND c.response_type = 'comment'
      ORDER BY c.created_at DESC
      LIMIT ${commentsPerPage} OFFSET ${offset}
    `;
    
    console.log('Fetching comments with query:', commentQuery.replace('${commentsPerPage}', commentsPerPage.toString()).replace('${offset}', offset.toString()), [prayerId]);
    
    const [comments] = await db.execute(
      commentQuery, 
      [prayerId]
    );

    const commentsArray = Array.isArray(comments) ? comments : [];
    
    const response = {
      success: true,
      data: {
        prayer: {
          ...prayer,
          currentUserSaidAmiin
        },
        comments: commentsArray,
        pagination: {
          currentPage: commentPage,
          totalPages: totalCommentPages,
          totalComments,
          commentsPerPage
        }
      }
    };
    
    console.log('API Response structure:', JSON.stringify({
      success: response.success,
      data: {
        prayerIsPresent: !!response.data.prayer,
        commentCount: commentsArray.length,
        paginationIsPresent: !!response.data.pagination
      }
    }));
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching prayer:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch prayer',
      error: error instanceof Error ? error.message : 'Unknown error'
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
    
    // For prayers responses (amiin/comments), we'll allow guest users
    // but still use the session if available
    const userId = session?.user?.id || null;

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
    if (!body.authorName && session?.user?.name) {
      authorName = session.user.name;
    }

    // Handle parent ID for comment replies
    const parentId = responseType === 'comment' && body.parentId ? body.parentId : null;

    // Create the response (amiin or comment)
    const now = new Date();
    const [result] = await db.execute(
      `INSERT INTO prayer_responses (prayer_id, user_id, author_name, content, response_type, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [prayerId, userId, authorName, content, responseType, parentId, now, now]
    );
    
    const insertResult = result as any;
    const responseId = insertResult.insertId;

    // Return the created response
    return NextResponse.json({
      success: true,
      message: responseType === 'amiin' ? 'Amiin added successfully' : 'Comment added successfully',
      data: {
        id: responseId,
        prayerId,
        userId,
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
    
    // Check for specific database error about prayer_stats table
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('prayer_stats') || errorMessage.includes('Table') && errorMessage.includes('doesn\'t exist')) {
      console.error('Database schema error: The prayer_stats table no longer exists. This is likely due to cached queries or outdated build.');
      return NextResponse.json({
        success: false,
        message: 'Database schema error. Please contact the administrator.',
        error: 'prayer_stats_table_removed',
        details: errorMessage
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to add response to prayer',
      error: errorMessage
    }, { status: 500 });
  }
}
