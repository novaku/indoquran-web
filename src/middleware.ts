import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function middleware(request: NextRequest) {
  // Get the token using getToken from next-auth/jwt
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  const isAuthenticated = !!token;
  const isAuthPage = 
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');

  // Redirect unauthenticated users to login when accessing protected routes
  if (request.nextUrl.pathname.startsWith('/profile') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect authenticated users away from login/register pages
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Define which routes this middleware applies to
export const config = {
  matcher: ['/profile/:path*', '/login', '/register'],
};
