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

  const isAdminHost = hostname === 'admin.thekeepsakesmith.com' || hostname.startsWith('admin.');
  const isAppHost = hostname === 'app.thekeepsakesmith.com' || hostname.startsWith('app.') || hostname.startsWith('web.');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // 1. admin.thekeepsakesmith.com
  if (isAdminHost) {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. Redirect apex domain (thekeepsakesmith.com / www) to app.thekeepsakesmith.com in production
  if (!isLocalhost && (hostname === 'thekeepsakesmith.com' || hostname === 'www.thekeepsakesmith.com')) {
    const appUrl = new URL(pathname + request.nextUrl.search, 'https://app.thekeepsakesmith.com');
    return NextResponse.redirect(appUrl, { status: 301 });
  }

  // 3. app.thekeepsakesmith.com (or local development)
  // Security rule: block direct /admin navigation on app domain in production
  if (!isLocalhost && pathname.startsWith('/admin')) {
    const adminUrl = new URL(pathname + request.nextUrl.search, 'https://admin.thekeepsakesmith.com');
    return NextResponse.redirect(adminUrl, { status: 307 });
  }

  // On app.thekeepsakesmith.com, root / is the 3D Keepsake Portal
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
