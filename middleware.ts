import { createMiddlewareClient } from './lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supported locales
const locales = ['pt', 'en']
const defaultLocale = 'pt'

// Get locale from pathname
function getLocale(pathname: string): string | null {
  const segments = pathname.split('/')
  const firstSegment = segments[1]
  return locales.includes(firstSegment) ? firstSegment : null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if pathname has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Redirect if there is no locale
  if (!pathnameHasLocale) {
    // Skip API routes, static files, and certain paths
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.includes('.')
    ) {
      return NextResponse.next()
    }

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
    // Create response (this will be modified with cookies)
    const response = NextResponse.next()
    
    // Create Supabase client
    const supabase = createMiddlewareClient(request, response)
    
    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // Admin routes protection (check path without locale)
    if (pathWithoutLocale.startsWith('/admin')) {
      if (!session) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${locale}/auth`
        redirectUrl.searchParams.set('message', 'É necessário fazer login para acessar o painel administrativo')
        return NextResponse.redirect(redirectUrl)
      }
      
      // Verificação de admin usando a mesma lógica da função requireAdmin
      let isAdmin = session.user.email === 'armazemsaojoaquimoficial@gmail.com'
      
      if (!isAdmin) {
        try {
          // Try by session user ID first
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          if (!userError && userData?.role === 'admin') {
            isAdmin = true
          } else {
            // Fallback: try by email in database
            const { data: adminUserData, error: adminUserError } = await supabase
              .from('users')
              .select('role')
              .eq('email', session.user.email)
              .single()
            
            if (!adminUserError && adminUserData?.role === 'admin') {
              isAdmin = true
            }
          }
        } catch (dbError) {
          // Silent error handling in production
        }
      }
      
      if (!isAdmin) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${locale}/unauthorized`
        redirectUrl.searchParams.set('message', 'Apenas administradores podem acessar esta área')
        return NextResponse.redirect(redirectUrl)
      }
    }
    
    return response
    
  } catch (error: any) {
    // Silent error handling for Edge Runtime compatibility
    
    // If there's an error and it's an admin route, redirect to auth
    if (pathWithoutLocale.startsWith('/admin')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${locale || defaultLocale}/auth`
      redirectUrl.searchParams.set('error', 'middleware_error')
      redirectUrl.searchParams.set('message', 'Erro na verificação de autenticação')
      return NextResponse.redirect(redirectUrl)
    }
    
    // For other routes, just continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - files with extensions (like .png, .jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|manifest.json|sitemap.xml|robots.txt).*)',
  ],
} 