import { createMiddlewareClient } from './lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supported locales
export const locales = ['pt', 'en'] as const
export const defaultLocale = 'pt' as const
export type Locale = typeof locales[number]

// Admin configuration
const ADMIN_EMAIL = 'armazemsaojoaquimoficial@gmail.com'

// Get locale from pathname
function getLocale(pathname: string): Locale | null {
  const segments = pathname.split('/')
  const firstSegment = segments[1] as Locale
  return locales.includes(firstSegment) ? firstSegment : null
}

// Check if path needs locale redirect
function needsLocaleRedirect(pathname: string): boolean {
  // Skip API routes, static files, and certain paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.')
  ) {
    return false
  }
  
  // Check if pathname already has a locale
  return !locales.some(locale => 
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle locale redirects (skip for API routes)
  if (!pathname.startsWith('/api/') && needsLocaleRedirect(pathname)) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
    }
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url))
  }

  // Extract locale
  const locale = getLocale(pathname)
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
  
  try {
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Create Supabase client for auth handling
    const supabase = createMiddlewareClient(request, response)
    
    // Admin routes protection
    if (pathWithoutLocale.startsWith('/admin') || pathname.startsWith('/api/admin/')) {
      console.log('🔒 MIDDLEWARE: Admin route accessed:', pathname)
      
      // Get session
      let session = null
      try {
        const { data: { session: userSession } } = await supabase.auth.getSession()
        session = userSession
        
        // Try Authorization header if no session from cookies
        if (!session && request.headers.get('authorization')) {
          const authHeader = request.headers.get('authorization')
          if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const { createClient } = await import('@supabase/supabase-js')
            const tokenClient = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )
            
            const { data: { user } } = await tokenClient.auth.getUser(token)
            if (user) {
              session = { user, access_token: token }
            }
          }
        }
      } catch (authError) {
        console.warn('⚠️ MIDDLEWARE: Auth error:', authError)
      }
      
      // No session - redirect to auth or return 401 for API routes
      if (!session?.user) {
        if (pathname.startsWith('/api/admin/')) {
          return NextResponse.json(
            { error: 'Authentication required', code: 'NO_SESSION' },
            { status: 401 }
          )
        }
        
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${locale}/auth`
        redirectUrl.searchParams.set('message', 'É necessário fazer login para acessar o painel administrativo')
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      const email = session.user.email || ''
      const isAdmin = email === ADMIN_EMAIL
      
      if (!isAdmin) {
        if (pathname.startsWith('/api/admin/')) {
          return NextResponse.json(
            { error: 'Access denied - admin only', code: 'ACCESS_DENIED' },
            { status: 403 }
          )
        }
        
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${locale}/unauthorized`
        redirectUrl.searchParams.set('message', 'Acesso negado - apenas administradores podem acessar esta área')
        return NextResponse.redirect(redirectUrl)
      }
      
      // Add admin session headers
      response.headers.set('X-Admin-Session', 'true')
      response.headers.set('X-Admin-Verified', 'admin_email')
    }
    
    return response
    
  } catch (error: any) {
    console.error('❌ MIDDLEWARE: Critical error:', error)
    
    // For admin routes with error, redirect to auth or return error
    if (pathWithoutLocale.startsWith('/admin') || pathname.startsWith('/api/admin/')) {
      if (pathname.startsWith('/api/admin/')) {
        return NextResponse.json(
          { error: 'Internal server error', code: 'MIDDLEWARE_ERROR' },
          { status: 500 }
        )
      }
      
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${locale || defaultLocale}/auth`
      redirectUrl.searchParams.set('error', 'middleware_error')
      redirectUrl.searchParams.set('message', 'Erro na verificação de autenticação. Tente novamente.')
      return NextResponse.redirect(redirectUrl)
    }
    
    // Basic response for non-admin routes
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|manifest|robots|sitemap|.*\\..*).*)',
  ],
}