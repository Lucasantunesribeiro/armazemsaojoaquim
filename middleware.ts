import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware mínimo temporário para debug
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // HSTS for HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // Performance headers for static assets
  if (pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  // CSS and JS files
  if (pathname.match(/\.(css|js)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Font files
  if (pathname.match(/\.(woff|woff2|eot|ttf|otf)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  // API routes - short cache
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // HTML pages - moderate cache
  if (pathname.match(/\.(html|htm)$/) || pathname === '/' || !pathname.includes('.')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  }

  // Compression hint
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  if (acceptEncoding.includes('br')) {
    response.headers.set('Content-Encoding', 'br')
  } else if (acceptEncoding.includes('gzip')) {
    response.headers.set('Content-Encoding', 'gzip')
  }

  // Add performance timing headers
  response.headers.set('X-Response-Time', Date.now().toString())
  
  // Add custom headers for PWA
  if (pathname === '/') {
    response.headers.set('X-Robots-Tag', 'index, follow')
  }

  // Redirect www to non-www for better SEO
  if (request.nextUrl.hostname.startsWith('www.')) {
    const newUrl = request.nextUrl.clone()
    newUrl.hostname = newUrl.hostname.replace('www.', '')
    return NextResponse.redirect(newUrl, 301)
  }

  // Add geo-location based optimization (if needed)
  const country = request.geo?.country || 'US'
  response.headers.set('X-Country', country)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     * - manifest.json (PWA manifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}