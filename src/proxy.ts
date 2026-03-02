import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const publicPaths = ['/login', '/auth/callback', '/auth/confirm'];
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

  // Supabase auth: refresh session and enforce login on protected routes
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { response, user } = await updateSession(request);
    if (pathname.startsWith('/_next') || pathname.startsWith('/api/')) return response;
    if (isPublicPath(pathname)) return response;
    if (!user) {
      const redirect = redirectToLogin(request);
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
      return redirect;
    }
    return response;
  }

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
    '/((?!api/auth|_next|static|favicon.ico).*)',
  ],
};