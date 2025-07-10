'use client'

import { createClient } from '@/lib/supabase'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

interface SupabaseContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  supabase: ReturnType<typeof createClient>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  // Function to check admin status using API (bypasses RLS)
  const checkAdminStatus = async (session: Session) => {
    try {
      console.log('🔍 SupabaseProvider: Verificando status admin via API...')
      
      const response = await fetch('/api/admin/check-role', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ SupabaseProvider: Status admin recebido:', {
          isAdmin: data.isAdmin,
          method: data.method,
          role: data.role
        })
        return data.isAdmin
      } else {
        console.log('⚠️ SupabaseProvider: Falha ao verificar admin status:', response.status)
        
        // Fallback: check by email
        const emailAdmin = session.user.email === 'armazemsaojoaquimoficial@gmail.com'
        console.log('🔄 SupabaseProvider: Usando fallback por email:', emailAdmin)
        return emailAdmin
      }
    } catch (error) {
      console.error('❌ SupabaseProvider: Erro ao verificar admin status:', error)
      
      // Fallback: check by email
      const emailAdmin = session.user.email === 'armazemsaojoaquimoficial@gmail.com'
      console.log('🔄 SupabaseProvider: Usando fallback por email após erro:', emailAdmin)
      return emailAdmin
    }
  }

  useEffect(() => {
    console.log('🔍 SupabaseProvider: Inicializando provider...')

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        console.log('📊 SupabaseProvider: Sessão inicial:', {
          hasSession: !!initialSession,
          userEmail: initialSession?.user?.email,
          userId: initialSession?.user?.id,
          error: error?.message
        })

        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
          
          // Check admin status using API
          const adminStatus = await checkAdminStatus(initialSession)
          setIsAdmin(adminStatus)
          
          console.log('✅ SupabaseProvider: Estado inicial definido:', {
            userEmail: initialSession.user.email,
            isAdmin: adminStatus
          })
        } else {
          console.log('❌ SupabaseProvider: Nenhuma sessão inicial encontrada')
        }
      } catch (error: any) {
        console.error('❌ SupabaseProvider: Erro ao obter sessão inicial:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('🔄 SupabaseProvider: Auth state change:', {
          event,
          hasSession: !!newSession,
          userEmail: newSession?.user?.email,
          userId: newSession?.user?.id
        })

        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        if (newSession?.user) {
          // Check admin status using API
          const adminStatus = await checkAdminStatus(newSession)
          setIsAdmin(adminStatus)
          
          console.log('✅ SupabaseProvider: Estado atualizado:', {
            event,
            userEmail: newSession.user.email,
            isAdmin: adminStatus
          })
        } else {
          setIsAdmin(false)
          console.log('❌ SupabaseProvider: Usuário deslogado')
        }
        
        setLoading(false)
      }
    )

    return () => {
      console.log('🧹 SupabaseProvider: Limpando subscription')
      subscription.unsubscribe()
    }
  }, [supabase])

  // Debug info
  useEffect(() => {
    console.log('🔍 SupabaseProvider: Estado atual:', {
      loading,
      hasUser: !!user,
      userEmail: user?.email,
      userId: user?.id,
      isAdmin,
      hasSession: !!session
    })
  }, [loading, user, session, isAdmin])

  return (
    <SupabaseContext.Provider value={{ user, session, loading, isAdmin, supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}