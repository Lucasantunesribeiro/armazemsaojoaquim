import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Configuração com fallbacks para evitar erros de build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Verificar se as credenciais estão configuradas corretamente
const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                    supabaseAnonKey !== 'placeholder-key' &&
                    supabaseUrl.includes('supabase.co')

if (!isConfigured && typeof window !== 'undefined') {
  console.warn('⚠️ Supabase credentials not configured. Some features may not work properly.')
}

// Validar URL do Supabase durante o build
if (process.env.NODE_ENV === 'production' && !isConfigured) {
  console.warn('⚠️ Production build with invalid Supabase configuration')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const createClientComponentClient = () => supabase
export const createServerComponentClient = () => supabase

// Função utilitária para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => isConfigured