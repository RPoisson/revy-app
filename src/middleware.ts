import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes that don't require access
  const publicPaths = ["/login", "/api/login", "/favicon.ico"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // Next.js internals and static assets
  if (
    isPublic ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  const accessCookie = req.cookies.get("revy_access");

  if (accessCookie?.value === "true") {
    return NextResponse.next();
  }

  // Not authorized → send to login
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/:path*",
};
