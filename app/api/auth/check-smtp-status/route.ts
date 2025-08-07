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

// POST removido para evitar complexidade - signup será feito diretamente no componente 
