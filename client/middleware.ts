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

  // ---------- CMS Auth ----------
  if (pathname.startsWith('/cms')) {
    if (pathname === '/cms/login') return NextResponse.next()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/cms/login', request.url))
    }
    return NextResponse.next()
  }

  // ---------- Skip assets ----------
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next()

  const segments = pathname.split('/').filter(Boolean)

  // 1️⃣ Redirect /category/... → clean URL (308)
  if (segments[0] === 'category') {
    if (segments.length >= 2) {
      const dest = '/' + segments.slice(1).join('/')
      return NextResponse.redirect(new URL(dest, request.url), 308)
    }
    return NextResponse.redirect(new URL('/', request.url), 308)
  }

  // 2️⃣ Rewrite clean URLs → /category/*
  if (segments.length === 1 && !RESERVED.has(segments[0])) {
    const category = decodeURIComponent(segments[0]) // ✅ decode, don’t re-encode
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/category/${category}`   // ✅ plain path, no encodeURIComponent
    return NextResponse.rewrite(rewriteUrl)
  }

  if (segments.length === 2 && !RESERVED.has(segments[0])) {
    const [category, blogSlug] = segments.map(decodeURIComponent) // ✅ decode both
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/category/${category}/${blogSlug}`     // ✅ no encoding
    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map)).*)'],
}
