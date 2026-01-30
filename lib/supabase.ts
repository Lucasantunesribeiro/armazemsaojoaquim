import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '../types/database.types'

// Edge Runtime detection
const isEdgeRuntime = () => {
  try {
    return typeof globalThis !== 'undefined' &&
      ('EdgeRuntime' in globalThis ||
        globalThis.navigator?.userAgent?.includes('Edge'))
  } catch {
    return false
  }
}

// Verificar se as variáveis de ambiente estão configuradas
export const isSupabaseConfigured = () => {
  // Use typeof window to detect client-side vs server-side
  const isClient = typeof window !== 'undefined'

  let url: string | undefined
  let key: string | undefined

  if (isClient) {
    // Client-side: access via window object or direct env vars
    url = process.env.NEXT_PUBLIC_SUPABASE_URL
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  } else {
    // Server-side: safe to use process.env
    url = process.env.NEXT_PUBLIC_SUPABASE_URL
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  return !!(url && key && url !== 'your_supabase_url' && key !== 'your_supabase_anon_key')
}

// Função para criar cliente mock quando Supabase não está configurado
function createMockClient() {
  const mockResponse = {
    data: [],
    error: null,
    count: 0,
    status: 200,
    statusText: 'OK'
  }

  const mockQuery = {
    select: () => mockQuery,
    insert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    eq: () => mockQuery,
    neq: () => mockQuery,
    gt: () => mockQuery,
    gte: () => mockQuery,
    lt: () => mockQuery,
    lte: () => mockQuery,
    like: () => mockQuery,
    ilike: () => mockQuery,
    is: () => mockQuery,
    in: () => mockQuery,
    contains: () => mockQuery,
    containedBy: () => mockQuery,
    rangeGt: () => mockQuery,
    rangeGte: () => mockQuery,
    rangeLt: () => mockQuery,
    rangeLte: () => mockQuery,
    rangeAdjacent: () => mockQuery,
    overlaps: () => mockQuery,
    textSearch: () => mockQuery,
    match: () => mockQuery,
    not: () => mockQuery,
    or: () => mockQuery,
    filter: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    range: () => mockQuery,
    single: () => Promise.resolve({ ...mockResponse, data: null }),
    maybeSingle: () => Promise.resolve({ ...mockResponse, data: null }),
    csv: () => Promise.resolve({ ...mockResponse, data: '' }),
    geojson: () => Promise.resolve({ ...mockResponse, data: {} }),
    explain: () => Promise.resolve({ ...mockResponse, data: '' }),
    rollback: () => Promise.resolve({ ...mockResponse }),
    returns: () => mockQuery,
    then: (resolve: any) => resolve(mockResponse),
    catch: (reject: any) => mockResponse
  }

  return {
    from: () => mockQuery,
    rpc: () => Promise.resolve(mockResponse),
    storage: {
      from: () => ({
        upload: () => Promise.resolve(mockResponse),
        download: () => Promise.resolve(mockResponse),
        list: () => Promise.resolve(mockResponse),
        remove: () => Promise.resolve(mockResponse),
        createSignedUrl: () => Promise.resolve({ ...mockResponse, data: { signedUrl: '' } }),
        createSignedUrls: () => Promise.resolve({ ...mockResponse, data: [] }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signInWithOAuth: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
      updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
      setSession: () => Promise.resolve({ data: { session: null }, error: null }),
      refreshSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => { } } },
        error: null
      }),
      admin: {
        listUsers: () => Promise.resolve({ data: { users: [] }, error: null }),
        createUser: () => Promise.resolve({ data: { user: null }, error: null }),
        deleteUser: () => Promise.resolve({ data: { user: null }, error: null }),
        updateUserById: () => Promise.resolve({ data: { user: null }, error: null })
      }
    },
    realtime: {
      channel: () => ({
        on: () => ({}),
        subscribe: () => ({}),
        unsubscribe: () => ({}),
        send: () => ({})
      }),
      removeChannel: () => ({}),
      removeAllChannels: () => ({}),
      getChannels: () => []
    },
    functions: {
      invoke: () => Promise.resolve({ data: null, error: null })
    }
  }
}

// Cache para cliente Supabase (singleton pattern)
let cachedBrowserClient: any = null

// Cliente para o browser (client-side) - OTIMIZADO
export function createClient() {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado, usando cliente mock')
    return createMockClient() as any
  }

  // Retorna client cacheado se já existe
  if (cachedBrowserClient) {
    return cachedBrowserClient
  }

  // Edge Runtime compatible environment variable access
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  cachedBrowserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
      storageKey: 'armazem-sao-joaquim-auth',
      debug: process.env.NODE_ENV === 'development', // Debug em desenvolvimento
      storage: {
        getItem: (key) => {
          try {
            const value = localStorage.getItem(key)
            if (process.env.NODE_ENV === 'development') {
              console.log(`📥 Storage GET ${key}:`, value ? 'encontrado' : 'não encontrado')
            }
            return value
          } catch {
            return null
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value)
            if (process.env.NODE_ENV === 'development') {
              console.log(`📤 Storage SET ${key}:`, value ? 'salvo' : 'vazio')
            }
          } catch {
            // Ignore storage errors
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key)
            if (process.env.NODE_ENV === 'development') {
              console.log(`🗑️ Storage REMOVE ${key}: removido`)
            }
          } catch {
            // Ignore storage errors
          }
        }
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 5 // Reduzido para performance
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'armazem-sao-joaquim',
        'Cache-Control': 'max-age=60' // Cache headers para performance
      }
    },
    db: {
      schema: 'public'
    }
  })

  return cachedBrowserClient
}

