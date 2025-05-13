import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/auth/db-utils';
import logger from '@/utils/logger';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Nama, email, dan password harus diisi'
      }, { status: 400 });
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Format email tidak valid'
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      logger.info('Registration attempt with existing email', { email });
      return NextResponse.json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login'
      }, { status: 409 });
    }
    
    // Create new user
    const user = await createUser({
      name,
      email,
      password,
      provider: 'credentials'
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Gagal membuat akun'
      }, { status: 500 });
    }
    
    // Return success without password
    const { password: _, ...userWithoutPassword } = user;
    
    logger.info('New user registered successfully', { email });
    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil',
      data: userWithoutPassword
    });
    
  } catch (error: any) {
    logger.error('Error registering user:', { error });
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat mendaftar: ' + (error.message || 'Unknown error')
    }, { status: 500 });
  }
}
