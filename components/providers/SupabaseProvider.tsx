'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

interface SupabaseContextType {
  user: User | null
  loading: boolean
  supabase: typeof supabase
  isClient: boolean
  userRole: string | null
  isAdmin: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  supabase,
  isClient: false,
  userRole: null,
  isAdmin: false,
})

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider')
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error: unknown) => {
      console.error('Erro ao obter sessão:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [isClient])

  // Buscar role do usuário sempre que user mudar
  useEffect(() => {
    if (!user) {
      setUserRole(null)
      setIsAdmin(false)
      return
    }
    let cancelled = false
    setUserRole(null)
    setIsAdmin(false)
    supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data, error }: { data: { role?: string } | null, error: any }) => {
        if (cancelled) return
        if (error || !data) {
          setUserRole(null)
          setIsAdmin(false)
        } else {
          setUserRole(data.role ?? null)
          setIsAdmin(data.role === 'admin')
        }
      })
    return () => { cancelled = true }
  }, [user])

  return (
    <SupabaseContext.Provider value={{ user, loading, supabase, isClient, userRole, isAdmin }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export default SupabaseProvider