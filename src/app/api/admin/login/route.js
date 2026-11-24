import { NextResponse } from 'next/server';
import { getAdminKey, getAdminPassword, secureEquals } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password } = body;

    const expectedPassword = getAdminPassword();
    const cookieValue = getAdminKey();

    // No shared secret configured means no way to tell staff from a stranger,
    // so the door stays shut rather than opening on a value from source control.
    if (!expectedPassword || !cookieValue) {
      console.error('[Admin Login] ADMIN_PASSWORD / ADMIN_API_KEY are not set — refusing to sign anyone in.');
      return NextResponse.json(
        { success: false, error: 'Admin access is not configured on this environment.' },
        { status: 503 }
      );
    }

    const trimmedPassword = (password || '').trim();

    if (!secureEquals(trimmedPassword, expectedPassword)) {
      return NextResponse.json(
        { success: false, error: 'Invalid administrative credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        username: username || 'admin',
        role: 'Administrator',
      },
    });

    // Matches validateAdminRequest's expectation for the admin_session cookie.
    response.cookies.set('admin_session', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { success: false, error: 'Server authentication error' },
      { status: 500 }
    );
  }
}
