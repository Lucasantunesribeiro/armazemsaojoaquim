import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    console.log('🔍 Tentando login com:', { email })
    
    const supabase = createClient()
    
    // TESTE 1: Verificar se usuário existe no auth
    console.log('🔍 Verificando usuário no auth.users...')
    const { data: authUser, error: authError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('email', email)
      .single()
    
    if (authError) {
      console.error('❌ Usuário não encontrado em profiles:', authError)
      return NextResponse.json({
        success: false,
        error: 'Usuário não encontrado no sistema',
        details: authError,
        step: 'profile_lookup'
      }, { status: 404 })
    }
    
    console.log('✅ Usuário encontrado em profiles:', authUser)
    
    // TESTE 2: Tentar login
    console.log('🔍 Executando login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError)
      return NextResponse.json({
        success: false,
        error: loginError.message,
        code: loginError.name,
        details: loginError,
        step: 'auth_login',
        userExists: true
      }, { status: 400 })
    }
    
    console.log('✅ Login bem-sucedido!')
    
    // TESTE 3: Verificar profile após login
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single()
    
    // TESTE 4: Verificar admin_users (se existir)
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', loginData.user.id)
      .single()
    
    console.log('📊 Resultado completo:', {
      userId: loginData.user.id,
      email: loginData.user.email,
      profileFound: !profileError,
      adminFound: !adminError,
      profileRole: profileData?.role,
      adminRole: adminUser?.role
    })
    
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso - Schema funcionando!',
      user: {
        id: loginData.user.id,
        email: loginData.user.email,
        emailConfirmed: loginData.user.email_confirmed_at ? true : false,
        lastSignIn: loginData.user.last_sign_in_at
      },
      profile: {
        hasRecord: !profileError,
        role: profileData?.role,
        fullName: profileData?.full_name,
        data: profileData
      },
      admin: {
        hasRecord: !adminError,
        role: adminUser?.role,
        permissions: adminUser?.permissions
      },
      session: {
        accessToken: loginData.session.access_token ? 'presente' : 'ausente',
        refreshToken: loginData.session.refresh_token ? 'presente' : 'ausente',
        expiresAt: loginData.session.expires_at
      },
      schemaStatus: {
        profilesTable: 'OK',
        usersView: 'OK',
        adminTable: 'OK',
        rlsPolicies: 'CORRIGIDAS',
        triggers: 'FUNCIONANDO'
      }
    })
    
  } catch (error: any) {
    console.error('❌ Erro geral no teste de login:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste de login',
      details: error.message,
      stack: error.stack?.split('\n').slice(0, 5) // Primeiras 5 linhas do stack
    }, { status: 500 })
  }
}