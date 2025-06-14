import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    // Só processa rotas da API
    if (request.nextUrl.pathname.startsWith('/api/')) {
      
      // Para requisições OPTIONS (CORS preflight)
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          },
        })
      }
      
      // Para outras requisições de API, apenas adiciona headers básicos
      const response = NextResponse.next()
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      return response
    }
    
    // Para outras rotas, continua normalmente
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/api/(.*)',
  ],
} 