// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.QUIZ_PASSWORD;
const COOKIE_NAME = process.env.PASSWORD_COOKIE_NAME ?? "revy_quiz_auth";

export async function POST(req: NextRequest) {
  if (!PASSWORD) {
    return NextResponse.json(
      { success: false, error: "Server password not configured" },
      { status: 500 }
    );
  }

  // Because your <form> uses method="POST" and name="code"
  const formData = await req.formData();
  const enteredCode = formData.get("code");

  if (!enteredCode || enteredCode !== PASSWORD) {
    return NextResponse.json(
      { success: false, error: "Invalid access code" },
      { status: 401 }
    );
  }

  // Redirect to the quiz page after successful login
  const res = NextResponse.redirect(new URL("/quiz", req.url));

  // Set the auth cookie
  res.cookies.set(COOKIE_NAME, "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}

// Optional: explicitly block other methods
export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
