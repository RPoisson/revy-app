import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check for the "auth" cookie
  const authCookie = request.cookies.get('auth');

  // 2. If the user is trying to access the login page or API and they ARE authenticated, 
  // redirect them to the home page (optional but clean)
  if (authCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. If the cookie is missing AND the user is not on the login page, redirect to login
  if (!authCookie && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configure which paths to protect
export const config = {
  /*
   * matcher:
   * 1. Matches all paths except those starting with:
   * - api/auth (authentication logic)
   * - _next (Next.js internals: CSS, JS, etc.)
   * - static (static files)
   * - favicon.ico, sitemap.xml, robots.txt, etc.
   * 2. This ensures the browser can always load CSS even if the user is NOT logged in.
   */
  matcher: [
    '/((?!api/auth|_next|static|favicon.ico).*)',
  ],
};