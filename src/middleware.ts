import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Middleware functionality
  // Admin routes have been removed
  return NextResponse.next();
}

// Export an empty config as we no longer need to match admin routes
export const config = {
  // Add matchers for any routes that need middleware protection
};
