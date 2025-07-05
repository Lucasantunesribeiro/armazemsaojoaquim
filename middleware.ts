import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Handle admin routes with middleware-level protection  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔍 MIDDLEWARE: Verificando acesso admin para:', request.nextUrl.pathname)
    
    const response = NextResponse.next()
    
    try {
      const supabase = createMiddlewareClient({ req: request, res: response })
      
      // Get session from middleware client
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('🔍 MIDDLEWARE: Session details:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: sessionError?.message
      })
      
      // Debug cookies
      const cookies = request.cookies.getAll()
      const authCookies = cookies.filter(cookie => cookie.name.includes('sb-') || cookie.name.includes('auth'))
      console.log('🍪 MIDDLEWARE: Auth cookies found:', authCookies.length, authCookies.map(c => c.name))
      
      if (!session) {
        console.log('❌ MIDDLEWARE: Sem sessão no middleware, PERMITINDO ACESSO para component-level check')
        // Não bloquear aqui, deixar o component middleware fazer a verificação
        return response
      }
      
      console.log('✅ MIDDLEWARE: Sessão encontrada no middleware, permitindo acesso')
      return response
      
    } catch (error) {
      console.error('❌ MIDDLEWARE: Erro ao verificar sessão:', error)
      // Em caso de erro, permitir acesso e deixar component middleware decidir
      return response
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