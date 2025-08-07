import { createMiddlewareClient } from './lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supported locales - NEXT.JS 15 COMPATIBLE
export const locales = ['pt', 'en'] as const
export const defaultLocale = 'pt' as const
export type Locale = typeof locales[number]

// Admin configuration
const ADMIN_EMAIL = 'armazemsaojoaquimoficial@gmail.com'
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
const ADMIN_CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache TTL

// Edge Runtime compatible cache - memory optimized
interface AdminCacheEntry {
  isAdmin: boolean
  timestamp: number
  sessionStart?: number
}

const adminCache = new Map<string, AdminCacheEntry>()

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

// Check if session has timed out
function isSessionExpired(sessionStart: number): boolean {
  return Date.now() - sessionStart > SESSION_TIMEOUT
}

// Fast admin check with caching and session timeout
function getAdminFromCache(userId: string, email: string): { isAdmin: boolean; expired: boolean } | null {
  // Always allow main admin email with fresh verification
  if (email === ADMIN_EMAIL) {
    return { isAdmin: true, expired: false }
  }

  const cacheKey = userId || email
  const cached = adminCache.get(cacheKey)
  
  if (!cached) {
    return null // Cache miss
  }

  const now = Date.now()
  const cacheExpired = (now - cached.timestamp) > ADMIN_CACHE_TTL
  const sessionExpired = cached.sessionStart ? isSessionExpired(cached.sessionStart) : false

  if (cacheExpired || sessionExpired) {
    adminCache.delete(cacheKey) // Clean expired cache
    return null
  }
  
  return { isAdmin: cached.isAdmin, expired: false }
}

// Update admin cache with session tracking
function setAdminCache(userId: string, email: string, isAdmin: boolean, sessionStart?: number): void {
  const cacheKey = userId || email
  adminCache.set(cacheKey, {
    isAdmin,
    timestamp: Date.now(),
    sessionStart: sessionStart || Date.now()
  })
}

// Clean expired cache entries periodically
function cleanExpiredCache(): void {
  const now = Date.now()
  for (const [key, entry] of adminCache.entries()) {
    const cacheExpired = (now - entry.timestamp) > ADMIN_CACHE_TTL
    const sessionExpired = entry.sessionStart ? isSessionExpired(entry.sessionStart) : false
    
    if (cacheExpired || sessionExpired) {
      adminCache.delete(key)
    }
  }
}

