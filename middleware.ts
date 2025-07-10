import { createMiddlewareClient } from './lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔍 MIDDLEWARE: Iniciando para:', pathname)
  
  try {
    // Log cookies disponíveis
    const allCookies = request.cookies.getAll()
    console.log('🍪 MIDDLEWARE: Total cookies:', allCookies.length)
    console.log('🍪 MIDDLEWARE: Cookies disponíveis:', allCookies.map(c => `${c.name}: ${c.value.substring(0, 50)}...`))
    
    // Procurar especificamente pelo cookie de sessão
    const sessionCookies = allCookies.filter(c => 
      c.name.includes('armazem-sao-joaquim-auth') || 
      c.name.includes('sb-') || 
      c.name.includes('supabase')
    )
    console.log('🍪 MIDDLEWARE: Session cookies encontrados:', sessionCookies.map(c => c.name))
    
    // Create response (this will be modified with cookies)
    const response = NextResponse.next()
    
    // Create Supabase client with detailed cookie logging
    const supabase = createMiddlewareClient(request, response)
    
    // Log detalhado antes de getSession
    console.log('🔍 MIDDLEWARE: Chamando getSession()...')
    
    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('📊 MIDDLEWARE: Session check detalhado:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userId: session?.user?.id,
      tokenType: session?.token_type,
      expiresAt: session?.expires_at,
      error: error?.message,
      pathname,
      timestamp: new Date().toISOString()
    })
    
    // Se não há sessão, log mais detalhado
    if (!session) {
      console.log('❌ MIDDLEWARE: Sessão não encontrada - detalhes:', {
        cookieCount: allCookies.length,
        sessionCookieCount: sessionCookies.length,
        error: error?.message,
        pathname
      })
    }
    
    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      console.log('🔐 MIDDLEWARE: Verificando acesso admin para:', pathname)
      
      if (!session) {
        console.log('❌ MIDDLEWARE: Sem sessão - Redirecionando para /auth')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth'
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
          console.warn('⚠️ MIDDLEWARE: Erro ao verificar role:', dbError)
        }
      }
      
      if (!isAdmin) {
        console.log('❌ MIDDLEWARE: Usuário não é admin - Redirecionando para /unauthorized')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/unauthorized'
        redirectUrl.searchParams.set('message', 'Apenas administradores podem acessar esta área')
        return NextResponse.redirect(redirectUrl)
      }
      
      console.log('✅ MIDDLEWARE: Acesso admin autorizado para:', session.user.email)
    }
    
    return response
    
  } catch (error: any) {
    console.error('❌ MIDDLEWARE: Erro:', error.message)
    
    // If there's an error and it's an admin route, redirect to auth
    if (pathname.startsWith('/admin')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth'
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (for security.txt or other security files)
     * - api routes (they handle auth differently)
     */
    '/((?!_next/static|_next/image|favicon.ico|\\.well-known|api).*)',
  ],
} 