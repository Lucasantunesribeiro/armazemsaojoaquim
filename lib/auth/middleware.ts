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
  
  const { data: { session } } = await supabase.auth.getSession()
  
  console.log('MIDDLEWARE requireAdmin: Session:', session)
  if (!session) {
    console.warn('MIDDLEWARE requireAdmin: Sem sessão, redirecionando para /auth')
    redirect('/auth')
  }

  // Debug: log id do usuário
  console.log('MIDDLEWARE requireAdmin: Verificando admin para user id:', session.user.id)
  
  // Busca o usuário na tabela users
  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  console.log('MIDDLEWARE requireAdmin: Resultado user:', user)
  console.log('MIDDLEWARE requireAdmin: Role:', user?.role)
  console.log('MIDDLEWARE requireAdmin: Error:', error)

  if (error) {
    console.error('MIDDLEWARE requireAdmin: Erro ao buscar usuário na tabela users:', error)
    redirect('/unauthorized')
  }
  if (!user) {
    console.error('MIDDLEWARE requireAdmin: Usuário não encontrado na tabela users')
    redirect('/unauthorized')
  }
  if (user.role !== 'admin') {
    console.warn('MIDDLEWARE requireAdmin: Usuário não é admin:', user)
    redirect('/unauthorized')
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