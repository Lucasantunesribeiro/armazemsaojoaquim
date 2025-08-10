import { createClient } from '@/lib/supabase/client'
import { LoginCredentials, LoginResult, AuthErrorType } from './types'
import { verifyAdminStatus, checkAdminCredentials } from './admin-verification'
import { logAuthEvent } from './logging'
import { adminCache } from './cache'

/**
 * Enhanced login process with admin verification
 */
export async function enhancedLogin(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    const supabase = createClient()

    // 1. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      await logAuthEvent({
        email: credentials.email,
        action: 'login',
        method: 'supabase_auth',
        success: false,
        error: error.message
      })

      return { 
        success: false, 
        error: error.message 
      }
    }

    if (!data.user || !data.session) {
      await logAuthEvent({
        email: credentials.email,
        action: 'login',
        method: 'supabase_auth',
        success: false,
        error: 'No user or session returned'
      })

      return { 
        success: false, 
        error: 'Authentication failed - no user data' 
      }
    }

    // 2. Verify admin status
    const adminResult = await verifyAdminStatus(data.user)

    // 3. Log successful admin login (no profile creation to avoid loops)
    if (adminResult.isAdmin) {
      try {
        // Update login count and last login
        await updateLoginStats(data.user.id)
        
      } catch (profileError) {
        console.warn('Could not ensure admin profile:', profileError)
        // Don't fail login for profile creation errors
      }
    }

    // 4. Log successful login
    await logAuthEvent({
      user_id: data.user.id,
      email: data.user.email || '',
      action: 'login',
      method: 'enhanced_login',
      success: true
    })

    return {
      success: true,
      user: data.user,
      session: data.session,
      isAdmin: adminResult.isAdmin
    }

  } catch (error) {
    console.error('Enhanced login error:', error)
    
    await logAuthEvent({
      email: credentials.email,
      action: 'login',
      method: 'enhanced_login',
      success: false,
      error: `Login error: ${error}`
    })

    return { 
      success: false, 
      error: `Login failed: ${error}` 
    }
  }
}

/**
 * Enhanced logout with cleanup
 */
export async function enhancedLogout(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user before logout
    const { data: { user } } = await supabase.auth.getUser()
    
    // Logout from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { success: false, error: error.message }
    }

    // Clear admin cache
    if (user?.id) {
      adminCache.clear(user.id)
      
      // Log logout event
      await logAuthEvent({
        user_id: user.id,
        email: user.email || '',
        action: 'logout',
        method: 'enhanced_logout',
        success: true
      })
    }

    return { success: true }

  } catch (error) {
    console.error('Enhanced logout error:', error)
    return { success: false, error: `Logout failed: ${error}` }
  }
}

/**
 * Update user login statistics
 */
async function updateLoginStats(userId: string): Promise<void> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        last_login: new Date().toISOString(),
        login_count: supabase.raw('COALESCE(login_count, 0) + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.warn('Could not update login stats:', error)
    }

  } catch (error) {
    console.warn('Error updating login stats:', error)
  }
}

/**
 * Check if user session is valid and refresh if needed
 * Supports both cookie-based sessions and Authorization header tokens
 */
export async function validateAndRefreshSession(request?: any): Promise<{
  valid: boolean
  user?: any
  session?: any
  isAdmin?: boolean
  error?: string
}> {
  try {
    // Use server client when running on server
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // First try to get session from cookies (SSR)
    let { data: { session }, error } = await supabase.auth.getSession()
    
    // If no session from cookies and we have a request with Authorization header, try that
    if ((!session || error) && request) {
      const authHeader = request.headers?.get?.('authorization') || request.headers?.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser(token)
          if (user && !userError) {
            // Create a mock session object for consistency
            session = {
              user,
              access_token: token,
              token_type: 'bearer',
              expires_at: Math.floor(Date.now() / 1000) + 3600 // Assume 1 hour expiry
            }
            error = null
          }
        } catch (tokenError) {
          console.log('Token validation failed:', tokenError)
        }
      }
    }
    
    if (error) {
      return { valid: false, error: error.message }
    }
    
    if (!session || !session.user) {
      return { valid: false, error: 'No active session' }
    }

    // Check if session is expired or about to expire (within 5 minutes)
    const expiresAt = new Date(session.expires_at! * 1000)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
    
    if (expiresAt < fiveMinutesFromNow) {
      // Try to refresh session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError || !refreshData.session) {
        return { valid: false, error: 'Session expired and could not refresh' }
      }
      
      // Use refreshed session
      const adminResult = await verifyAdminStatus(refreshData.user)
      
      return {
        valid: true,
        user: refreshData.user,
        session: refreshData.session,
        isAdmin: adminResult.isAdmin
      }
    }

    // Session is valid, verify admin status
    const adminResult = await verifyAdminStatus(session.user)
    
    return {
      valid: true,
      user: session.user,
      session: session,
      isAdmin: adminResult.isAdmin
    }

  } catch (error) {
    console.error('Session validation error:', error)
    return { valid: false, error: `Session validation failed: ${error}` }
  }
}

/**
 * Login with fallback mechanisms for admin authentication
 */
export async function loginWithFallback(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    // First attempt: Standard login
    const loginResult = await enhancedLogin(credentials)
    
    if (loginResult.success) {
      return loginResult
    }

    // Fallback: Check if it's admin credentials and handle specific errors
    if (checkAdminCredentials(credentials.email)) {
      const supabase = createClient()
      
      // Try a direct password reset or create user if needed
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: 'Admin',
            role: 'admin'
          }
        }
      })

      if (!signUpError && signUpData.user) {
        // If user was created successfully or already exists
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        })

        if (!signInError && signInData.user && signInData.session) {
          const adminResult = await verifyAdminStatus(signInData.user)
          
          await logAuthEvent({
            user_id: signInData.user.id,
            email: credentials.email,
            action: 'login',
            method: 'fallback_login',
            success: true
          })

          return {
            success: true,
            user: signInData.user,
            session: signInData.session,
            isAdmin: adminResult.isAdmin
          }
        }
      }
    }

    // Return original error if fallback also fails
    return loginResult

  } catch (error) {
    console.error('Login with fallback error:', error)
    
    await logAuthEvent({
      email: credentials.email,
      action: 'login',
      method: 'fallback_login',
      success: false,
      error: `Fallback login error: ${error}`
    })

    return {
      success: false,
      error: `Login failed: ${error}`
    }
  }
}