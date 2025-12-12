// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "revy_auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const password = body?.password as string | undefined;

    const expected = process.env.LOGIN_PASSWORD; // <- set in .env / Vercel env

    if (!expected) {
      return NextResponse.json(
        { success: false, error: "Server password not configured" },
        { status: 500 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    if (password !== expected) {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 401 }
      );
    }

    // ✅ Password OK: set auth cookie
    const res = NextResponse.json({ success: true });

    res.cookies.set(COOKIE_NAME, "true", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 hours
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

// OPTIONAL: you can also add a GET to check auth if you want later
