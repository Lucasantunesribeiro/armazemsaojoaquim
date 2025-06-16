import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Apenas processa rotas da API
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
  matcher: '/api/(.*)',
} 