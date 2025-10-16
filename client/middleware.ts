import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Supported locales:
 * - English is the default and stays at root (no /en prefix)
 * - Hindi uses /hi prefix
 */
const LOCALES = new Set(['hi'])

const RESERVED = new Set([
  '', '_next', 'static', 'api', 'favicon.ico', 'robots.txt', 'sitemap.xml',
  'sitemap',
  'about', 'contact', 'privacy', 'terms', 'tag', 'search',
  'admin', 'cms', 'blog',
])

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { pathname } = url

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

  // --- Skip static assets (unchanged) ---
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next()

  // Split segments, ignoring leading/trailing slashes
  const segments = pathname.split('/').filter(Boolean)

  // Detect locale prefix (only "hi" for now). English stays at root.
  const hasLocalePrefix = segments.length > 0 && LOCALES.has(segments[0])
  const locale = hasLocalePrefix ? segments[0] : null
  const rest = hasLocalePrefix ? segments.slice(1) : segments

  // Helper to set cookie on any response we return
  const setLocaleCookie = (res: NextResponse, value: 'en' | 'hi') => {
    res.cookies.set('NEXT_LOCALE', value, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
    return res
  }

  // If we're in a locale-prefixed path (e.g., /hi/...), apply the SAME clean URL rewrites
  // but scoped under that locale prefix, and set cookie = hi.
  if (hasLocalePrefix) {
    // /hi -> pass through
    if (rest.length === 0) {
      return setLocaleCookie(NextResponse.next(), 'hi')
    }

    // Do not rewrite if the first "rest" segment is reserved (like system files, etc.)
    if (RESERVED.has(rest[0])) {
      return setLocaleCookie(NextResponse.next(), 'hi')
    }

    // /hi/<category> -> /hi/category/<category>
    if (rest.length === 1) {
      const category = decodeURIComponent(rest[0])
      const rewriteUrl = url.clone()
      rewriteUrl.pathname = `/${locale}/category/${category}`
      return setLocaleCookie(NextResponse.rewrite(rewriteUrl), 'hi')
    }

    // /hi/<category>/<blogSlug> -> /hi/category/<category>/<blogSlug>
    if (rest.length === 2) {
      const [category, blogSlug] = rest.map(decodeURIComponent)
      const rewriteUrl = url.clone()
      rewriteUrl.pathname = `/${locale}/category/${category}/${blogSlug}`
      return setLocaleCookie(NextResponse.rewrite(rewriteUrl), 'hi')
    }

    // Other /hi/... paths pass through
    return setLocaleCookie(NextResponse.next(), 'hi')
  }

  // --- English (root, no prefix) clean URL rewrites (unchanged logic) ---
  // Also set cookie = en on all root returns.

  // /<category> -> /category/<category> (but not for RESERVED)
  if (segments.length === 1 && !RESERVED.has(segments[0])) {
    const category = decodeURIComponent(segments[0])
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/category/${category}`
    return setLocaleCookie(NextResponse.rewrite(rewriteUrl), 'en')
  }

  // /<category>/<blogSlug> -> /category/<category>/<blogSlug> (but not for RESERVED)
  if (segments.length === 2 && !RESERVED.has(segments[0])) {
    const [category, blogSlug] = segments.map(decodeURIComponent)
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/category/${category}/${blogSlug}`
    return setLocaleCookie(NextResponse.rewrite(rewriteUrl), 'en')
  }

  return setLocaleCookie(NextResponse.next(), 'en')
}

export const config = {
  matcher: [
    '/cms/:path*',
    '/admin/:path*',
    '/api/:path*',
    '/((?!_next|api|static|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map)).*)',
  ],
}
