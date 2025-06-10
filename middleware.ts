import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware mínimo para evitar conflitos com Netlify
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Apenas headers de segurança básicos
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Redirect www to non-www
  if (request.nextUrl.hostname.startsWith('www.')) {
    const newUrl = request.nextUrl.clone()
    newUrl.hostname = newUrl.hostname.replace('www.', '')
    return NextResponse.redirect(newUrl, 301)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}