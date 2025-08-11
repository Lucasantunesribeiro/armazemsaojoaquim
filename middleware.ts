import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supported locales
export const locales = ['pt', 'en'] as const
export const defaultLocale = 'pt' as const
export type Locale = typeof locales[number]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip static files and API routes
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

  // Simple locale handling
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
    }
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url))
  }

  // Add basic security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|manifest|robots|sitemap|.*\\..*).*)',
  ],
}