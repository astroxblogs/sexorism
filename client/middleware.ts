// client/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RESERVED = new Set([
  '', '_next', 'static', 'api', 'favicon.ico', 'robots.txt', 'sitemap.xml',
  'sitemap',
  'about', 'contact', 'privacy', 'terms', 'tag', 'search',
  'admin', 'cms', 'blog',
]);

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;
  const segments = pathname.split('/').filter(Boolean);

  // --- Guard admin/cms/api (unchanged)
  const isSensitive =
    pathname.startsWith('/cms') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api');

  if (isSensitive) {
    if (pathname.startsWith('/cms') && pathname !== '/cms/login') {
      const token = request.cookies.get('token')?.value;
      if (!token) {
        const redirect = NextResponse.redirect(new URL('/cms/login', request.url));
        redirect.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
        return redirect;
      }
    }
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
    return res;
  }

  // Helper to set cookie
  const setLocaleCookie = (res: NextResponse, value: 'en' | 'hi') => {
    res.cookies.set('NEXT_LOCALE', value, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return res;
  };

  // ✅ Optional: accept ?lang=hi|en → set cookie and redirect to clean URL (no query)
  const langParam = url.searchParams.get('lang');
  if (langParam === 'hi' || langParam === 'en') {
    const res = NextResponse.redirect(new URL(pathname, request.url));
    return setLocaleCookie(res, langParam);
  }

  // ✅ Ensure we always have a locale cookie (default to 'en' if missing)
  if (!request.cookies.get('NEXT_LOCALE')) {
    const res = NextResponse.next();
    return setLocaleCookie(res, 'en');
  }

  // ---- English (root) clean URL rewrites ----
  // /<category> -> /category/<category> (but not for RESERVED)
  if (segments.length === 1 && !RESERVED.has(segments[0])) {
    const category = decodeURIComponent(segments[0]);
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/category/${category}`;
    const res = NextResponse.rewrite(rewriteUrl);
    return res;
  }

  // /<category>/<blogSlug> -> /category/<category>/<blogSlug> (but not for RESERVED)
  if (segments.length === 2 && !RESERVED.has(segments[0])) {
    const [category, blogSlug] = segments.map(decodeURIComponent);
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/category/${category}/${blogSlug}`;
    const res = NextResponse.rewrite(rewriteUrl);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cms/:path*',
    '/admin/:path*',
    '/api/:path*',
    // NOTE: no '/hi' matchers anymore – we do cookie-only language.
    '/((?!_next|api|static|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map)).*)',
  ],
};