// Cliente para server components - NETLIFY COMPATIBLE
export function createServerClient() {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado, usando cliente mock')
    return createMockClient() as any
  }

  // Server-side environment variables (safe in server context)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // NETLIFY FIX: Use dynamic import to avoid build issues
  return createSSRServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        try {
          // Dynamic import only when needed
          const { cookies } = await import('next/headers')
          const cookieStore = await cookies()
          return cookieStore.getAll()
        } catch (error) {
          console.warn('⚠️ Cookies não disponível em server context')
          return []
        }
      },
      async setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          const { cookies } = await import('next/headers')
          const cookieStore = await cookies()
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'X-Client-Info': 'armazem-sao-joaquim-server',
      }
    }
  })
}

// Legacy function for backward compatibility - will be deprecated  
export function createServerClientLegacy(cookieStore: any) {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado, usando cliente mock')
    return createMockClient() as any
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSSRServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'X-Client-Info': 'armazem-sao-joaquim-server',
      }
    }
  })
}

// Cliente para middleware
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado, usando cliente mock')
    return createMockClient() as any
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSSRServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'pkce',
      storageKey: 'armazem-sao-joaquim-auth', // IMPORTANTE: Mesma key do cliente
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'X-Client-Info': 'armazem-sao-joaquim-middleware',
      }
    }
  })
}

// Cliente legado para backward compatibility
export const supabase = createClient()

// Funções auxiliares
export const getSupabaseStatus = async () => {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      error: 'Supabase não configurado'
    }
  }

  try {
    const client = createClient()
    const { data, error } = await client.from('users').select('count').limit(1)

    return {
      configured: true,
      connected: !error,
      error: error?.message
    }
  } catch (error: any) {
    return {
      configured: true,
      connected: false,
      error: error.message
    }
  }
}

export const forceLogout = async () => {
  try {
    const client = createClient()
    await client.auth.signOut()

    if (typeof window !== 'undefined') {
      // Clear all auth related localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('armazem')) {
          localStorage.removeItem(key)
        }
      })
      sessionStorage.clear()
    }

    return { success: true }
  } catch (error: any) {
    console.error('Erro no logout forçado:', error)
    return { success: false, error: error.message }
  }
}

// Query Cache para performance - TTL de 1 minuto
const queryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minuto

// Função para criar chave de cache
function createCacheKey(table: string, query: string, params?: any): string {
  return `${table}-${query}-${JSON.stringify(params || {})}`
}

// Função para limpar cache expirado
function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      queryCache.delete(key)
    }
  }
}

// Wrapper para queries com cache
export const cachedQuery = async <T>(
  cacheKey: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> => {
  // Limpeza periódica do cache
  if (Math.random() < 0.1) cleanExpiredCache()

  // Verificar cache
  const cached = queryCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return { data: cached.data, error: null }
  }

  // Executar query
  const result = await queryFn()

  // Cache apenas resultados de sucesso
  if (!result.error && result.data) {
    queryCache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now()
    })
  }

  return result
}

// Função para invalidar cache específico
export const invalidateCache = (pattern?: string) => {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key)
      }
    }
  } else {
    queryCache.clear()
  }
}

// Helpers para queries comuns com cache
export const getCachedUsers = () => {
  const client = createClient()
  return cachedQuery(
    createCacheKey('users', 'list'),
    () => client.from('users').select('*')
  )
}

export const getCachedDashboardStats = () => {
  const client = createClient()
  return cachedQuery(
    createCacheKey('dashboard', 'stats'),
    async () => {
      // Query otimizada para dashboard
      const [users, reservas, blog, menu] = await Promise.all([
        client.from('users').select('id', { count: 'exact', head: true }),
        client.from('reservas').select('id', { count: 'exact', head: true }),
        client.from('blog_posts').select('id', { count: 'exact', head: true }),
        client.from('menu_items').select('id', { count: 'exact', head: true })
      ])

      if (users.error || reservas.error || blog.error || menu.error) {
        return {
          data: null,
          error: users.error || reservas.error || blog.error || menu.error
        }
      }

      return {
        data: {
          totalUsers: users.count || 0,
          totalReservas: reservas.count || 0,
          totalBlogPosts: blog.count || 0,
          totalMenuItems: menu.count || 0,
          reservasHoje: 0, // TODO: implementar query específica
          reservasPendentes: 0 // TODO: implementar query específica
        },
        error: null
      }
    }
  )
}

// Compatibilidade com código existente
export const getSupabaseClient = () => supabase
export const createMockSupabaseClient = () => createMockClient()

// Função para criar ou atualizar profile de forma segura
export const upsertProfile = async (user: any) => {
  try {
    const supabase = createClient()

    // Verificar se o profile já existe
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError && !fetchError.message.includes('No rows found')) {
      console.error('❌ Erro ao verificar profile existente:', fetchError)
      return { error: fetchError }
    }

    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      avatar_url: user.user_metadata?.avatar_url || null,
      updated_at: new Date().toISOString()
    }

    let result

    if (existingProfile) {
      // Atualizar profile existente
      console.log('🔄 Atualizando profile existente para:', user.id)
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Criar novo profile
      console.log('➕ Criando novo profile para:', user.id)
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('❌ Erro ao upsert profile:', result.error)

      // Se for erro de duplicação, tentar recuperar o profile existente
      if (result.error.message?.includes('profiles_pkey') || result.error.message?.includes('duplicate key')) {
        console.log('🔄 Tentando recuperar profile após erro de duplicação...')

        const { data: recoveredProfile, error: recoveryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!recoveryError && recoveredProfile) {
          console.log('✅ Profile recuperado com sucesso')
          return { data: recoveredProfile, error: null }
        }
      }

      return { error: result.error }
    }

    console.log('✅ Profile processado com sucesso')
    return { data: result.data, error: null }
  } catch (error) {
    console.error('💥 Erro inesperado ao processar profile:', error)
    return { error }
  }
}