import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip all processing for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Simple locale redirect only
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/pt', request.url))
  }

  // Basic response with minimal headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|manifest|robots|sitemap|.*\\..*).*)',
  ],
}