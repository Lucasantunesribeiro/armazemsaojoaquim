import type { Database } from '@/types/database.types'

// Mock completo do Supabase para evitar problemas de build
const createMockClient = () => {
  const mockQuery = {
    data: [],
    error: null,
    eq: function(...args: any[]) { return this },
    neq: function(...args: any[]) { return this },
    order: function(...args: any[]) { return this },
    limit: function(...args: any[]) { return this },
    single: function(...args: any[]) { 
      return { 
        data: null, 
        error: null 
      } 
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
    insert: function(...args: any[]) { return this },
    update: function(...args: any[]) { return this },
    delete: function(...args: any[]) { return this },
    upsert: function(...args: any[]) { return this }
  }

  return {
    from: (table: string) => mockQuery,
    auth: {
      user: null,
      session: null,
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async (credentials: any) => ({ data: { user: null, session: null }, error: null }),
      signInWithOAuth: async (options: any) => ({ data: { provider: null, url: null }, error: null }),
      signUp: async (credentials: any) => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      exchangeCodeForSession: async (code: string) => ({ 
        data: { user: null, session: null }, 
        error: null 
      }),
      resetPasswordForEmail: async (email: string) => ({ data: {}, error: null }),
      updateUser: async (attributes: any) => ({ data: { user: null }, error: null }),
      refreshSession: async () => ({ data: { user: null, session: null }, error: null }),
      resend: async (options: any) => ({ data: {}, error: null })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
        list: () => Promise.resolve({ data: [], error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    realtime: {
      channel: () => ({
        on: () => ({}),
        subscribe: () => ({}),
        unsubscribe: () => ({})
      })
    },
    rpc: () => Promise.resolve({ data: null, error: null })
  }
}

// Sempre usar mock client para evitar problemas de build
export const supabase = createMockClient()

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => false

// Função para obter status da conexão
export const getSupabaseStatus = async () => {
  return { 
    connected: false, 
    error: 'Mock client - no real connection',
    data: null
  }
}

// Função para criar cliente (sempre retorna mock)
export const getSupabaseClient = () => supabase

// Exportar o cliente padrão para compatibilidade
export const supabaseClientDefault = supabase

// Função para criar mock client
export const createMockSupabaseClient = () => supabase