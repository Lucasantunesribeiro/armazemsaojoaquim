import { createServerClient } from './supabase'
import { User, Session } from '@supabase/supabase-js'

// Tipos para o sistema de autenticação
export interface AuthUser {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'user'
  source: 'supabase' | 'profiles' | 'fallback'
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  session?: Session
  error?: string
  method?: string
}

// Email admin configurado
const ADMIN_EMAIL = 'armazemsaojoaquimoficial@gmail.com'
const ADMIN_PASSWORD = 'armazem2000'

// Cache para performance
const userCache = new Map<string, { data: AuthUser; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

/**
 * Limpa cache expirado
 */
function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      userCache.delete(key)
    }
  }
}

/**
 * Verifica se um usuário é admin
 * Múltiplos fallbacks para garantir acesso admin sempre
 */
export async function verifyAdmin(session?: Session | null): Promise<AuthResult> {
  console.log('🔍 AUTH: Verificando admin...', { hasSession: !!session, email: session?.user?.email })
  
  try {
    // Fallback 1: Verificação direta por email se tem sessão
    if (session?.user?.email === ADMIN_EMAIL) {
      console.log('✅ AUTH: Admin confirmado por email direto')
      return {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || 'Admin',
          role: 'admin',
          source: 'supabase'
        }
      }
    }

    // Se não tem sessão, não é admin
    if (!session?.user) {
      console.log('❌ AUTH: Sem sessão ativa')
      return {
        success: false,
        error: 'No active session'
      }
    }

    // Verifica cache primeiro
    const cacheKey = `admin-${session.user.id}`
    const cached = userCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('✅ AUTH: Admin encontrado em cache')
      return {
        success: cached.data.role === 'admin',
        user: cached.data
      }
    }

    // Busca no banco (tabela profiles)
    const supabase = await createServerClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('❌ AUTH: Erro ao buscar profile:', error)
      
      // Fallback 2: Se erro no banco mas email é admin, permite acesso
      if (session.user.email === ADMIN_EMAIL) {
        console.log('✅ AUTH: Admin confirmado por email (fallback erro banco)')
        return {
          success: true,
          user: {
            id: session.user.id,
            email: session.user.email,
            full_name: 'Admin',
            role: 'admin',
            source: 'fallback'
          }
        }
      }

      return {
        success: false,
        error: 'Database error',
        method: error.message
      }
    }

    // Verifica role no profile
    const isAdmin = profile.role === 'admin' || profile.email === ADMIN_EMAIL
    
    const authUser: AuthUser = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name || 'Usuário',
      role: isAdmin ? 'admin' : 'user',
      source: 'profiles'
    }

    // Cache o resultado
    if (Math.random() < 0.1) cleanExpiredCache() // Limpeza esporádica
    userCache.set(cacheKey, {
      data: authUser,
      timestamp: Date.now()
    })

    console.log('✅ AUTH: Verificação completa:', { isAdmin, email: profile.email })
    
    return {
      success: isAdmin,
      user: authUser
    }

  } catch (error: any) {
    console.error('❌ AUTH: Erro interno na verificação:', error)
    
    // Fallback final: Se qualquer erro mas email é admin, permite
    if (session?.user?.email === ADMIN_EMAIL) {
      console.log('✅ AUTH: Admin confirmado por email (fallback erro geral)')
      return {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          full_name: 'Admin',
          role: 'admin',
          source: 'fallback'
        }
      }
    }

    return {
      success: false,
      error: 'Internal error',
      method: error.message
    }
  }
}

/**
 * Obtém usuário atual da sessão
 */
export async function getCurrentUser(session?: Session | null): Promise<AuthUser | null> {
  if (!session?.user) return null

  try {
    const supabase = await createServerClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.warn('⚠️ AUTH: Profile não encontrado, usando dados da sessão')
      return {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || 'Usuário',
        role: session.user.email === ADMIN_EMAIL ? 'admin' : 'user',
        source: 'supabase'
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name || 'Usuário',
      role: profile.role || (profile.email === ADMIN_EMAIL ? 'admin' : 'user'),
      source: 'profiles'
    }

  } catch (error) {
    console.error('❌ AUTH: Erro ao buscar usuário atual:', error)
    return null
  }
}

/**
 * Middleware que requer admin - lança exceção se não for
 */
export async function requireAdmin(session?: Session | null): Promise<AuthUser> {
  const result = await verifyAdmin(session)
  
  if (!result.success || !result.user) {
    throw new Error(result.error || 'Admin access required')
  }

  return result.user
}

/**
 * Login com fallback robusto para admin
 * Permite login mesmo se Supabase Auth falhar
 */
export async function loginWithFallback(email: string, password: string): Promise<AuthResult> {
  console.log('🔐 AUTH: Tentando login com fallback para:', email)

  try {
    const supabase = await createServerClient()

    // Estratégia 1: Login normal Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error && data.session) {
      console.log('✅ AUTH: Login Supabase bem-sucedido')
      const user = await getCurrentUser(data.session)
      return {
        success: true,
        user: user || undefined,
        session: data.session,
        method: 'supabase_auth'
      }
    }

    // Estratégia 2: Fallback para admin direto
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log('🔄 AUTH: Tentando fallback admin direto...')
      
      // Verificar se admin existe na base
      const { data: adminProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', ADMIN_EMAIL)
        .single()

      if (!profileError && adminProfile) {
        console.log('✅ AUTH: Admin encontrado na base, criando sessão fallback')
        
        // Retorna sucesso com dados do profile
        return {
          success: true,
          user: {
            id: adminProfile.id,
            email: adminProfile.email,
            full_name: adminProfile.full_name || 'Admin',
            role: 'admin',
            source: 'profiles'
          },
          method: 'admin_fallback'
        }
      }

      // Se nem profile tem, mas credenciais admin corretas
      console.log('⚠️ AUTH: Credenciais admin corretas mas profile não encontrado')
      return {
        success: true,
        user: {
          id: 'admin-fallback',
          email: ADMIN_EMAIL,
          full_name: 'Admin',
          role: 'admin',
          source: 'fallback'
        },
        method: 'credential_fallback'
      }
    }

    // Login falhou
    console.log('❌ AUTH: Login falhou:', error?.message)
    return {
      success: false,
      error: error?.message || 'Invalid credentials'
    }

  } catch (error: any) {
    console.error('❌ AUTH: Erro no login:', error)
    return {
      success: false,
      error: 'Login error: ' + error.message
    }
  }
}

/**
 * Invalida cache de usuário específico
 */
export function invalidateUserCache(userId: string) {
  userCache.delete(`admin-${userId}`)
}

/**
 * Limpa todo o cache de autenticação
 */
export function clearAuthCache() {
  userCache.clear()
}

/**
 * Verifica se credenciais são do admin
 */
export function isAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

/**
 * Helper para logs estruturados
 */
export function logAuthEvent(event: string, data?: any) {
  console.log(`🔐 AUTH [${event}]:`, {
    timestamp: new Date().toISOString(),
    ...data
  })
}