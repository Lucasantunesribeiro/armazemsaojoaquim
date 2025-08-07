import { createServerClient } from '../supabase'
// import { cookies } from 'next/headers' // Não necessário mais
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAuth() {
  const supabase = await createServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth')
  }
  
  return session
}

export async function requireAdmin(request?: NextRequest, response?: NextResponse) {
  console.log('🔍 MIDDLEWARE requireAdmin: Verificando admin access...')
  
  // Usar o cliente correto dependendo do contexto
  let supabase
  if (request && response) {
    // Se estamos no middleware, usar createMiddlewareClient
    const { createMiddlewareClient } = await import('../supabase')
    supabase = createMiddlewareClient(request, response)
  } else {
    // Se estamos em server component, usar createServerClient
    supabase = await createServerClient()
  }
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  console.log('📊 MIDDLEWARE requireAdmin: Sessão:', {
    hasSession: !!session,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
    error: error?.message
  })
  
  // Se não há sessão, redirecionar
  if (!session) {
    console.log('❌ MIDDLEWARE requireAdmin: Sem sessão - Redirecionando para /auth')
    redirect('/auth?error=middleware_no_session&message=Sessão não encontrada')
  }
  
  // Verificação por email como fallback principal (mais confiável)
  const isAdminByEmail = session.user.email === 'armazemsaojoaquimoficial@gmail.com'
  
  if (isAdminByEmail) {
    console.log('✅ MIDDLEWARE requireAdmin: Acesso autorizado por email')
    return session
  }
  
  // Tentar verificação por role no banco - primeiro por ID da sessão
  try {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (!userError && userData?.role === 'admin') {
      console.log('✅ MIDDLEWARE requireAdmin: Acesso autorizado por role (ID match)')
      return session
    }
    
    console.log('🔍 MIDDLEWARE requireAdmin: Role check by ID:', {
      found: !!userData,
      role: userData?.role,
      error: userError?.message
    })
  } catch (dbError: any) {
    console.warn('⚠️ MIDDLEWARE requireAdmin: Erro ao verificar role por ID:', dbError.message)
  }
  
  // Se falhou por ID, tentar verificação por email no banco
  try {
    const { data: adminUserData, error: adminUserError } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('email', session.user.email)
      .single()
    
    if (!adminUserError && adminUserData?.role === 'admin') {
      console.log('✅ MIDDLEWARE requireAdmin: Acesso autorizado por role (email match)')
      console.log('🔍 MIDDLEWARE requireAdmin: ID mismatch detected:', {
        sessionUserId: session.user.id,
        dbUserId: adminUserData.id,
        userEmail: session.user.email
      })
      return session
    }
    
    console.log('🔍 MIDDLEWARE requireAdmin: Role check by email:', {
      found: !!adminUserData,
      role: adminUserData?.role,
      error: adminUserError?.message
    })
  } catch (dbError: any) {
    console.warn('⚠️ MIDDLEWARE requireAdmin: Erro ao verificar role por email:', dbError.message)
  }
  
  // Se chegou até aqui, não é admin
  console.log('❌ MIDDLEWARE requireAdmin: Não é admin - Redirecionando para /unauthorized')
  redirect('/unauthorized?error=middleware_not_admin&message=Usuário não é administrador')
}

export async function getUser() {
  const supabase = await createServerClient()
  
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
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return false
    }
    
    // Primeiro verificar por email (mais confiável)
    if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
      return true
    }
    
    // Backup: verificar role no banco por ID
    try {
      const { data: user } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (user?.role === 'admin') {
        return true
      }
    } catch (error) {
      console.warn('⚠️ isAdmin: Erro ao verificar role por ID:', error)
    }
    
    // Fallback: verificar role no banco por email
    try {
      const { data: adminUser } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', session.user.email)
        .single()
      
      return adminUser?.role === 'admin'
    } catch (error) {
      console.warn('⚠️ isAdmin: Erro ao verificar role por email:', error)
    }
    
    return false
  } catch (error) {
    console.warn('⚠️ isAdmin: Erro ao verificar status admin:', error)
    return false
  }
}