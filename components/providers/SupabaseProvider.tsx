'use client'

import { createClient } from '@/lib/supabase'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react'
// Removed network-utils import to avoid API calls during SSR

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
  const mountedRef = useRef(true)
  
  // Create stable Supabase client instance
  const supabase = useMemo(() => createClient(), [])

  // Cache for admin status to avoid repeated API calls
  const adminStatusCache = useRef<{
    userId: string | null
    isAdmin: boolean
    timestamp: number
    ttl: number
  }>({
    userId: null,
    isAdmin: false,
    timestamp: 0,
    ttl: 30000 // 30 seconds cache
  })

  // Simplified admin status check - EMAIL ONLY to avoid API calls during SSR
  const checkAdminStatus = useCallback(async (session: Session) => {
    const userId = session.user.id
    const now = Date.now()
    
    // Check cache first
    if (adminStatusCache.current.userId === userId && 
        (now - adminStatusCache.current.timestamp) < adminStatusCache.current.ttl) {
      console.log('📋 SupabaseProvider: Using cached admin status:', adminStatusCache.current.isAdmin)
      return adminStatusCache.current.isAdmin
    }
    
    // ONLY use email-based admin check to avoid API calls during initialization
    const emailAdmin = session.user.email === 'armazemsaojoaquimoficial@gmail.com'
    
    // Cache the email-based result
    adminStatusCache.current = {
      userId,
      isAdmin: emailAdmin,
      timestamp: now,
      ttl: 300000 // 5 minutes cache
    }
    
    console.log('✅ SupabaseProvider: Email-based admin check:', emailAdmin)
    return emailAdmin
  }, [])

  useEffect(() => {
    console.log('🔍 SupabaseProvider: Inicializando provider...')
    mountedRef.current = true

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

        if (!mountedRef.current) return

        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
          
          // Check admin status using API
          const adminStatus = await checkAdminStatus(initialSession)
          
          if (mountedRef.current) {
            setIsAdmin(adminStatus)
            console.log('✅ SupabaseProvider: Estado inicial definido:', {
              userEmail: initialSession.user.email,
              isAdmin: adminStatus
            })
          }
        } else {
          console.log('❌ SupabaseProvider: Nenhuma sessão inicial encontrada')
        }
      } catch (error: any) {
        console.error('❌ SupabaseProvider: Erro ao obter sessão inicial:', error)
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
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

        if (!mountedRef.current) return

        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        if (newSession?.user && mountedRef.current) {
          // Check admin status using API
          const adminStatus = await checkAdminStatus(newSession)
          
          if (mountedRef.current) {
            setIsAdmin(adminStatus)
            console.log('✅ SupabaseProvider: Estado atualizado:', {
              event,
              userEmail: newSession.user.email,
              isAdmin: adminStatus
            })
          }
        } else {
          if (mountedRef.current) {
            setIsAdmin(false)
            console.log('❌ SupabaseProvider: Usuário deslogado')
          }
        }
        
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('🧹 SupabaseProvider: Limpando subscription')
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [supabase, checkAdminStatus])

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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    loading,
    isAdmin,
    supabase
  }), [user, session, loading, isAdmin, supabase])

  return (
    <SupabaseContext.Provider value={contextValue}>
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