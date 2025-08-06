import { createMiddlewareClient } from './lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supported locales - NEXT.JS 15 COMPATIBLE
export const locales = ['pt', 'en'] as const
export const defaultLocale = 'pt' as const
export type Locale = typeof locales[number]

// Edge Runtime compatible cache - memory optimized
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>()
const ADMIN_CACHE_TTL = 60 * 1000 // 1 minute TTL

// Get locale from pathname - OPTIMIZED
function getLocale(pathname: string): Locale | null {
  const segments = pathname.split('/')
  const firstSegment = segments[1] as Locale
  return locales.includes(firstSegment) ? firstSegment : null
}

// Check if path needs locale redirect - PERFORMANCE OPTIMIZED
function needsLocaleRedirect(pathname: string): boolean {
  // Skip API routes, static files, and certain paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.') // Any file with extension
  ) {
    return false
  }
  
  // Check if pathname already has a locale
  return !locales.some(locale => 
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
}

// Fast admin check with caching
function isAdminCached(userId: string, email: string): boolean | null {
  // Always allow main admin email (no cache needed)
  if (email === 'armazemsaojoaquimoficial@gmail.com') {
    return true
  }

  const cacheKey = userId || email
  const cached = adminCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < ADMIN_CACHE_TTL) {
    return cached.isAdmin
  }
  
  return null // Cache miss
}

// Update admin cache
function setAdminCache(userId: string, email: string, isAdmin: boolean): void {
  const cacheKey = userId || email
  adminCache.set(cacheKey, {
    isAdmin,
    timestamp: Date.now()
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // FAST EARLY RETURNS for performance
  // Skip API routes and static files immediately
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle locale redirects
  if (needsLocaleRedirect(pathname)) {
    // Redirect root to default locale
    if (pathname === '/') {
      return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
    }
    
    // Redirect other paths to include default locale
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url))
  }

  // Extract locale from pathname for further processing
  const locale = getLocale(pathname)
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
  
  try {
    // Create response that will be modified with headers/cookies
    const response = NextResponse.next()
    
    // Add security headers for all requests
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    // Create Supabase client for auth handling
    const supabase = createMiddlewareClient(request, response)
    
    // Get session with error handling for Edge Runtime
    let session = null
    try {
      const { data: { session: userSession }, error } = await supabase.auth.getSession()
      session = userSession
      
      // Refresh user data if session exists (Next.js 15 compatibility)
      if (session && !error) {
        await supabase.auth.getUser()
      }
    } catch (authError) {
      // Ignore auth errors in middleware to prevent blocking navigation
      console.warn('Auth error in middleware:', authError)
    }
    
    // Admin routes protection with enhanced error handling
    if (pathWithoutLocale.startsWith('/admin')) {
      // No session - redirect to auth
      if (!session) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${locale}/auth`
        redirectUrl.searchParams.set('message', 'É necessário fazer login para acessar o painel administrativo')
        return NextResponse.redirect(redirectUrl)
      }
      
      // Check admin privileges with cache
      let isAdmin = isAdminCached(session.user.id, session.user.email || '')
      
      // Cache miss - query database
      if (isAdmin === null) {
        try {
          // Optimize: single query approach with better error handling
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          if (!userError && userData?.role === 'admin') {
            isAdmin = true
          } else if (session.user.email) {
            // Fallback: check by email (for cases where ID might not match)
            const { data: adminUserData, error: adminUserError } = await supabase
              .from('users')
              .select('role')
              .eq('email', session.user.email)
              .single()
            
            isAdmin = !adminUserError && adminUserData?.role === 'admin'
          } else {
            isAdmin = false
          }
          
          // Cache the result
          setAdminCache(session.user.id, session.user.email || '', isAdmin)
          
        } catch (dbError) {
          console.warn('Database error in admin check:', dbError)
          // Deny access on database errors but don't cache aggressively
          setAdminCache(session.user.id, session.user.email || '', false)
          isAdmin = false
        }
      }
      
      // Deny access if not admin
      if (!isAdmin) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${locale}/unauthorized`
        redirectUrl.searchParams.set('message', 'Apenas administradores podem acessar esta área')
        return NextResponse.redirect(redirectUrl)
      }
    }
    
    return response
    
  } catch (error: any) {
    // Enhanced error handling for production stability
    console.error('Middleware error:', error)
    
    // If there's a critical error and it's an admin route, redirect to auth
    if (pathWithoutLocale.startsWith('/admin')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${locale || defaultLocale}/auth`
      redirectUrl.searchParams.set('error', 'middleware_error')
      redirectUrl.searchParams.set('message', 'Erro na verificação de autenticação')
      return NextResponse.redirect(redirectUrl)
    }
    
    // For non-admin routes, continue with basic security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    return response
  }
}

// NEXT.JS 15 OPTIMIZED MATCHER - Performance Enhanced
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes (/api/*)
     * - Static files (_next/static, _next/image)
     * - Public files (favicon, manifest, robots, sitemap)
     * - File extensions (.png, .jpg, .css, .js, etc.)
     * - Webpack HMR
     * 
     * PERFORMANCE: More specific patterns for better Edge Runtime performance
     */
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon|manifest|robots|sitemap|.*\\..*).*)',
  ],
} 