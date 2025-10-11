import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RESERVED = new Set([
  '', '_next', 'static', 'api', 'favicon.ico', 'robots.txt', 'sitemap.xml',
  'about', 'contact', 'privacy', 'terms', 'tag', 'search',
  'admin', 'cms', 'blog',
])

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { pathname } = url

  const isSensitive =
    pathname.startsWith('/cms') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api')

  // ---------- Sensitive areas: add X-Robots-Tag (and do /cms auth) ----------
  if (isSensitive) {
    // /cms auth gate (login allowed without token)
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

  // ---------- Skip static assets ----------
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next()

  const segments = pathname.split('/').filter(Boolean)

  // ---------- Rewrite clean URLs → /category/*
  if (segments.length === 1 && !RESERVED.has(segments[0])) {
    const category = decodeURIComponent(segments[0])
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/category/${category}`
    return NextResponse.rewrite(rewriteUrl)
  }

  if (segments.length === 2 && !RESERVED.has(segments[0])) {
    const [category, blogSlug] = segments.map(decodeURIComponent)
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/category/${category}/${blogSlug}`
    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Ensure sensitive routes always pass through middleware (to set X-Robots-Tag),
  // plus your general matcher for app routes.
  matcher: [
    '/cms/:path*',
    '/admin/:path*',
    '/api/:path*',
    '/((?!_next|api|static|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map)).*)',
  ],
}
