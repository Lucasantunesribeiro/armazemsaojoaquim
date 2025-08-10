import { NextRequest, NextResponse } from 'next/server'
import { loginWithFallback } from '@/lib/auth/enhanced-login'
import { logAuthEvent } from '@/lib/auth/logging'
import { isAdminCredentials } from '@/lib/auth/admin-verification'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      await logAuthEvent({
        email: email || '',
        action: 'login',
        method: 'admin_login_api',
        success: false,
        error: 'Missing credentials'
      })
      return NextResponse.json({
        success: false,
        error: 'Email e password são obrigatórios'
      }, { status: 400 })
    }

    await logAuthEvent({
      email,
      action: 'login',
      method: 'admin_login_api',
      success: false
    })

    // Verificar se são credenciais admin
    if (!isAdminCredentials(email, password)) {
      await logAuthEvent({
        email,
        action: 'login',
        method: 'admin_login_api',
        success: false,
        error: 'Invalid admin credentials'
      })
      return NextResponse.json({
        success: false,
        error: 'Credenciais inválidas para admin'
      }, { status: 401 })
    }

    // Tentar login com fallback
    const result = await loginWithFallback({ email, password })
    
    await logAuthEvent({
      email,
      action: 'login',
      method: 'admin_login_api',
      success: result.success,
      user_id: result.user?.id,
      error: result.success ? undefined : (result.error || 'Login failed')
    })

    if (result.success) {
      // Se login bem-sucedido e tem sessão Supabase, configurar cookies
      if (result.session) {
        try {
          const supabase = await createServerClient()
          await supabase.auth.setSession(result.session)
          // Session cookies set successfully
        } catch (error) {
          console.error('Error setting session cookies:', error)
        }
      }

      return NextResponse.json({
        success: true,
        user: result.user,
        message: 'Login realizado com sucesso!'
      })
    }

    return NextResponse.json({
      success: false,
      error: result.error || 'Login falhou'
    }, { status: 401 })

  } catch (error: any) {
    console.error('Admin login internal error:', error)
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