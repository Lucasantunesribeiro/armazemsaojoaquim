import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'
import { ENV } from './config'

const supabaseUrl = ENV.SUPABASE_URL
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const createClientComponentClient = () => supabase
export const createServerComponentClient = () => supabase