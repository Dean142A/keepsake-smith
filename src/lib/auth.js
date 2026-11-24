import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

const DEV_FALLBACK_KEY = 'dev-only-admin-key';

/**
 * Constant-time string comparison. Returns false for empty/mismatched input
 * rather than leaking length through an early return on every call site.
 */
export function secureEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length === 0 || b.length === 0) return false;
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * The shared admin key. There is deliberately no baked-in production value:
 * a hardcoded fallback in a public repository is a published password, so an
 * unconfigured production environment must fail closed instead of quietly
 * accepting a key anyone can read on GitHub.
 */
export function getAdminKey() {
  const key = process.env.ADMIN_API_KEY;
  if (key && key.trim()) return key.trim();
  if (process.env.NODE_ENV === 'production') return null;
  return DEV_FALLBACK_KEY;
}

/** The password that unlocks /admin. Falls back to the API key when unset. */
export function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (password && password.trim()) return password.trim();
  return getAdminKey();
}

function readCookie(cookieHeader, name) {
  for (const part of cookieHeader.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return '';
}

/**
 * Validates incoming HTTP requests to administrative API routes (/api/admin/*)
 * against ADMIN_API_KEY, supplied as an x-admin-key header, a bearer token, or
 * the admin_session cookie set by the login route.
 */
export function validateAdminRequest(request) {
  const adminKey = getAdminKey();

  if (!adminKey) {
    console.error('[Auth] ADMIN_API_KEY is not set — refusing every admin request.');
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Admin access is not configured on this environment.' },
        { status: 503 }
      ),
    };
  }

  const authHeader = request.headers.get('authorization') || '';
  const customKeyHeader = request.headers.get('x-admin-key') || '';
  const cookieHeader = request.headers.get('cookie') || '';

  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const sessionCookie = readCookie(cookieHeader, 'admin_session');

  const isAuthenticated =
    secureEquals(customKeyHeader.trim(), adminKey) ||
    secureEquals(bearerToken, adminKey) ||
    secureEquals(sessionCookie, adminKey);

  if (!isAuthenticated) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing administrative credentials' },
        { status: 401 }
      ),
    };
  }

  return { authenticated: true };
}
