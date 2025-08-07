import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    // Verificar configuração
    const configured = isSupabaseConfigured()
    if (!configured) {
      return NextResponse.json({
        success: false,
        error: 'Supabase não configurado',
        details: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      }, { status: 500 })
    }

    const supabase = createClient()

    // Teste 1: Conexão básica
    console.log('🔍 Testando conexão com Supabase...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Erro de conexão com Supabase',
        details: {
          message: connectionError.message,
          code: connectionError.code,
          hint: connectionError.hint
        }
      }, { status: 500 })
    }

    // Teste 2: Verificar auth endpoint
    console.log('🔍 Testando auth endpoint...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro no auth endpoint:', sessionError)
    }

    // Teste 3: Verificar usuário específico
    console.log('🔍 Verificando usuário armazemsaojoaquimoficial@gmail.com...')
    
    // Primeiro, vamos tentar fazer login com credenciais de teste
    const testLoginResult = await supabase.auth.signInWithPassword({
      email: 'armazemsaojoaquimoficial@gmail.com',
      password: 'admin123' // Senha padrão de teste
    })

    console.log('📊 Resultado do teste de login:', {
      user: testLoginResult.data.user?.email,
      error: testLoginResult.error?.message
    })

    return NextResponse.json({
      success: true,
      message: 'Testes de conectividade Supabase concluídos',
      tests: {
        connection: {
          success: !connectionError,
          error: connectionError?.message || null
        },
        auth: {
          success: !sessionError,
          error: sessionError?.message || null,
          session: !!sessionData.session
        },
        login: {
          success: !testLoginResult.error,
          error: testLoginResult.error?.message || null,
          user: testLoginResult.data.user?.email || null
        }
      },
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        project: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]?.replace('https://', '')
      }
    })

  } catch (error: any) {
    console.error('❌ Erro geral no teste:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste de conectividade',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Teste de criação de usuário via Admin API
    const supabase = createClient()
    
    console.log('🔍 Testando criação de usuário admin...')
    
    // Tentativa de criar usuário usando Service Role (se disponível)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // Verificar se usuário já existe
      const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers()
      
      if (listError) {
        return NextResponse.json({
          success: false,
          error: 'Erro ao listar usuários',
          details: listError
        }, { status: 500 })
      }

      const userExists = existingUsers.users.find(u => u.email === 'armazemsaojoaquimoficial@gmail.com')
      
      if (!userExists) {
        // Criar usuário
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: 'armazemsaojoaquimoficial@gmail.com',
          password: 'admin123',
          email_confirm: true,
          user_metadata: {
            role: 'admin',
            name: 'Admin Armazém'
          }
        })

        if (createError) {
          return NextResponse.json({
            success: false,
            error: 'Erro ao criar usuário',
            details: createError
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Usuário criado com sucesso',
          user: {
            id: newUser.user.id,
            email: newUser.user.email,
            confirmed: newUser.user.email_confirmed_at ? true : false
          }
        })
      } else {
        // Usuário já existe - verificar status
        return NextResponse.json({
          success: true,
          message: 'Usuário já existe',
          user: {
            id: userExists.id,
            email: userExists.email,
            confirmed: userExists.email_confirmed_at ? true : false,
            lastSignIn: userExists.last_sign_in_at
          }
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Service Role Key não configurada'
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ Erro no teste POST:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste POST',
      details: error.message
    }, { status: 500 })
  }
}
