'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { 
  enhancedLogin, 
  enhancedLogout, 
  validateAndRefreshSession
} from '@/lib/auth/enhanced-login'

import {
  verifyAdminStatus
} from '@/lib/auth/admin-verification'

import {
  createAdminSession,
  getSessionTimeoutWarning,
  extendSession
} from '@/lib/auth/session-management'

import {
  LoginCredentials,
  LoginResult,
  UserProfile,
  AdminVerificationResult
} from '@/lib/auth/types'

interface AuthContextType {
  // User state
  user: User | null
  session: Session | null
  loading: boolean
  
  // Admin state
  isAdmin: boolean
  adminProfile?: UserProfile
  verificationMethod?: string
  
  // Session management
  sessionTimeoutWarning: boolean
  minutesUntilExpiry?: number
  
  // Auth functions
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  logout: () => Promise<{ success: boolean; error?: string }>
  refreshSession: () => Promise<void>
  refreshAdminStatus: () => Promise<void>
  extendUserSession: () => Promise<void>
  
  // Error state
  error?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminProfile, setAdminProfile] = useState<UserProfile | undefined>()
  const [verificationMethod, setVerificationMethod] = useState<string>()
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false)
  const [minutesUntilExpiry, setMinutesUntilExpiry] = useState<number>()
  const [error, setError] = useState<string>()

  const supabase = createClient()

  // Enhanced login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      setLoading(true)
      setError(undefined)
      
      const result = await enhancedLogin(credentials)
      
      if (result.success && result.user && result.session) {
        setUser(result.user)
        setSession(result.session)
        setIsAdmin(result.isAdmin || false)
        
        // Create admin session if user is admin
        if (result.isAdmin) {
          await createAdminSession(
            result.user.id,
            result.user.email!,
            undefined, // IP will be detected server-side
            navigator.userAgent
          )
        }
      } else if (result.error) {
        setError(result.error)
      }
      
      return result
    } catch (error) {
      const errorMessage = `Login failed: ${error}`
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Enhanced logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      const result = await enhancedLogout()
      
      if (result.success) {
        setUser(null)
        setSession(null)
        setIsAdmin(false)
        setAdminProfile(undefined)
        setVerificationMethod(undefined)
        setSessionTimeoutWarning(false)
        setMinutesUntilExpiry(undefined)
        setError(undefined)
      }
      
      return result
    } catch (error) {
      const errorMessage = `Logout failed: ${error}`
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const result = await validateAndRefreshSession()
      
      if (result.valid && result.user && result.session) {
        setUser(result.user)
        setSession(result.session)
        setIsAdmin(result.isAdmin || false)
        setError(undefined)
      } else {
        setError(result.error)
        if (!result.valid) {
          // Session invalid, clear state
          setUser(null)
          setSession(null)
          setIsAdmin(false)
          setAdminProfile(undefined)
        }
      }
    } catch (error) {
      setError(`Session refresh failed: ${error}`)
    }
  }, [])

  // Refresh admin status
  const refreshAdminStatus = useCallback(async () => {
    if (!user) return

    try {
      const adminResult = await verifyAdminStatus(user)
      setIsAdmin(adminResult.isAdmin)
      setVerificationMethod(adminResult.method)
      
      if (adminResult.profile) {
        setAdminProfile(adminResult.profile)
      }
      
      if (adminResult.error) {
        setError(adminResult.error)
      }
    } catch (error) {
      setError(`Admin status refresh failed: ${error}`)
    }
  }, [user])

  // Extend user session
  const extendUserSession = useCallback(async () => {
    if (!user) return

    try {
      await extendSession(user.id)
      setSessionTimeoutWarning(false)
      setMinutesUntilExpiry(undefined)
    } catch (error) {
      setError(`Session extension failed: ${error}`)
    }
  }, [user])

  // Check session timeout warning
  const checkSessionTimeout = useCallback(async () => {
    if (!user) return

    try {
      const warning = await getSessionTimeoutWarning(user.id)
      setSessionTimeoutWarning(warning.warning)
      setMinutesUntilExpiry(warning.minutesUntilExpiry)
    } catch (error) {
      console.warn('Session timeout check failed:', error)
    }
  }, [user])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth initialization error:', error)
          setError(error.message)
          return
        }

        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
          
          // Verify admin status
          const adminResult = await verifyAdminStatus(initialSession.user)
          setIsAdmin(adminResult.isAdmin)
          setVerificationMethod(adminResult.method)
          
          if (adminResult.profile) {
            setAdminProfile(adminResult.profile)
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        setError(`Initialization failed: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, newSession: Session | null) => {
        console.log('Auth state change:', event, !!newSession)
        
        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        if (newSession?.user) {
          // Verify admin status for new session
          const adminResult = await verifyAdminStatus(newSession.user)
          setIsAdmin(adminResult.isAdmin)
          setVerificationMethod(adminResult.method)
          
          if (adminResult.profile) {
            setAdminProfile(adminResult.profile)
          }
        } else {
          // Clear admin state on logout
          setIsAdmin(false)
          setAdminProfile(undefined)
          setVerificationMethod(undefined)
          setSessionTimeoutWarning(false)
          setMinutesUntilExpiry(undefined)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  // Session timeout monitoring
  useEffect(() => {
    if (!user || !isAdmin) return

    const interval = setInterval(checkSessionTimeout, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [user, isAdmin, checkSessionTimeout])

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAdmin,
    adminProfile,
    verificationMethod,
    sessionTimeoutWarning,
    minutesUntilExpiry,
    login,
    logout,
    refreshSession,
    refreshAdminStatus,
    extendUserSession,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider