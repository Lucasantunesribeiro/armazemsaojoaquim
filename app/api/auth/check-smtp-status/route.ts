import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    console.log('🔍 Verificando status SMTP do Supabase...')

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Teste 1: Tentar enviar convite (teste SMTP)
    const testEmail = `smtp-check-${Date.now()}@example.com`
    
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(testEmail, {
      redirectTo: 'https://armazemsaojoaquim.netlify.app/auth/callback'
    })

    const smtpWorking = !error || !error.message?.includes('Error sending')

    // Teste 2: Verificar se signup público funciona
    const publicClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const testEmail2 = `signup-check-${Date.now()}@example.com`
    
    const { error: signupError } = await publicClient.auth.signUp({
      email: testEmail2,
      password: 'TestPassword123!',
      options: {
        data: { full_name: 'Test User' }
      }
    })

    const signupWorking = !signupError || !signupError.message?.includes('Error sending confirmation email')

    const status = {
      smtpConfigured: smtpWorking,
      publicSignupWorking: signupWorking,
      recommendedStrategy: smtpWorking && signupWorking ? 'public' : 'admin',
      timestamp: new Date().toISOString(),
      details: {
        inviteTest: error ? error.message : 'Success',
        signupTest: signupError ? signupError.message : 'Success'
      }
    }

    console.log('📊 Status SMTP:', status)

    return NextResponse.json(status)

  } catch (error) {
    console.error('❌ Erro verificando SMTP:', error)
    
    return NextResponse.json({
      smtpConfigured: false,
      publicSignupWorking: false,
      recommendedStrategy: 'admin',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({
        error: 'Email, password e name são obrigatórios'
      }, { status: 400 })
    }

    // Primeiro, verificar status SMTP
    const statusResponse = await fetch(`${request.nextUrl.origin}/api/auth/check-smtp-status`)
    const smtpStatus = await statusResponse.json()

    console.log('🔄 Signup inteligente para:', email, 'Strategy:', smtpStatus.recommendedStrategy)

    if (smtpStatus.recommendedStrategy === 'public' && smtpStatus.smtpConfigured) {
      // SMTP funcionando - usar signup normal com verificação por email
      console.log('✅ SMTP configurado - usando signup normal com verificação')
      
      const publicClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data, error } = await publicClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name
          }
        }
      })

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        message: '✅ Conta criada com sucesso! Verifique seu email para confirmar.',
        requiresEmailVerification: true,
        user: data.user,
        strategy: 'public_with_verification'
      })

    } else {
      // SMTP não funcionando - usar Admin API (sem verificação por email)
      console.log('⚠️ SMTP não configurado - usando Admin API sem verificação')
      
      const adminClient = createClient(supabaseUrl, supabaseServiceKey)
      
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: name,
          name: name
        },
        email_confirm: true // Confirma automaticamente o email
      })

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        message: '✅ Conta criada com sucesso! Você já pode fazer login.',
        requiresEmailVerification: false,
        user: data.user,
        strategy: 'admin_auto_confirm',
        warning: '⚠️ SMTP não está configurado. Configure SMTP para habilitar verificação por email.'
      })
    }

  } catch (error) {
    console.error('❌ Erro no signup inteligente:', error)
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false
    }, { status: 500 })
  }
} 