import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '../types/database.types'

// Verificar se as variáveis de ambiente estão configuradas
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
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
        data: { subscription: { unsubscribe: () => {} } },
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  cachedBrowserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'armazem-sao-joaquim-auth',
      debug: false // Sempre false em produção para performance
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

// Cliente para server components - NEXT.JS 15 COMPATIBLE
export async function createServerClient() {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado, usando cliente mock')
    return createMockClient() as any
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // NEXT.JS 15: cookies() agora é async - importar dinamicamente para evitar erro de client component
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

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

// Legacy function for backward compatibility - will be deprecated
export function createServerClientLegacy(cookieStore: Awaited<ReturnType<typeof cookies>>) {
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