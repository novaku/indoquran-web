import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { auth } from "@/app/api/auth/[...nextauth]/route";

// Only admins can run this migration script
export async function GET(request: NextRequest) {
  try {
    // Check if user is authorized (admin)
    const session = await auth();
    
    // Type-safe check for admin role
    if (!session?.user || !('role' in session.user) || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access only' },
        { status: 401 }
      );
    }
    
    // Create contacts table if it doesn't exist
    await query({
      query: `
        CREATE TABLE IF NOT EXISTS contacts (
          contact_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          subject VARCHAR(200) NOT NULL,
          message TEXT NOT NULL,
          user_id VARCHAR(36) NULL,
          status ENUM('unread', 'read', 'replied', 'archived') DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    });
    
    // Create indexes for better performance
    // MySQL doesn't support IF NOT EXISTS for indexes, so we need a different approach
    try {
      await query({ query: 'CREATE INDEX idx_contacts_email ON contacts(email);' });
    } catch (err) {
      console.log('Email index might already exist, continuing...');
    }
    
    try {
      await query({ query: 'CREATE INDEX idx_contacts_status ON contacts(status);' });
    } catch (err) {
      console.log('Status index might already exist, continuing...');
    }
    
    try {
      await query({ query: 'CREATE INDEX idx_contacts_created_at ON contacts(created_at);' });
    } catch (err) {
      console.log('Created_at index might already exist, continuing...');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contacts table initialized successfully' 
    });
  } catch (error: any) {
    console.error('Error initializing contacts table:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize contacts table' },
      { status: 500 }
    );
  }
}
