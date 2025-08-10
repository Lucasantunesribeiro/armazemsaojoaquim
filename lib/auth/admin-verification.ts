import { createClient } from '@/lib/supabase/server'
import { AdminVerificationResult, UserProfile, AuthErrorType } from './types'
import { adminCache } from './cache'
import { logAuthEvent } from './logging'
import { withPerformanceTracking } from './performance'

const ADMIN_EMAIL = 'armazemsaojoaquimoficial@gmail.com'

/**
 * Simplified admin verification system - READ-ONLY operations
 * Layer 1: Email-based verification (fastest)
 * Layer 2: Cache verification (fast) 
 * Layer 3: Database verification using secure RPC function (safe)
 */
// Wrap with performance tracking
const _verifyAdminStatus = withPerformanceTracking('admin_verification', async (user: any): Promise<AdminVerificationResult> => {
  const email = user.email || ''
  const userId = user.id

  try {
    // Layer 1: Email-based verification (fastest)
    if (email === ADMIN_EMAIL) {
      await logAuthEvent({
        user_id: userId,
        email,
        action: 'admin_check',
        method: 'email',
        success: true
      })
      
      return { 
        isAdmin: true, 
        method: 'email' 
      }
    }

    // Layer 2: Cache verification
    const cached = adminCache.get(userId)
    if (cached) {
      await logAuthEvent({
        user_id: userId,
        email,
        action: 'admin_check',
        method: 'cache',
        success: cached.isAdmin
      })
      
      return { 
        isAdmin: cached.isAdmin, 
        method: 'cache',
        profile: cached.profile 
      }
    }

    // Layer 3: Database verification using secure RPC function
    try {
      const supabase = await createClient()
      
      // Use the secure RPC function to check admin role
      const { data: isAdminResult, error: rpcError } = await supabase
        .rpc('check_admin_role', { user_id: userId })

      if (!rpcError && isAdminResult !== null) {
        const isAdmin = Boolean(isAdminResult)
        
        // If admin, get profile data for caching
        let profile = null
        if (isAdmin) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, created_at, updated_at')
            .eq('id', userId)
            .single()
          
          profile = profileData
        }
        
        // Cache the result
        adminCache.set(userId, isAdmin, profile)
        
        await logAuthEvent({
          user_id: userId,
          email,
          action: 'admin_check',
          method: 'rpc_function',
          success: isAdmin
        })
        
        return { 
          isAdmin, 
          method: 'database', 
          profile: profile as UserProfile 
        }
      }

      // RPC failed - fallback to email check for admin
      if (email === ADMIN_EMAIL) {
        await logAuthEvent({
          user_id: userId,
          email,
          action: 'admin_check',
          method: 'fallback',
          success: true,
          error: 'RPC function failed, using email fallback'
        })
        
        return { 
          isAdmin: true, 
          method: 'fallback',
          error: 'RPC function failed, verified by email' 
        }
      }

    } catch (dbError) {
      console.warn('Database verification failed:', dbError)
      
      // Fallback to email verification for database errors
      if (email === ADMIN_EMAIL) {
        await logAuthEvent({
          user_id: userId,
          email,
          action: 'admin_check',
          method: 'fallback',
          success: true,
          error: `Database error: ${dbError}`
        })
        
        return { 
          isAdmin: true, 
          method: 'fallback',
          error: `Database error, verified by email: ${dbError}` 
        }
      }
    }

    // Not admin
    await logAuthEvent({
      user_id: userId,
      email,
      action: 'admin_check',
      method: 'database',
      success: false
    })
    
    return { 
      isAdmin: false, 
      method: 'database', 
      error: 'Not admin' 
    }

  } catch (error) {
    console.error('Admin verification error:', error)
    
    await logAuthEvent({
      user_id: userId,
      email,
      action: 'admin_check',
      method: 'error',
      success: false,
      error: `Verification error: ${error}`
    })
    
    return { 
      isAdmin: false, 
      method: 'fallback', 
      error: `Verification failed: ${error}` 
    }
  }
})

// Export the performance-tracked version
export const verifyAdminStatus = _verifyAdminStatus

/**
 * Simple function to check if user credentials are for admin
 * This is a read-only operation that doesn't modify the database
 */
export function checkAdminCredentials(email: string): boolean {
  return email === ADMIN_EMAIL
}

/**
 * Check if provided credentials are for admin user
 * @deprecated Use checkAdminCredentials instead
 */
export function isAdminCredentials(email: string, password?: string): boolean {
  return checkAdminCredentials(email)
}

/**
 * Ensures admin profile exists and is synchronized
 */
export async function ensureAdminProfile(user: any): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()
    
    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      return profile as UserProfile
    }

    // Create admin profile if it doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Admin',
        role: 'admin'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating admin profile:', createError)
      return null
    }

    return newProfile as UserProfile
  } catch (error) {
    console.error('Error ensuring admin profile:', error)
    return null
  }
}