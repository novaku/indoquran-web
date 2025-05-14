import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { sanitizeHtml } from '@/utils/securityUtils';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters with more robust parsing
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Safer SQL construction with predefined valid sort options
    let orderClause;
    switch (sortBy) {
      case 'oldest':
        orderClause = 'p.created_at ASC';
        break;
      case 'most_amiin':
        orderClause = '(SELECT COUNT(*) FROM prayer_responses WHERE prayer_id = p.id AND response_type = "amiin") DESC, p.created_at DESC';
        break;
      case 'most_comments':
        orderClause = '(SELECT COUNT(*) FROM prayer_responses WHERE prayer_id = p.id AND response_type = "comment") DESC, p.created_at DESC';
        break;
      case 'recent_activity':
        orderClause = '(SELECT MAX(created_at) FROM prayer_responses WHERE prayer_id = p.id) DESC, p.created_at DESC';
        break;
      default: // 'newest' is default
        orderClause = 'p.created_at DESC';
    }

    console.log(`Fetching prayers with sort: ${sortBy}, page: ${page}, limit: ${limit}`);
    
    // Get prayers with pagination - use direct values for LIMIT and OFFSET instead of parameters
    const query = `
      SELECT 
        p.id, 
        p.author_name AS authorName, 
        p.content, 
        p.user_id AS userId, 
        p.created_at AS createdAt, 
        p.updated_at AS updatedAt,
        COALESCE((SELECT COUNT(*) FROM prayer_responses WHERE prayer_id = p.id AND response_type = 'amiin'), 0) AS amiinCount,
        COALESCE((SELECT COUNT(*) FROM prayer_responses WHERE prayer_id = p.id AND response_type = 'comment'), 0) AS commentCount
      FROM prayers p
      ORDER BY ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Log the query
    console.log('SQL Query:', query);
    
    const [prayersResult] = await db.execute(query, []);
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) AS total FROM prayers`;
    console.log('SQL Count Query:', countQuery);
    const [countResult] = await db.execute(countQuery, []);
    
    const countRows = countResult as any[];
    const total = parseInt(countRows[0]?.total?.toString() || '0', 10);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Ensure we're returning an array even if DB returns something unexpected
    const prayers = Array.isArray(prayersResult) ? prayersResult : [];

    // Return response with explicit formatting
    return NextResponse.json({
      success: true,
      prayers,
      totalPages,
      totalPrayers: total,
      currentPage: page
    });
    
  } catch (error) {
    console.error('Error fetching prayers:', error);
    // Return detailed error for debugging (consider removing in production)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch prayers',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { authorName, content } = body;
    
    // Sanitize and validate content
    const sanitizedContent = sanitizeHtml(content);
    
    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Content is required'
      }, { status: 400 });
    }

    if (sanitizedContent.length > 1000) {
      return NextResponse.json({
        success: false,
        message: 'Content must be less than 1000 characters'
      }, { status: 400 });
    }

    // Create new prayer
    const now = new Date();
    const insertQuery = `INSERT INTO prayers (user_id, author_name, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`;
    
    // Log the complete query with parameter values
    console.log('SQL Insert Query:', insertQuery.replace('?', `'${session.user.id}'`)
      .replace('?', `'${authorName || 'Anonymous'}'`)
      .replace('?', `'${sanitizedContent}'`)
      .replace('?', `'${now.toISOString()}'`)
      .replace('?', `'${now.toISOString()}'`));
    
    const [result] = await db.execute(insertQuery, 
      [session.user.id, authorName || 'Anonymous', sanitizedContent, now, now]
    );
    
    const insertResult = result as any;
    const prayerId = insertResult.insertId;

    // No need to initialize stats since we're counting directly from prayer_responses

    return NextResponse.json({
      success: true,
      message: 'Prayer created successfully',
      prayer: {
        id: prayerId,
        userId: session.user.id,
        authorName: authorName || 'Anonymous',
        content: sanitizedContent,
        createdAt: now,
        updatedAt: now,
        amiinCount: 0,
        commentCount: 0
      }
    });
  } catch (error) {
    console.error('Error creating prayer:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create prayer'
    }, { status: 500 });
  }
}