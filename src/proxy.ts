import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Legacy auth-only middleware: single shared password via "auth" cookie.
// Supabase auth is intentionally disabled until the product is ready for it.
const publicPaths = ['/login'];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

function isPublicPath(pathname: string): boolean {
  const path = pathname.replace(new RegExp(`^${basePath}`), '') || '/';
  return publicPaths.some((p) => path === p || path.startsWith(p + '/'));
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = basePath ? `${basePath}/login` : '/login';
  url.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy: single shared password via "auth" cookie
  const authCookie = request.cookies.get('auth');
  if (authCookie && pathname === '/login') {
    return NextResponse.redirect(new URL(basePath || '/', request.url));
  }
  if (!authCookie && pathname !== '/login' && !pathname.startsWith('/api/') && !pathname.startsWith('/_next')) {
    return NextResponse.redirect(new URL((basePath ? basePath + '/login' : '/login'), request.url));
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
    // Exclude common static assets (anything with a dot extension) so images/fonts aren't redirected.
    '/((?!api/auth|_next|static|favicon.ico|.*\\..*).*)',
  ],
};