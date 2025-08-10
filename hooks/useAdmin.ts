'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AdminState {
  loading: boolean
  isAdmin: boolean
  hasProfile: boolean
  verificationMethod: string | null
  user: User | null
  error: string | null
}

export function useAdmin() {
  const [adminState, setAdminState] = useState<AdminState>({
    loading: true,
    isAdmin: false,
    hasProfile: false,
    verificationMethod: null,
    user: null,
    error: null
  })

  useEffect(() => {
    let isMounted = true
    
    // Set a maximum timeout to ensure loading state is always resolved
    const maxTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ [useAdmin] Max timeout reached, setting loading to false')
        setAdminState(prev => ({ ...prev, loading: false }))
      }
    }, 8000) // 8 seconds max timeout

    async function checkAdminStatus() {
      try {
        const supabase = createClient()
        
        // Obter usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          if (isMounted) {
            clearTimeout(maxTimeout)
            setAdminState({
              loading: false,
              isAdmin: false,
              hasProfile: false,
              verificationMethod: null,
              user: null,
              error: userError?.message || 'No user found'
            })
          }
          return
        }

        console.log('🔍 [useAdmin] Verificando status admin para:', user.email)

        // Primary verification: Check by email first (fastest)
        const isAdminByEmail = user.email === 'armazemsaojoaquimoficial@gmail.com'
        
        if (isAdminByEmail) {
          console.log('✅ [useAdmin] Admin verificado por email')
          if (isMounted) {
            clearTimeout(maxTimeout)
            setAdminState({
              loading: false,
              isAdmin: true,
              hasProfile: true, // Assume profile exists for admin
              verificationMethod: 'email',
              user: user,
              error: null
            })
          }
          return
        }

        // Secondary verification: Check profile in database
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          if (isMounted) {
            const isVerifiedAdmin = profile?.role === 'admin'
            
            console.log('📊 [useAdmin] Status verificado:', {
              hasProfile: !!profile,
              role: profile?.role,
              isAdmin: isVerifiedAdmin
            })
            
            clearTimeout(maxTimeout)
            setAdminState({
              loading: false,
              isAdmin: isVerifiedAdmin,
              hasProfile: !!profile,
              verificationMethod: 'database',
              user: user,
              error: profileError?.message || null
            })
          }
        } catch (dbError) {
          console.warn('⚠️ [useAdmin] Database verification failed, using email fallback')
          
          // Fallback: If database fails but user is admin email, allow access
          if (isMounted) {
            clearTimeout(maxTimeout)
            setAdminState({
              loading: false,
              isAdmin: isAdminByEmail,
              hasProfile: isAdminByEmail, // Assume profile exists for admin email
              verificationMethod: 'email_fallback',
              user: user,
              error: dbError instanceof Error ? dbError.message : 'Database error'
            })
          }
        }

      } catch (error) {
        console.error('❌ [useAdmin] Erro na verificação admin:', error)
        if (isMounted) {
          clearTimeout(maxTimeout)
          setAdminState({
            loading: false,
            isAdmin: false,
            hasProfile: false,
            verificationMethod: null,
            user: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    checkAdminStatus()

    // Escutar mudanças de autenticação
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 [useAdmin] Auth state changed:', event)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAdminStatus()
        } else if (event === 'SIGNED_OUT') {
          setAdminState({
            loading: false,
            isAdmin: false,
            hasProfile: false,
            verificationMethod: null,
            user: null,
            error: null
          })
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(maxTimeout)
      subscription.unsubscribe()
    }
  }, [])

  return adminState
}