import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import logger from '@/utils/logger';

// Ensure we're using environment variables for production
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-for-development';

interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // Check if token and password are provided
    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token dan password harus diisi' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password harus memiliki minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Verify token
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { message: 'Token tidak valid atau sudah kedaluwarsa' },
        { status: 400 }
      );
    }

    // Extract user ID from token
    const { userId, email } = decodedToken;
    
    // Create database connection
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    
    try {
      // Find the user
      const selectQuery = 'SELECT * FROM users WHERE user_id = ?';
      logger.debug(selectQuery, [userId]);
      
      const [rows]: [any[], any] = await conn.execute(selectQuery, [userId]);
      const user = rows[0];
      
      if (!user || user.email !== email) {
        await conn.end();
        return NextResponse.json(
          { message: 'Token tidak valid atau pengguna tidak ditemukan' },
          { status: 404 }
        );
      }
  
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Update user's password
      const updateQuery = 'UPDATE users SET password = ? WHERE user_id = ?';
      logger.debug(updateQuery, ['[REDACTED]', userId]);
      
      await conn.execute(updateQuery, [hashedPassword, userId]);
      await conn.end();
      
      logger.info('Password successfully reset', { userId });
    } catch (error) {
      logger.error('Database error during password reset', { error, userId });
      await conn.end();
      return NextResponse.json(
        { message: 'Terjadi kesalahan saat memproses permintaan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah',
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memproses permintaan' },
      { status: 500 }
    );
  }
}
