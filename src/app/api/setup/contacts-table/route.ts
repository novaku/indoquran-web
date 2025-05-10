import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/db';

export async function GET(request: NextRequest) {
  try {
    // Check setup secret to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const setupSecret = searchParams.get('setupSecret');
    const expectedSecret = process.env.SETUP_SECRET;
    
    if (!setupSecret || setupSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Execute the SQL to create the contacts table
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
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
        CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
        CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
      `
    });
    
    return NextResponse.json({
      success: true,
      message: 'Contacts table setup completed successfully'
    });
  } catch (error: any) {
    console.error('Setup contacts table error:', error);
    return NextResponse.json(
      { error: error.message || 'Setup contacts table failed' },
      { status: 500 }
    );
  }
}
