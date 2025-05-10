import { NextRequest, NextResponse } from 'next/server';
import { auth } from './app/api/auth/[...nextauth]/route';

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();

    // Protected routes that require authentication
    const isProtectedRoute = 
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/dashboard');

    if (isProtectedRoute) {
      // Not authenticated - redirect to login
      if (!session) {
        console.log('User not authenticated, redirecting to login');
        
        // Preserve the original URL as a callback after login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
        
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // In case of error, redirect to login as a safety measure
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure matcher to only run middleware on specific paths
export const config = {
  matcher: [
    '/profile/:path*',
    '/dashboard/:path*'
  ]
};
