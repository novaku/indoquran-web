// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/src/app/api/contact/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateContactStatus } from '@/services/contactService';
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await auth();
    
    // Any authenticated user can now update status since admin has been removed
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get contact ID from params
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid contact ID' },
        { status: 400 }
      );
    }
    
    // Get status from request body
    const body = await request.json();
    
    if (!body || typeof body.status !== 'string' || !['pending', 'processed', 'completed', 'archived'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be one of: pending, processed, completed, archived' },
        { status: 400 }
      );
    }
    
    // Update the contact status
    const result = await updateContactStatus(Number(id), body.status);
    
    if (result) {
      return NextResponse.json({ 
        success: true,
        message: `Contact status updated to ${body.status}`
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update contact status' },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
