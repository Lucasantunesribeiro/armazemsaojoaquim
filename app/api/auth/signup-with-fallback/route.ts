import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({
        error: 'Email, password e name são obrigatórios'
      }, { status: 400 })
    }

    console.log('🔄 Tentando signup com fallback para:', email)

    // Estratégia 1: Tentar signup normal primeiro
    const publicClient = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: publicData, error: publicError } = await publicClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name: name
        }
      }
    })

    // Se sucesso com API pública, retornar
    if (!publicError && publicData?.user) {
      console.log('✅ Signup público bem-sucedido')
      return NextResponse.json({
        success: true,
        method: 'public_api',
        user: publicData.user,
        session: publicData.session,
        message: 'Conta criada com sucesso!'
      })
    }

    // Se erro não é relacionado a SMTP, retornar erro original
    if (publicError && !publicError.message?.includes('Error sending confirmation email') && publicError.status !== 500) {
      console.log('❌ Erro não relacionado a SMTP:', publicError.message)
      return NextResponse.json({
        error: publicError.message,
        code: publicError.status
      }, { status: publicError.status || 400 })
    }

    console.log('⚠️ Detectado problema de SMTP/500, tentando Admin API fallback...')

    // Estratégia 2: Usar Admin API como fallback
    if (!supabaseServiceKey) {
      return NextResponse.json({
        error: 'Service key não configurada para fallback',
        original_error: publicError?.message
      }, { status: 500 })
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar se usuário já existe
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    const userExists = existingUsers?.users?.some(u => u.email === email)

    if (userExists) {
      return NextResponse.json({
        success: true,
        method: 'admin_api_existing',
        message: 'Conta já existe! Você pode fazer login.',
        user_exists: true
      })
    }

    // Criar usuário via Admin API (sem envio de email)
    const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar automaticamente
      user_metadata: {
        full_name: name,
        name: name
      }
    })

    if (adminError) {
      console.error('❌ Erro na Admin API:', adminError)
      return NextResponse.json({
        error: 'Falha em todas as estratégias de criação de conta',
        details: {
          public_error: publicError?.message,
          admin_error: adminError.message
        }
      }, { status: 500 })
    }

    if (adminData?.user) {
      console.log('✅ Usuário criado via Admin API:', adminData.user.email)
      
      return NextResponse.json({
        success: true,
        method: 'admin_api',
        user: adminData.user,
        message: 'Conta criada com sucesso via Admin API! Você já pode fazer login.',
        email_confirmed: true
      })
    }

    // Fallback final: informar sobre possível sucesso parcial
    return NextResponse.json({
      success: true,
      method: 'partial_success',
      message: 'Conta pode ter sido criada. Tente fazer login.',
      warning: 'Houve problemas técnicos, mas sua conta pode estar ativa.'
    })

  } catch (error) {
    console.error('❌ Erro inesperado no signup com fallback:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 