import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware completamente desabilitado para debug do HTTP2 error
export function middleware(request: NextRequest) {
  // Apenas passar através sem modificações
  return NextResponse.next()
}

// Desabilitar matcher temporariamente
export const config = {
  matcher: [],
}