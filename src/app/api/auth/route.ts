//revy-quiz/src/app/api/auth/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_COOKIE = "auth";

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get(AUTH_COOKIE);
  if (auth?.value === "true") {
    return NextResponse.json({ loggedIn: true });
  }
  // Return 200 so the nav auth check doesn't show a 401 in the console when not logged in
  return NextResponse.json({ loggedIn: false });
}

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, "true", {
      httpOnly: true,
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}