// Robust admin authentication middleware
async function verifyAdminAccess(
  supabase: any,
  session: any,
  userId: string,
  email: string
): Promise<{ isAdmin: boolean; reason: string }> {
  // Primary verification: Check admin email
  if (email === ADMIN_EMAIL) {
    console.log('✅ MIDDLEWARE: Admin verified by email:', email)
    return { isAdmin: true, reason: 'admin_email' }
  }

  // Check cache first
  const cached = getAdminFromCache(userId, email)
  if (cached !== null) {
    if (cached.expired) {
      console.log('⏰ MIDDLEWARE: Session expired for:', email)
      return { isAdmin: false, reason: 'session_expired' }
    }
    console.log('📋 MIDDLEWARE: Admin status from cache:', cached.isAdmin)
    return { isAdmin: cached.isAdmin, reason: 'cache' }
  }

  // Database verification
  try {
    console.log('🔍 MIDDLEWARE: Checking database for user:', email)
    
    // First try by user ID
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .single()

    // If not found by ID, try by email
    if (error && email) {
      console.log('🔄 MIDDLEWARE: Trying by email fallback')
      const result = await supabase
        .from('profiles')
        .select('role, email')
        .eq('email', email)
        .single()
      
      profile = result.data
      error = result.error
    }

    if (error) {
      console.log('❌ MIDDLEWARE: Database error:', error.message)
      
      // For admin email, create profile if it doesn't exist
      if (email === ADMIN_EMAIL) {
        console.log('🔧 MIDDLEWARE: Creating admin profile for:', email)
        try {
          await supabase.rpc('ensure_admin_profile', {
            admin_id: userId,
            admin_email: email,
            admin_name: 'Administrador Armazém São Joaquim'
          })
          
          setAdminCache(userId, email, true, session.created_at ? new Date(session.created_at).getTime() : Date.now())
          return { isAdmin: true, reason: 'admin_profile_created' }
        } catch (createError) {
          console.error('❌ MIDDLEWARE: Failed to create admin profile:', createError)
        }
      }
      
      setAdminCache(userId, email, false)
      return { isAdmin: false, reason: 'database_error' }
    }

    const isAdmin = profile.role === 'admin'
    console.log('✅ MIDDLEWARE: Database check complete. Admin:', isAdmin)
    
    setAdminCache(userId, email, isAdmin, session.created_at ? new Date(session.created_at).getTime() : Date.now())
    return { isAdmin, reason: 'database' }

  } catch (dbError: any) {
    console.error('❌ MIDDLEWARE: Database query failed:', dbError)
    
    // Fallback for admin email
    if (email === ADMIN_EMAIL) {
      console.log('⚠️ MIDDLEWARE: Database failed but admin email - allowing access')
      return { isAdmin: true, reason: 'admin_email_fallback' }
    }
    
    return { isAdmin: false, reason: 'database_failure' }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // FAST EARLY RETURNS for performance
  // Skip static files and non-admin API routes
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
  
  // Periodic cache cleanup (1% chance per request)
  if (Math.random() < 0.01) {
    cleanExpiredCache()
  }
  
  try {
    // Create response that will be modified with headers/cookies
    const response = NextResponse.next()
    
    // Add security headers for all requests
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
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
      console.warn('⚠️ MIDDLEWARE: Auth error:', authError)
    }
    
    // Admin routes protection (both page routes and API routes)
    if (pathWithoutLocale.startsWith('/admin') || pathname.startsWith('/api/admin/')) {
      console.log('🔒 MIDDLEWARE: Admin route accessed:', pathname)
      
      // No session - redirect to auth or return 401 for API routes
      if (!session?.user) {
        console.log('❌ MIDDLEWARE: No session for admin route')
        
        // For API routes, return 401 instead of redirect
        if (pathname.startsWith('/api/admin/')) {
          return NextResponse.json(
            { error: 'Authentication required', code: 'NO_SESSION' },
            { status: 401 }
          )
        }
        
        // For page routes, redirect to auth
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${locale}/auth`
        redirectUrl.searchParams.set('message', 'É necessário fazer login para acessar o painel administrativo')
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      const userId = session.user.id
      const email = session.user.email || ''
      
      console.log('👤 MIDDLEWARE: Checking admin access for:', email)
      
      // Verify admin access
      const { isAdmin, reason } = await verifyAdminAccess(supabase, session, userId, email)
      
      if (!isAdmin) {
        console.log('❌ MIDDLEWARE: Admin access denied:', reason)
        
        // For API routes, return 403 instead of redirect
        if (pathname.startsWith('/api/admin/')) {
          return NextResponse.json(
            { 
              error: 'Access denied - admin only', 
              code: 'ACCESS_DENIED',
              reason 
            },
            { status: 403 }
          )
        }
        
        // For page routes, redirect to unauthorized
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${locale}/unauthorized`
        
        // Set appropriate message based on reason
        let message = 'Acesso negado - apenas administradores podem acessar esta área'
        if (reason === 'session_expired') {
          message = 'Sua sessão expirou. Faça login novamente.'
          redirectUrl.pathname = `/${locale}/auth`
          redirectUrl.searchParams.set('redirect', pathname)
        }
        
        redirectUrl.searchParams.set('message', message)
        return NextResponse.redirect(redirectUrl)
      }
      
      console.log('✅ MIDDLEWARE: Admin access granted:', reason)
      
      // Add admin session headers for additional security
      response.headers.set('X-Admin-Session', 'true')
      response.headers.set('X-Admin-Verified', reason)
    }
    
    return response
    
  } catch (error: any) {
    console.error('❌ MIDDLEWARE: Critical error:', error)
    
    // If there's a critical error and it's an admin route, redirect to auth or return error
    if (pathWithoutLocale.startsWith('/admin') || pathname.startsWith('/api/admin/')) {
      // For API routes, return 500
      if (pathname.startsWith('/api/admin/')) {
        return NextResponse.json(
          { error: 'Internal server error', code: 'MIDDLEWARE_ERROR' },
          { status: 500 }
        )
      }
      
      // For page routes, redirect to auth
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${locale || defaultLocale}/auth`
      redirectUrl.searchParams.set('error', 'middleware_error')
      redirectUrl.searchParams.set('message', 'Erro na verificação de autenticação. Tente novamente.')
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
     * - Static files (_next/static, _next/image)
     * - Public files (favicon, manifest, robots, sitemap)
     * - File extensions (.png, .jpg, .css, .js, etc.)
     * - Webpack HMR
     * 
     * INCLUDES: /api/admin/* routes for admin protection
     * PERFORMANCE: More specific patterns for better Edge Runtime performance
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon|manifest|robots|sitemap|.*\\..*).*)',
  ],
} 