import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth')
  }
  
  return session
}

export async function requireAdmin() {
  console.log('🚀 MIDDLEWARE requireAdmin: INICIANDO VERIFICAÇÃO')
  console.log('🚀 MIDDLEWARE requireAdmin: Timestamp:', new Date().toISOString())
  
  // Primeiro, tentar com createServerComponentClient
  const supabase = createServerComponentClient({ cookies })
  
  // Tentar múltiplas vezes para lidar with race condition
  let session = null
  let sessionError = null
  
  for (let attempt = 0; attempt < 5; attempt++) {
    console.log(`🔄 MIDDLEWARE requireAdmin: Tentativa ${attempt + 1}/5 de obter sessão...`)
    
    const { data: { session: currentSession }, error: currentError } = await supabase.auth.getSession()
    
    console.log(`📊 MIDDLEWARE requireAdmin: Tentativa ${attempt + 1}/5:`, {
      hasSession: !!currentSession,
      userId: currentSession?.user?.id,
      userEmail: currentSession?.user?.email,
      error: currentError?.message
    })
    
    if (currentSession && !currentError) {
      session = currentSession
      sessionError = null
      console.log(`✅ MIDDLEWARE requireAdmin: Sessão obtida na tentativa ${attempt + 1}`)
      break
    }
    
    if (attempt < 4) {
      const delay = (attempt + 1) * 300 // Delay crescente: 300ms, 600ms, 900ms, 1200ms
      console.log(`⏳ MIDDLEWARE requireAdmin: Aguardando ${delay}ms antes de tentar novamente...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    } else {
      session = currentSession
      sessionError = currentError
    }
  }
  
  console.log('📋 MIDDLEWARE requireAdmin: RESULTADO FINAL DA SESSÃO:', {
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    error: sessionError?.message
  })
  
  if (!session || sessionError) {
    console.error('❌ MIDDLEWARE requireAdmin: FALHA DE SESSÃO - REDIRECIONANDO PARA /auth')
    console.error('❌ MIDDLEWARE requireAdmin: Detalhes:', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    })
    redirect('/auth?error=session_required&message=Sessão expirada ou inválida')
  }

  console.log('🔍 MIDDLEWARE requireAdmin: Verificando admin para user:', {
    id: session.user.id,
    email: session.user.email
  })
  
  // Busca o usuário na tabela users (com múltiplas tentativas)
  let user = null
  let error = null
  
  console.log('🔍 MIDDLEWARE requireAdmin: INICIANDO BUSCA NO BANCO DE DADOS')
  
  for (let attempt = 0; attempt < 2; attempt++) {
    console.log(`🔄 MIDDLEWARE requireAdmin: DB Tentativa ${attempt + 1}/2 - Buscando usuário...`)
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*') // Selecionar tudo para debug
      .eq('id', session.user.id)
      .single()

    console.log(`📊 MIDDLEWARE requireAdmin: DB Tentativa ${attempt + 1}/2:`, {
      found: !!userData,
      user: userData,
      error: userError?.message,
      errorCode: userError?.code
    })
    
    if (userData && !userError) {
      user = userData
      error = null
      console.log(`✅ MIDDLEWARE requireAdmin: Usuário encontrado na tentativa ${attempt + 1}`)
      break
    }
    
    if (attempt < 1) {
      console.log('⏳ MIDDLEWARE requireAdmin: Aguardando 300ms antes de tentar DB novamente...')
      await new Promise(resolve => setTimeout(resolve, 300))
    } else {
      user = userData
      error = userError
    }
  }

  console.log('📋 MIDDLEWARE requireAdmin: RESULTADO FINAL DO BANCO:', {
    found: !!user,
    user: user,
    role: user?.role,
    error: error?.message,
    errorCode: error?.code
  })

  if (error) {
    console.error('MIDDLEWARE requireAdmin: Erro ao buscar usuário na tabela users:', error)
    console.error('MIDDLEWARE requireAdmin: Detalhes do erro:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    redirect('/unauthorized?error=database_error&message=Erro ao verificar permissões')
  }
  if (!user) {
    console.error('MIDDLEWARE requireAdmin: Usuário não encontrado na tabela users', {
      userId: session.user.id,
      userEmail: session.user.email
    })
    redirect('/unauthorized?error=user_not_found&message=Usuário não encontrado no sistema')
  }
  if (user.role !== 'admin') {
    console.error('❌ MIDDLEWARE requireAdmin: USUÁRIO NÃO É ADMIN - REDIRECIONANDO')
    console.error('❌ MIDDLEWARE requireAdmin: Detalhes do usuário:', {
      userId: session.user.id,
      userEmail: session.user.email,
      currentRole: user.role,
      expectedRole: 'admin',
      timestamp: new Date().toISOString()
    })
    redirect('/unauthorized?error=insufficient_permissions&message=Acesso negado - privilégios de administrador necessários')
  }
  
  // Se chegou aqui, é admin
  console.log('🎉 MIDDLEWARE requireAdmin: SUCESSO! USUÁRIO É ADMIN')
  console.log('🎉 MIDDLEWARE requireAdmin: Permitindo acesso ao painel admin')
  return session
}

export async function getUser() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()
  
  return user
}

export async function isAdmin(): Promise<boolean> {
  const user = await getUser()
  return user?.role === 'admin'
}