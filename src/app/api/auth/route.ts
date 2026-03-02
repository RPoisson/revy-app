//revy-quiz/src/app/api/auth/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const AUTH_COOKIE = "auth";

export async function GET() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.json({ loggedIn: true, userId: user.id });
    }
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
  const cookieStore = await cookies();
  const auth = cookieStore.get(AUTH_COOKIE);
  if (auth?.value === "true") {
    return NextResponse.json({ loggedIn: true });
  }
  return NextResponse.json({ loggedIn: false }, { status: 401 });
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