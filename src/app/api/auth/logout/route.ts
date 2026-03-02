import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (
    process.env.SUPABASE_AUTH_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("auth", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
