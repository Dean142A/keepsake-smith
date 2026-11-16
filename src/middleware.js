import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0].toLowerCase();

  // Allow internal Next.js assets, static files, and icons to pass through untouched
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/textures') ||
    pathname.startsWith('/audios') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isAdminSubdomain = hostname.startsWith('admin.');
  const isWebSubdomain = hostname.startsWith('web.') || hostname.startsWith('app.');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // 1. Requests to admin.thekeepsakesmith.com (or admin.localhost)
  if (isAdminSubdomain) {
    if (pathname === '/') {
      // Rewrite root to /admin for the admin dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. Requests to web.* or the root storefront domain
  // Security rule: block direct /admin navigation on public/web domains in production
  if (!isLocalhost && pathname.startsWith('/admin')) {
    // Redirect to the dedicated admin subdomain
    const adminUrl = new URL(pathname, `https://admin.thekeepsakesmith.com`);
    return NextResponse.redirect(adminUrl, { status: 307 });
  }

  // 3. On web. or app. or main domain:
  // Root / is the 3D Keepsake Portal
  if (pathname === '/') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
