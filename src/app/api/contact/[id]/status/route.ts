import { NextRequest, NextResponse } from 'next/server';
import { updateContactStatus } from '@/services/contactService';
import { auth } from "@/app/api/auth/[...nextauth]/route";

interface Params {
  params: {
    id: string;
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
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
    
    const contactId = parseInt(params.id, 10);
    if (isNaN(contactId)) {
      return NextResponse.json(
        { error: 'Invalid contact ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { status } = body;
    
    if (!status || !['unread', 'read', 'replied', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    const result = await updateContactStatus(
      contactId, 
      status as 'unread' | 'read' | 'replied' | 'archived'
    );
    
    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Contact not found or status not updated' },
        { status: 404 }
      );
    }
    
  } catch (error: any) {
    console.error('Error updating contact status:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
