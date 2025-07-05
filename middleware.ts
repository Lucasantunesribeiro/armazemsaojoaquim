import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Handle admin routes with middleware-level protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔍 MIDDLEWARE: Verificando acesso admin para:', request.nextUrl.pathname)
    
    const response = NextResponse.next()
    
    try {
      const supabase = createMiddlewareClient({ req: request, res: response })
      
      // Check session with retry logic
      let session = null
      for (let attempt = 0; attempt < 2; attempt++) {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (currentSession) {
          session = currentSession
          break
        }
        if (attempt < 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      
      if (!session) {
        console.log('❌ MIDDLEWARE: Sem sessão, redirecionando para /auth')
        return NextResponse.redirect(new URL('/auth?error=session_required&message=Login necessário para acessar área administrativa', request.url))
      }
      
      console.log('✅ MIDDLEWARE: Sessão encontrada, permitindo acesso')
      return response
      
    } catch (error) {
      console.error('❌ MIDDLEWARE: Erro ao verificar sessão:', error)
      return NextResponse.redirect(new URL('/auth?error=middleware_error&message=Erro interno do sistema', request.url))
    }
  }
  
  // Processa rotas da API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Para requisições OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }
    
    // Para outras requisições de API
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    
    return response
  }
  
  // Para outras rotas, continua normalmente
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
} 