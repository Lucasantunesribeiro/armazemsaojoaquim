import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Só processa rotas da API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Cria uma resposta que garante headers JSON para APIs
    const response = NextResponse.next()
    
    // Define headers obrigatórios para APIs
    response.headers.set('Content-Type', 'application/json')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    
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
    
    return response
  }
  
  // Para outras rotas, continua normalmente
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/(.*)',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 