import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Temporariamente comentado para debug
// Importar polyfills apenas no servidor
// if (typeof window === 'undefined') {
//   require('./polyfills-minimal.js')
// }

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

// Configuração do cliente Supabase com tratamento de erro
let supabase: any

try {
  if (isSupabaseConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'armazem-sao-joaquim'
        }
      }
    })
  } else {
    console.warn('Supabase não configurado. Usando cliente mock.')
    supabase = createMockClient()
  }
} catch (error) {
  console.error('Erro ao inicializar Supabase:', error)
  supabase = createMockClient()
}

// Função para verificar status do Supabase
export const getSupabaseStatus = async () => {
  if (!isSupabaseConfigured()) {
    return {
      status: 'not_configured',
      message: 'Supabase não está configurado',
      timestamp: new Date().toISOString()
    }
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error && error.code !== 'PGRST116') { // PGRST116 = tabela não encontrada (ok para teste)
      throw error
    }

    return {
      status: 'connected',
      message: 'Supabase conectado com sucesso',
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }
  }
}

// Exportar cliente
export { supabase }

// Função para obter cliente (compatibilidade)
export const getSupabaseClient = () => supabase

// Função para criar cliente mock (para testes)
export const createMockSupabaseClient = () => createMockClient()

export default supabase