import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Cliente real do Supabase ou mock se não configurado
export const supabase = isSupabaseConfigured() 
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : createMockClient()

// Mock client para quando não há configuração
function createMockClient() {
  console.warn('⚠️ Supabase não configurado - usando mock client')
  
  const mockQuery = {
    data: [],
    error: null,
    eq: function(...args: any[]) { return this },
    neq: function(...args: any[]) { return this },
    order: function(...args: any[]) { return this },
    limit: function(...args: any[]) { return this },
    single: function(...args: any[]) { 
      return Promise.resolve({ 
        data: null, 
        error: { message: 'Mock client - configure Supabase credentials' }
      })
    },
    or: function(...args: any[]) { return this },
    in: function(...args: any[]) { return this },
    gte: function(...args: any[]) { return this },
    lte: function(...args: any[]) { return this },
    gt: function(...args: any[]) { return this },
    lt: function(...args: any[]) { return this },
    like: function(...args: any[]) { return this },
    ilike: function(...args: any[]) { return this },
    is: function(...args: any[]) { return this },
    not: function(...args: any[]) { return this },
    filter: function(...args: any[]) { return this },
    match: function(...args: any[]) { return this },
    range: function(...args: any[]) { return this },
    select: function(...args: any[]) { return this },
    insert: function(...args: any[]) { 
      return Promise.resolve({ 
        data: null, 
        error: { message: 'Mock client - configure Supabase credentials' }
      })
    },
    update: function(...args: any[]) { 
      return Promise.resolve({ 
        data: null, 
        error: { message: 'Mock client - configure Supabase credentials' }
      })
    },
    delete: function(...args: any[]) { 
      return Promise.resolve({ 
        data: null, 
        error: { message: 'Mock client - configure Supabase credentials' }
      })
    },
    upsert: function(...args: any[]) { 
      return Promise.resolve({ 
        data: null, 
        error: { message: 'Mock client - configure Supabase credentials' }
      })
    }
  }

  return {
    from: (table: string) => mockQuery,
    auth: {
      user: null,
      session: null,
      getUser: async () => ({ 
        data: { user: null }, 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      getSession: async () => ({ 
        data: { session: null }, 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      signInWithPassword: async (credentials: any) => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      signInWithOAuth: async (options: any) => ({ 
        data: { provider: null, url: null }, 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      signUp: async (credentials: any) => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      signOut: async () => ({ 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      onAuthStateChange: (callback: any) => ({ 
        data: { subscription: { unsubscribe: () => {} } } 
      }),
      exchangeCodeForSession: async (code: string) => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      resetPasswordForEmail: async (email: string) => ({ 
        data: {}, 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      updateUser: async (attributes: any) => ({ 
        data: { user: null }, 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      refreshSession: async () => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Mock client - configure Supabase credentials' }
      }),
      resend: async (options: any) => ({ 
        data: {}, 
        error: { message: 'Mock client - configure Supabase credentials' }
      })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Mock client - configure Supabase credentials' }
        }),
        download: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Mock client - configure Supabase credentials' }
        }),
        remove: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Mock client - configure Supabase credentials' }
        }),
        list: () => Promise.resolve({ 
          data: [], 
          error: { message: 'Mock client - configure Supabase credentials' }
        }),
        getPublicUrl: () => ({ 
          data: { publicUrl: '' } 
        })
      })
    },
    realtime: {
      channel: () => ({
        on: () => ({}),
        subscribe: () => ({}),
        unsubscribe: () => ({})
      })
    },
    rpc: () => Promise.resolve({ 
      data: null, 
      error: { message: 'Mock client - configure Supabase credentials' }
    })
  }
}

// Função para obter status da conexão
export const getSupabaseStatus = async () => {
  if (!isSupabaseConfigured()) {
    return { 
      connected: false, 
      error: 'Supabase credentials not configured',
      data: null
    }
  }

  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    return { 
      connected: !error, 
      error: error?.message || null,
      data: data
    }
  } catch (err) {
    return { 
      connected: false, 
      error: err instanceof Error ? err.message : 'Unknown error',
      data: null
    }
  }
}

// Função para criar cliente
export const getSupabaseClient = () => supabase

// Exportar o cliente padrão para compatibilidade
export const supabaseClientDefault = supabase

// Função para criar mock client
export const createMockSupabaseClient = () => createMockClient()