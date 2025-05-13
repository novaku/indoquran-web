import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
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
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token tidak ditemukan' },
        { status: 400 }
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      
      // Check required fields
      if (!decoded.userId || !decoded.email) {
        logger.warn('Token validation failed: missing fields', { tokenFields: Object.keys(decoded) });
        return NextResponse.json(
          { valid: false, message: 'Token tidak valid' },
          { status: 400 }
        );
      }

      // Return success with email for display
      return NextResponse.json({
        valid: true,
        email: decoded.email
      });
    } catch (jwtError) {
      // Check if the error is due to token expiration
      if ((jwtError as Error).name === 'TokenExpiredError') {
        logger.warn('Token validation failed: expired token');
        return NextResponse.json(
          { valid: false, message: 'Token sudah kedaluwarsa' },
          { status: 400 }
        );
      }
      
      logger.warn('Token validation failed', { error: jwtError });
      return NextResponse.json(
        { valid: false, message: 'Token tidak valid' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error('Token validation error:', { error });
    return NextResponse.json(
      { valid: false, message: 'Terjadi kesalahan saat memproses permintaan' },
      { status: 500 }
    );
  }
}
