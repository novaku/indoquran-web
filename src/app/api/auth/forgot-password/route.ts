import { NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '@/lib/auth/db-utils';
import logger from '@/utils/logger';

// Ensure we're using environment variables for production
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-for-development';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@indoquran.com';
const EMAIL_SERVER = process.env.EMAIL_SERVER || 'smtp.example.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || 'user';
const EMAIL_PASS = process.env.EMAIL_PASS || 'password';

// Define the reset token expiry time (1 hour by default)
const RESET_TOKEN_EXPIRY = 60 * 60;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Check if email exists
    if (!email || email.trim() === '') {
      return NextResponse.json(
        { message: 'Email harus diisi' },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await getUserByEmail(email.toLowerCase());

    // For security reasons, don't reveal if the user exists or not
    if (!user) {
      // Still return a success message even if user doesn't exist
      logger.info('Password reset requested for non-existent email', { email });
      return NextResponse.json(
        { success: true, message: 'Link reset password telah dikirim ke email Anda jika akun dengan email ini terdaftar.' }
      );
    }

    // Generate a reset token
    const resetToken = jwt.sign(
      { 
        userId: user.user_id,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: RESET_TOKEN_EXPIRY }
    );
    
    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // Create transporter
    const transporter = createTransport({
      host: EMAIL_SERVER,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
    
    // Email template
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #5D4037; text-align: center;">Reset Password IndoQuran</h1>
        <p style="margin-top: 20px;">Assalamualaikum,</p>
        <p>Kami menerima permintaan untuk reset password akun IndoQuran Anda.</p>
        <p>Klik link di bawah ini untuk reset password Anda:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #8D6E63; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </p>
        <p>Link ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak meminta reset password, silakan abaikan email ini.</p>
        <p>Wassalamualaikum Wr. Wb.,</p>
        <p>Tim IndoQuran</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #E0E0E0;" />
        <p style="font-size: 12px; color: #757575; text-align: center;">
          Email ini dikirim secara otomatis, mohon tidak membalas email ini.
        </p>
      </div>
    `;
    
    // Send email
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: 'Reset Password IndoQuran',
      html: emailContent,
    });

    return NextResponse.json({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda.',
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memproses permintaan.' },
      { status: 500 }
    );
  }
}
