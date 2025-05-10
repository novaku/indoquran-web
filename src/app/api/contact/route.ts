import { NextRequest, NextResponse } from 'next/server';
import { saveContactMessage } from '@/services/contactService';
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Please fill all required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated
    let userId = null;
    const session = await auth();
    if (session && session.user) {
      userId = session.user.id;
    }
    
    // Save contact message
    const result = await saveContactMessage({
      name,
      email,
      subject,
      message,
      userId
    });
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Your message has been sent successfully' 
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// For admin panel to get all contact messages
export async function GET(request: NextRequest) {
  try {
    // Check if user is authorized (admin)
    const session = await auth();
    
    // Type-safe check for admin role
    if (!session?.user || !('role' in session.user) || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get page and limit from URL parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Import function here to avoid circular dependencies
    const { getContactMessages } = await import('@/services/contactService');
    
    const result = await getContactMessages(page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
