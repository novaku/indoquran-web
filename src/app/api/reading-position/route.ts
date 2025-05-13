import { NextResponse } from 'next/server';
import mysql from "mysql2/promise";
import logger from '@/utils/logger';

// GET /api/reading-position?userId=xxx
export async function GET(request: Request) {
  let conn;
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID pengguna diperlukan' 
      }, { status: 400 });
    }

    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    const query = `SELECT * FROM reading_positions WHERE user_id = ? ORDER BY last_read DESC LIMIT 1`;
    const params = [userId];
    
    // Execute query
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(query, params);

    const readingPosition = rows.length > 0 ? rows[0] as mysql.RowDataPacket : null;
    
    logger.info('Reading position fetched', { 
      userId, 
      found: !!readingPosition,
      surahId: readingPosition ? readingPosition.surah_id : null,
      ayatNumber: readingPosition ? readingPosition.ayat_number : null
    });
    
    return NextResponse.json({
      success: true,
      data: readingPosition
    });
  } catch (error: any) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    logger.error('Error fetching reading position:', { userId, error });
    return NextResponse.json({
      success: false,
      message: error.message || 'Gagal mengambil posisi membaca'
    }, { status: 500 });
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (closeError) {
        logger.error('Error closing database connection:', closeError);
      }
    }
  }
}

// POST /api/reading-position
export async function POST(request: Request) {
  let conn;
  try {
    const body = await request.json();
    
    logger.info('Reading position update request received', body);
    
    // Validate required fields
    if (!body.user_id || !body.surah_id || body.ayat_number === undefined) {
      logger.error('Invalid reading position data', body);
      return NextResponse.json({
        success: false,
        message: 'Data tidak lengkap: user_id, surah_id, ayat_number diperlukan'
      }, { status: 400 });
    }

    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    // Check if a reading position exists for this user
    const checkQuery = `SELECT * FROM reading_positions WHERE user_id = ?`;
    logger.debug(checkQuery, [body.user_id]);
    
    const [existingRows] = await conn.execute(checkQuery, [body.user_id]);

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      // Update existing position
      logger.info('Updating existing reading position for user', { userId: body.user_id });
      
      const updateQuery = `UPDATE reading_positions SET 
         surah_id = ?, 
         ayat_number = ?, 
         last_read = CURRENT_TIMESTAMP 
         WHERE user_id = ?`;
      const updateParams = [body.surah_id, body.ayat_number, body.user_id];
      
      logger.debug(updateQuery, updateParams);
      await conn.execute(updateQuery, updateParams);
    } else {
      // Insert new position
      logger.info('Creating new reading position for user', { userId: body.user_id });
      
      const insertQuery = `INSERT INTO reading_positions (user_id, surah_id, ayat_number, last_read) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;
      const insertParams = [body.user_id, body.surah_id, body.ayat_number];
      
      logger.debug(insertQuery, insertParams);
      await conn.execute(insertQuery, insertParams);
    }

    // Get the updated reading position
    const selectQuery = `SELECT * FROM reading_positions WHERE user_id = ?`;
    logger.debug(selectQuery, [body.user_id]);
    
    const [rows] = await conn.execute(selectQuery, [body.user_id]);
    
    logger.info('Reading position updated successfully', {
      userId: body.user_id,
      surahId: body.surah_id,
      ayatNumber: body.ayat_number
    });
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(rows) && rows.length > 0 ? rows[0] : null,
      message: 'Posisi membaca berhasil disimpan'
    });
  } catch (error: any) {
    logger.error('Error saving reading position:', { error });
    return NextResponse.json({
      success: false,
      message: error.message || 'Gagal menyimpan posisi membaca'
    }, { status: 500 });
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (closeError) {
        logger.error('Error closing database connection:', closeError);
      }
    }
  }
}
