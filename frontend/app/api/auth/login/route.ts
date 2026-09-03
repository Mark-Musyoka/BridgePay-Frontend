import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });

    // Set httpOnly cookie for session security
    response.cookies.set('bridgepay_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
