import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = new Set(['hi'])
const RESERVED = new Set([
  'hi',
  'en', // ✅ treat "en" as reserved so it’s never a category
  '', '_next', 'static', 'api',
  'favicon.ico', 'robots.txt', 'sitemap.xml', 'sitemap',
  'about', 'contact', 'privacy', 'terms', 'tag', 'search',
  'admin', 'cms', 'blog', 'ads.txt'
])

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { pathname } = url
  const segments = pathname.split('/').filter(Boolean)

  // --- host detection (use forwarded host first, then host)
  const rawHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  const host = rawHost.toLowerCase()

  const isMainSite = host === 'innvibs.com' || host.endsWith('.innvibs.com')
  const isInSite = host === 'innvibs.in' || host.endsWith('.innvibs.in')

  // 🔴 1) FORCE .in → .com (hard redirect, keeps path + query)
  // This runs BEFORE any other logic, so NO UI change, just domain normalize.
  if (isInSite) {
    const redirectUrl = url.clone()
    redirectUrl.host = 'innvibs.com'
    redirectUrl.protocol = 'https:' // ensure https in prod

    const res = NextResponse.redirect(redirectUrl, 308)
    // optional: mark it as main so the target already has the cookie
    res.cookies.set('SITE_ID', 'main', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    })
    return res
  }

  // --- from here on, we are on innvibs.com (or localhost / vercel preview) ---

  const isSensitive =
    pathname.startsWith('/cms') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api')

  if (isSensitive) {
    if (pathname.startsWith('/cms') && pathname !== '/cms/login') {
      const token = request.cookies.get('token')?.value
      if (!token) {
        const redirect = NextResponse.redirect(new URL('/cms/login', request.url))
        redirect.headers.set(
          'X-Robots-Tag',
          'noindex, nofollow, noarchive, nosnippet, noimageindex'
        )
        redirect.cookies.set('SITE_ID', isMainSite ? 'main' : 'in', {
          path: '/',
          httpOnly: false,
          sameSite: 'lax',
        })
        return redirect
      }
    }
    const res = NextResponse.next()
    res.headers.set(
      'X-Robots-Tag',
      'noindex, nofollow, noarchive, nosnippet, noimageindex'
    )
    res.cookies.set('SITE_ID', isMainSite ? 'main' : 'in', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    })
    return res
  }

  // --- Locale detection
  const normalizedLocale = String(request.nextUrl.locale || '').toLowerCase()
  const firstSegIsHi = segments[0] === 'hi'
  const isHindi = normalizedLocale === 'hi' || firstSegIsHi

  // Helper: set cookies consistently
  const setLocaleAndSiteCookies = (res: NextResponse, value: 'en' | 'hi') => {
    res.cookies.set('NEXT_LOCALE', value, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
    res.cookies.set('SITE_ID', isMainSite ? 'main' : 'in', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    })
    return res
  }

  // ---------- HINDI BRANCH (/hi/...) ----------
  const rest = firstSegIsHi ? segments.slice(1) : segments

  if (isHindi) {
    // ✅ If footer accidentally linked /hi/en/..., drop the extra 'en'
    const eff = rest[0] === 'en' ? rest.slice(1) : rest

    // /hi → keep URL, serve home
    if (eff.length === 0) {
      const rewriteUrl = new URL('/', request.url)
      return setLocaleAndSiteCookies(NextResponse.rewrite(rewriteUrl), 'hi')
    }

    // /hi/<reserved> → pass through
    if (eff[0] && RESERVED.has(eff[0])) {
      return setLocaleAndSiteCookies(NextResponse.next(), 'hi')
    }

    // /hi/<category>
    if (eff.length === 1) {
      const category = decodeURIComponent(eff[0])
      const rewriteUrl = url.clone()
      rewriteUrl.pathname = `/category/${category}`
      return setLocaleAndSiteCookies(NextResponse.rewrite(rewriteUrl), 'hi')
    }

    // /hi/<category>/<slug>
    if (eff.length === 2) {
      const [category, blogSlug] = eff.map(decodeURIComponent)
      const rewriteUrl = url.clone()
      rewriteUrl.pathname = `/category/${category}/${blogSlug}`
      return setLocaleAndSiteCookies(NextResponse.rewrite(rewriteUrl), 'hi')
    }

    return setLocaleAndSiteCookies(NextResponse.next(), 'hi')
  }

  // ---------- ENGLISH (root) ----------
  // ✅ If footer accidentally linked /en/... on English, normalize it away
  if (segments[0] === 'en') {
    const cleaned = segments.slice(1).map(decodeURIComponent)
    const rewriteUrl = url.clone()
    if (cleaned.length === 0) {
      rewriteUrl.pathname = '/'
    } else if (cleaned.length === 1 && !RESERVED.has(cleaned[0])) {
      rewriteUrl.pathname = `/category/${cleaned[0]}`
    } else if (cleaned.length === 2 && !RESERVED.has(cleaned[0])) {
      rewriteUrl.pathname = `/category/${cleaned[0]}/${cleaned[1]}`
    } else {
      // reserved or deeper → pass through
      return setLocaleAndSiteCookies(NextResponse.next(), 'en')
    }
    return setLocaleAndSiteCookies(NextResponse.rewrite(rewriteUrl), 'en')
  }

  // English clean URLs at root (unchanged)
  if (segments.length === 1 && !RESERVED.has(segments[0])) {
    const category = decodeURIComponent(segments[0])
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/category/${category}`
    return setLocaleAndSiteCookies(NextResponse.rewrite(rewriteUrl), 'en')
  }

  if (segments.length === 2 && !RESERVED.has(segments[0])) {
    const [category, blogSlug] = segments.map(decodeURIComponent)
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/category/${category}/${blogSlug}`
    return setLocaleAndSiteCookies(NextResponse.rewrite(rewriteUrl), 'en')
  }

  // default
  return setLocaleAndSiteCookies(NextResponse.next(), 'en')
}

export const config = {
  matcher: [
    '/cms/:path*',
    '/admin/:path*',
    '/hi',
    '/hi/:path*',
    '/en',            // ✅ ensure middleware runs for /en
    '/en/:path*',     // ✅ and for /en/anything
    '/ads.txt',
    '/((?!_next|.*\\..*).*)',
  ],
}
