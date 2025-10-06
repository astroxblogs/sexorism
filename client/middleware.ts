import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is under /cms
  if (pathname.startsWith('/cms')) {
    // Allow access to /cms/login
    if (pathname === '/cms/login') {
      return NextResponse.next()
    }

    // For all other /cms/* routes, check for authentication token
    const token = request.cookies.get('token')?.value

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/cms/login', request.url))
    }

    // Token exists, allow access
    return NextResponse.next()
  }

  // For non-admin routes, allow access
  return NextResponse.next()
}

export const config = {
  matcher: '/cms/:path*',
}