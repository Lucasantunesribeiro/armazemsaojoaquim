import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Lista de emails admin autorizada
const ADMIN_EMAILS = ['armazemsaojoaquimoficial@gmail.com']

export interface AdminAuthResult {
  isAdmin: boolean
  user: any | null
  session: any | null
  error: string | null
}

/**
 * Middleware centralizado para autenticação admin
 * Verifica sessão, usuário e permissões de admin
 * Suporta tanto cookies (SSR) quanto Authorization header (client-side)
 */
export async function verifyAdminAuth(request?: NextRequest): Promise<AdminAuthResult> {
  try {
    console.log('🔍 [ADMIN-AUTH] Verificando autenticação admin...')
    
    let supabase
    let session = null
    let user = null
    
    // MÉTODO 1: Tentar via cookies (SSR)
    try {
      supabase = await createServerClient()
      const { data: { session: cookieSession }, error: cookieError } = await supabase.auth.getSession()
      
      if (!cookieError && cookieSession) {
        console.log('✅ [ADMIN-AUTH] Sessão encontrada via cookies')
        session = cookieSession
        user = cookieSession.user
      }
    } catch (cookieError) {
      console.log('⚠️ [ADMIN-AUTH] Falha ao obter sessão via cookies:', cookieError)
    }
    
    // MÉTODO 2: Se sem sessão, tentar Authorization header (client-side)
    if (!session && request) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        
        console.log('🔄 [ADMIN-AUTH] Tentando Authorization header...')
        
        // Criar cliente com token
        const supabaseWithAuth = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        try {
          const { data: { user: authUser }, error: authError } = await supabaseWithAuth.auth.getUser(token)
          
          if (!authError && authUser) {
            console.log('✅ [ADMIN-AUTH] Sessão encontrada via Authorization header')
            session = { user: authUser, access_token: token }
            user = authUser
            supabase = supabaseWithAuth
          }
        } catch (authHeaderError) {
          console.log('❌ [ADMIN-AUTH] Erro no Authorization header:', authHeaderError)
        }
      }
    }
    
    if (!session || !user) {
      console.log('❌ [ADMIN-AUTH] Nenhuma sessão ativa encontrada')
      return {
        isAdmin: false,
        user: null,
        session: null,
        error: 'No active session'
      }
    }
    
    // Verificar se é admin
    const userEmail = user.email || ''
    const isAdmin = ADMIN_EMAILS.includes(userEmail)
    
    if (!isAdmin) {
      console.log('❌ [ADMIN-AUTH] Usuário não é admin:', userEmail)
      return {
        isAdmin: false,
        user,
        session,
        error: `Access denied for: ${userEmail}`
      }
    }
    
    console.log('✅ [ADMIN-AUTH] Autenticação admin válida:', userEmail)
    return {
      isAdmin: true,
      user,
      session,
      error: null
    }
    
  } catch (error) {
    console.error('💥 [ADMIN-AUTH] Erro interno:', error)
    return {
      isAdmin: false,
      user: null,
      session: null,
      error: `Internal error: ${error instanceof Error ? error.message : 'Unknown'}`
    }
  }
}

/**
 * Wrapper para APIs admin que retorna automaticamente erro 401/403 se necessário
 */
export async function withAdminAuth<T = any>(
  handler: (authResult: AdminAuthResult) => Promise<NextResponse<T>>,
  request?: NextRequest
): Promise<NextResponse<T | { error: string; debug?: any }>> {
  // Se o middleware já processou a requisição, apenas executar o handler
  // O middleware já verificou a autenticação e permissões
  if (request) {
    const adminSession = request.headers.get('X-Admin-Session')
    const adminVerified = request.headers.get('X-Admin-Verified')
    
    if (adminSession === 'true' && adminVerified) {
      console.log('✅ [ADMIN-AUTH] Middleware já verificou autenticação admin')
      
      // Criar um authResult mock baseado no middleware
      const authResult: AdminAuthResult = {
        isAdmin: true,
        user: null, // Será obtido pelo handler se necessário
        session: null,
        error: null
      }
      
      try {
        return await handler(authResult)
      } catch (error) {
        console.error('💥 [ADMIN-AUTH] Handler error:', error)
        return NextResponse.json(
          {
            error: 'Internal server error',
            debug: process.env.NODE_ENV === 'development' ? {
              message: error instanceof Error ? error.message : 'Unknown error'
            } : undefined
          } as T | { error: string; debug?: any },
          { status: 500 }
        )
      }
    }
  }
  
  // Fallback: verificação manual se o middleware não processou
  console.log('⚠️ [ADMIN-AUTH] Middleware não processou, fazendo verificação manual')
  const authResult = await verifyAdminAuth(request)
  
  if (!authResult.isAdmin) {
    console.error('🚫 [ADMIN-AUTH] Acesso negado:', authResult.error)
    
    const statusCode = authResult.session ? 403 : 401
    const errorMessage = authResult.session ? 'Access denied - admin only' : 'Authentication required'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? {
          originalError: authResult.error,
          hasSession: !!authResult.session,
          hasUser: !!authResult.user,
          attemptedMethods: {
            cookies: 'tried',
            authHeader: request?.headers.get('authorization') ? 'tried' : 'not_available'
          }
        } : undefined
      } as T | { error: string; debug?: any },
      { status: statusCode }
    )
  }
  
  try {
    return await handler(authResult)
  } catch (error) {
    console.error('💥 [ADMIN-AUTH] Handler error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error'
        } : undefined
      } as T | { error: string; debug?: any },
      { status: 500 }
    )
  }
}

/**
 * Função de teste para validar admin auth
 */
export async function testAdminAuth(): Promise<{
  success: boolean
  details: AdminAuthResult & { 
    timestamp: string
    environment: string
  }
}> {
  const authResult = await verifyAdminAuth()
  
  return {
    success: authResult.isAdmin,
    details: {
      ...authResult,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    }
  }
}