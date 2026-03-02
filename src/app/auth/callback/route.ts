import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? searchParams.get("redirect") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const path = next.startsWith("/") ? next : `/${next}`;
      return NextResponse.redirect(`${origin}${base}${path}`);
    }
  }

  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return NextResponse.redirect(`${origin}${base}/login?error=auth`);
}
