import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return NextResponse.redirect(`${origin}${base}/login?error=auth`);
}
