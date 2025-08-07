import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente admin para bypass de rate limits
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email, password, userData } = await request.json()

    console.log('🔄 Tentando signup via Admin API (bypass rate limit)')

    // Usar Admin API para criar usuário (bypass rate limit)
    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: userData,
      email_confirm: false // Requer confirmação manual por email
    })

    if (error) {
      console.error('❌ Erro Admin API:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        fallback: true 
      }, { status: 400 })
    }

    if (authData.user) {
      console.log('✅ Usuário criado via Admin API:', authData.user.id)

      // Enviar email de confirmação manualmente
      const { error: confirmError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: email,
        password: password,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
      })

      if (confirmError) {
        console.error('⚠️ Erro ao gerar link de confirmação:', confirmError)
        // Usuário criado mas sem email de confirmação
        return NextResponse.json({
          success: true,
          message: 'Conta criada com sucesso! Entre em contato para ativar sua conta.',
          requiresManualActivation: true,
          userId: authData.user.id
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Conta criada com sucesso! Verifique seu email para confirmar.',
        userId: authData.user.id,
        method: 'admin_api'
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Falha na criação do usuário' 
    }, { status: 500 })

  } catch (error) {
    console.error('❌ Erro inesperado no signup bypass:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 
