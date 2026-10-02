import { NextResponse } from 'next/server';

/**
 * Validates incoming HTTP requests to administrative API routes (/api/admin/*)
 * Enforces API Key / Bearer token authentication against process.env.ADMIN_API_KEY
 */
export function validateAdminRequest(request) {
  const adminKey = process.env.ADMIN_API_KEY || 'keepsake_admin_secret_2026';
  
  const authHeader = request.headers.get('authorization') || '';
  const customKeyHeader = request.headers.get('x-admin-key') || '';
  const cookieHeader = request.headers.get('cookie') || '';
  
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  const isAuthenticated = 
    customKeyHeader === adminKey ||
    bearerToken === adminKey ||
    cookieHeader.includes(`admin_session=${adminKey}`);

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
