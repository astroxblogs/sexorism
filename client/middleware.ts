import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = new Set(['hi'])
const RESERVED = new Set([
  'hi',
  '', '_next', 'static', 'api',
  'favicon.ico', 'robots.txt', 'sitemap.xml', 'sitemap',
  'about', 'contact', 'privacy', 'terms', 'tag', 'search',
  'admin', 'cms', 'blog'
])

export function middleware(request: NextRequest) {
  // DEBUG: see the path Next gives us (already locale-normalized when i18n is enabled)
  console.log('MW HIT:', request.nextUrl.pathname, 'locale=', request.nextUrl.locale)

  const url = request.nextUrl
  const { pathname } = url
  const segments = pathname.split('/').filter(Boolean)

  // --- Guard admin/cms/api (unchanged) ---
  const isSensitive =
    pathname.startsWith('/cms') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api')

  if (isSensitive) {
    if (pathname.startsWith('/cms') && pathname !== '/cms/login') {
      const token = request.cookies.get('token')?.value
      if (!token) {
        const redirect = NextResponse.redirect(new URL('/cms/login', request.url))
        redirect.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')
        return redirect
      }
    }
    const res = NextResponse.next()
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')
    return res
  }
// --- Locale detection that works with/without next.config i18n ---
const normalizedLocale = String(request.nextUrl.locale || '').toLowerCase();
const firstSegIsHi = segments[0] === 'hi'; // handles the non-i18n case
const isHindi = normalizedLocale === 'hi' || firstSegIsHi;

  // Helper to set cookie
  const setLocaleCookie = (res: NextResponse, value: 'en' | 'hi') => {
    res.cookies.set('NEXT_LOCALE', value, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
    return res
  }

  const rest = firstSegIsHi ? segments.slice(1) : segments;

if (isHindi) {
  // /hi → serve home content while keeping URL /hi
  if (rest.length === 0) {
    const rewriteUrl = new URL('/', request.url);
    return setLocaleCookie(NextResponse.rewrite(rewriteUrl), 'hi');
  }

  // /hi/<reserved> → pass through, just set cookie
  if (rest[0] && RESERVED.has(rest[0])) {
    return setLocaleCookie(NextResponse.next(), 'hi');
  }

  // /hi/<category> → internally /category/<category>
  if (rest.length === 1) {
    const category = decodeURIComponent(rest[0]);
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/category/${category}`;
    return setLocaleCookie(NextResponse.rewrite(rewriteUrl), 'hi');
  }

  // /hi/<category>/<slug> → internally /category/<category>/<slug>
  if (rest.length === 2) {
    const [category, blogSlug] = rest.map(decodeURIComponent);
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/category/${category}/${blogSlug}`;
    return setLocaleCookie(NextResponse.rewrite(rewriteUrl), 'hi');
  }

  return setLocaleCookie(NextResponse.next(), 'hi');
}


 // English clean URLs at root (unchanged)
if (segments.length === 1 && !RESERVED.has(segments[0])) {
  const category = decodeURIComponent(segments[0]);
  const rewriteUrl = url.clone();
  rewriteUrl.pathname = `/category/${category}`;
  return setLocaleCookie(NextResponse.rewrite(rewriteUrl), 'en');
}

if (segments.length === 2 && !RESERVED.has(segments[0])) {
  const [category, blogSlug] = segments.map(decodeURIComponent);
  const rewriteUrl = url.clone();
  rewriteUrl.pathname = `/category/${category}/${blogSlug}`;
  return setLocaleCookie(NextResponse.rewrite(rewriteUrl), 'en');
}

// default
return setLocaleCookie(NextResponse.next(), isHindi ? 'hi' : 'en');
}

export const config = {
  matcher: [
    '/cms/:path*',
    '/admin/:path*',
    '/hi',
    '/hi/:path*',
    // Catch-all for real pages (ignore _next and files with dots)
    '/((?!_next|.*\\..*).*)',
  ],
}
