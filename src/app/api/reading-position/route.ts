import { NextResponse } from 'next/server';
import mysql from "mysql2/promise";

// GET /api/reading-position?userId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID pengguna diperlukan' 
      }, { status: 400 });
    }

    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    const [rows] = await conn.execute(
      `SELECT * FROM reading_positions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    await conn.end();

    const readingPosition = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    
    return NextResponse.json({
      success: true,
      data: readingPosition
    });
  } catch (error: any) {
    console.error('Error fetching reading position:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Gagal mengambil posisi membaca'
    }, { status: 500 });
  }
}

// POST /api/reading-position
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.surah_id || body.ayat_number === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak lengkap: user_id, surah_id, ayat_number diperlukan'
      }, { status: 400 });
    }

    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    // Check if a reading position exists for this user
    const [existingRows] = await conn.execute(
      `SELECT * FROM reading_positions WHERE user_id = ?`,
      [body.user_id]
    );

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      // Update existing position
      await conn.execute(
        `UPDATE reading_positions SET 
         surah_id = ?, 
         ayat_number = ?, 
         updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [body.surah_id, body.ayat_number, body.user_id]
      );
    } else {
      // Insert new position
      await conn.execute(
        `INSERT INTO reading_positions (user_id, surah_id, ayat_number) 
         VALUES (?, ?, ?)`,
        [body.user_id, body.surah_id, body.ayat_number]
      );
    }

    // Get the updated reading position
    const [rows] = await conn.execute(
      `SELECT * FROM reading_positions WHERE user_id = ?`,
      [body.user_id]
    );

    await conn.end();
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(rows) && rows.length > 0 ? rows[0] : null,
      message: 'Posisi membaca berhasil disimpan'
    });
  } catch (error: any) {
    console.error('Error saving reading position:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Gagal menyimpan posisi membaca'
    }, { status: 500 });
  }
}
