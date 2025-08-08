import { NextRequest, NextResponse } from 'next/server'
import { loginWithFallback, logAuthEvent, isAdminCredentials } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      logAuthEvent('ADMIN_LOGIN_MISSING_CREDENTIALS')
      return NextResponse.json({
        success: false,
        error: 'Email e password são obrigatórios'
      }, { status: 400 })
    }

    logAuthEvent('ADMIN_LOGIN_ATTEMPT', { email })

    // Verificar se são credenciais admin
    if (!isAdminCredentials(email, password)) {
      logAuthEvent('ADMIN_LOGIN_INVALID_CREDENTIALS', { email })
      return NextResponse.json({
        success: false,
        error: 'Credenciais inválidas para admin'
      }, { status: 401 })
    }

    // Tentar login com fallback
    const result = await loginWithFallback(email, password)
    
    logAuthEvent('ADMIN_LOGIN_RESULT', {
      success: result.success,
      method: result.method,
      userId: result.user?.id
    })

    if (result.success) {
      // Se login bem-sucedido e tem sessão Supabase, configurar cookies
      if (result.session && result.method === 'supabase_auth') {
        try {
          const supabase = await createServerClient()
          await supabase.auth.setSession(result.session)
          logAuthEvent('ADMIN_LOGIN_COOKIES_SET')
        } catch (error) {
          logAuthEvent('ADMIN_LOGIN_COOKIES_ERROR', { error: error instanceof Error ? error.message : 'Unknown' })
        }
      }

      return NextResponse.json({
        success: true,
        user: result.user,
        method: result.method,
        message: getSuccessMessage(result.method)
      })
    }

    return NextResponse.json({
      success: false,
      error: result.error || 'Login falhou'
    }, { status: 401 })

  } catch (error: any) {
    logAuthEvent('ADMIN_LOGIN_INTERNAL_ERROR', { error: error.message })
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 })
  }
}

function getSuccessMessage(method?: string): string {
  switch (method) {
    case 'supabase_auth':
      return 'Login realizado com sucesso via Supabase'
    case 'admin_fallback':
      return 'Login admin realizado via fallback de perfil'
    case 'credential_fallback':
      return 'Login admin realizado via fallback de credenciais'
    default:
      return 'Login realizado com sucesso'
  }
}

// GET endpoint para verificar status da API
export async function GET() {
  return NextResponse.json({
    endpoint: 'admin-login',
    status: 'active',
    description: 'Login específico para admin com fallback robusto',
    methods: ['POST'],
    requiredFields: ['email', 'password']
  })
}