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
  const supabase = createServerComponentClient({ cookies })
  
  // Tentar múltiplas vezes para lidar com race condition
  let session = null
  let sessionError = null
  
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: { session: currentSession }, error: currentError } = await supabase.auth.getSession()
    
    console.log(`MIDDLEWARE requireAdmin: Tentativa ${attempt + 1}/3 - Session:`, !!currentSession, 'Error:', currentError)
    
    if (currentSession && !currentError) {
      session = currentSession
      sessionError = null
      break
    }
    
    if (attempt < 2) {
      // Aguardar um pouco antes de tentar novamente
      console.log('MIDDLEWARE requireAdmin: Aguardando antes de tentar novamente...')
      await new Promise(resolve => setTimeout(resolve, 500))
    } else {
      session = currentSession
      sessionError = currentError
    }
  }
  
  console.log('MIDDLEWARE requireAdmin: Session final:', !!session)
  console.log('MIDDLEWARE requireAdmin: Session Error final:', sessionError)
  
  if (!session || sessionError) {
    console.warn('MIDDLEWARE requireAdmin: Sem sessão ou erro de sessão após 3 tentativas, redirecionando para /auth', {
      hasSession: !!session,
      sessionError,
      userId: session?.user?.id
    })
    redirect('/auth?error=session_required&message=Sessão expirada ou inválida')
  }

  // Debug: log id do usuário
  console.log('MIDDLEWARE requireAdmin: Verificando admin para user id:', session.user.id)
  
  // Busca o usuário na tabela users (com múltiplas tentativas)
  let user = null
  let error = null
  
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    console.log(`MIDDLEWARE requireAdmin: DB Tentativa ${attempt + 1}/2 - User:`, userData, 'Error:', userError)
    
    if (userData && !userError) {
      user = userData
      error = null
      break
    }
    
    if (attempt < 1) {
      console.log('MIDDLEWARE requireAdmin: Aguardando antes de tentar DB novamente...')
      await new Promise(resolve => setTimeout(resolve, 300))
    } else {
      user = userData
      error = userError
    }
  }

  console.log('MIDDLEWARE requireAdmin: Resultado user final:', user)
  console.log('MIDDLEWARE requireAdmin: Role final:', user?.role)
  console.log('MIDDLEWARE requireAdmin: Error final:', error)

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
    console.warn('MIDDLEWARE requireAdmin: Usuário não é admin:', {
      userId: session.user.id,
      userEmail: session.user.email,
      currentRole: user.role,
      expectedRole: 'admin'
    })
    redirect('/unauthorized?error=insufficient_permissions&message=Acesso negado - privilégios de administrador necessários')
  }
  // Se chegou aqui, é admin
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