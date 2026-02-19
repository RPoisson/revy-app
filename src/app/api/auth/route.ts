//revy-quiz/src/app/api/auth/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    
    // Set a cookie named "auth"
    response.cookies.set('auth', 'true', {
      httpOnly: true,
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}