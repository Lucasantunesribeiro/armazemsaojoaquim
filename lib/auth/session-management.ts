import { createClient } from '@/lib/supabase/server'
import { AdminSession } from './types'
import { logAuthEvent } from './logging'

/**
 * Admin session management utilities
 */

/**
 * Create or update admin session
 */
export async function createAdminSession(
  userId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string,
  sessionDurationHours: number = 8
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('create_or_update_admin_session', {
      p_user_id: userId,
      p_email: email,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_session_duration_hours: sessionDurationHours
    })

    if (error) {
      console.error('Error creating admin session:', error)
      return { success: false, error: error.message }
    }

    await logAuthEvent({
      user_id: userId,
      email,
      action: 'login',
      method: 'session_created',
      success: true,
      ip_address: ipAddress || '',
      user_agent: userAgent || ''
    })

    return { success: true, sessionId: data }

  } catch (error) {
    console.error('Error in createAdminSession:', error)
    return { success: false, error: `Session creation failed: ${error}` }
  }
}

/**
 * Update session activity
 */
export async function updateSessionActivity(
  userId: string,
  extendSession: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('update_session_activity', {
      p_user_id: userId,
      p_extend_session: extendSession
    })

    if (error) {
      console.error('Error updating session activity:', error)
      return { success: false, error: error.message }
    }

    return { success: data === true }

  } catch (error) {
    console.error('Error in updateSessionActivity:', error)
    return { success: false, error: `Session update failed: ${error}` }
  }
}

/**
 * Invalidate admin session
 */
export async function invalidateAdminSession(
  userId?: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('invalidate_admin_session', {
      p_user_id: userId,
      p_session_id: sessionId
    })

    if (error) {
      console.error('Error invalidating admin session:', error)
      return { success: false, error: error.message }
    }

    if (userId) {
      await logAuthEvent({
        user_id: userId,
        action: 'logout',
        method: 'session_invalidated',
        success: true
      })
    }

    return { success: data === true }

  } catch (error) {
    console.error('Error in invalidateAdminSession:', error)
    return { success: false, error: `Session invalidation failed: ${error}` }
  }
}

/**
 * Get admin session info
 */
export async function getAdminSessionInfo(userId: string): Promise<{
  success: boolean
  session?: AdminSession
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('get_admin_session_info', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error getting admin session info:', error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'No active session found' }
    }

    const sessionData = data[0]
    const session: AdminSession = {
      user_id: userId,
      email: sessionData.email,
      role: 'admin',
      session_start: sessionData.session_start,
      last_activity: sessionData.last_activity,
      expires_at: sessionData.expires_at,
      is_active: sessionData.is_active
    }

    return { success: true, session }

  } catch (error) {
    console.error('Error in getAdminSessionInfo:', error)
    return { success: false, error: `Session info retrieval failed: ${error}` }
  }
}

/**
 * Check if session is valid and not expired
 */
export async function isSessionValid(userId: string): Promise<{
  valid: boolean
  session?: AdminSession
  reason?: string
}> {
  try {
    const sessionResult = await getAdminSessionInfo(userId)
    
    if (!sessionResult.success || !sessionResult.session) {
      return { valid: false, reason: 'No active session' }
    }

    const session = sessionResult.session
    const now = new Date()
    const expiresAt = new Date(session.expires_at)

    if (expiresAt <= now) {
      // Session expired, invalidate it
      await invalidateAdminSession(userId)
      return { valid: false, reason: 'Session expired' }
    }

    // Check if session is close to expiring (within 30 minutes)
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)
    if (expiresAt <= thirtyMinutesFromNow) {
      // Extend session
      await updateSessionActivity(userId, true)
      return { valid: true, session, reason: 'Session extended' }
    }

    return { valid: true, session }

  } catch (error) {
    console.error('Error in isSessionValid:', error)
    return { valid: false, reason: `Session validation error: ${error}` }
  }
}

/**
 * Clean expired sessions
 */
export async function cleanExpiredSessions(): Promise<{
  success: boolean
  cleanedCount?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('clean_expired_sessions')

    if (error) {
      console.error('Error cleaning expired sessions:', error)
      return { success: false, error: error.message }
    }

    return { success: true, cleanedCount: data }

  } catch (error) {
    console.error('Error in cleanExpiredSessions:', error)
    return { success: false, error: `Session cleanup failed: ${error}` }
  }
}

/**
 * Get authentication statistics
 */
export async function getAuthStatistics(days: number = 7): Promise<{
  success: boolean
  stats?: {
    totalLogins: number
    successfulLogins: number
    failedLogins: number
    adminChecks: number
    accessDenied: number
    uniqueUsers: number
    successRate: number
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('get_auth_statistics', {
      p_days: days
    })

    if (error) {
      console.error('Error getting auth statistics:', error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'No statistics data found' }
    }

    const statsData = data[0]
    const stats = {
      totalLogins: parseInt(statsData.total_logins) || 0,
      successfulLogins: parseInt(statsData.successful_logins) || 0,
      failedLogins: parseInt(statsData.failed_logins) || 0,
      adminChecks: parseInt(statsData.admin_checks) || 0,
      accessDenied: parseInt(statsData.access_denied) || 0,
      uniqueUsers: parseInt(statsData.unique_users) || 0,
      successRate: parseFloat(statsData.success_rate) || 0
    }

    return { success: true, stats }

  } catch (error) {
    console.error('Error in getAuthStatistics:', error)
    return { success: false, error: `Statistics retrieval failed: ${error}` }
  }
}

/**
 * Session timeout warning (check if session expires soon)
 */
export async function getSessionTimeoutWarning(userId: string): Promise<{
  warning: boolean
  minutesUntilExpiry?: number
  session?: AdminSession
}> {
  try {
    const sessionResult = await getAdminSessionInfo(userId)
    
    if (!sessionResult.success || !sessionResult.session) {
      return { warning: false }
    }

    const session = sessionResult.session
    const now = new Date()
    const expiresAt = new Date(session.expires_at)
    const minutesUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60))

    // Warning if less than 15 minutes remaining
    if (minutesUntilExpiry <= 15 && minutesUntilExpiry > 0) {
      return { 
        warning: true, 
        minutesUntilExpiry,
        session 
      }
    }

    return { warning: false, session }

  } catch (error) {
    console.error('Error in getSessionTimeoutWarning:', error)
    return { warning: false }
  }
}

/**
 * Extend session manually
 */
export async function extendSession(
  userId: string,
  additionalHours: number = 8
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await updateSessionActivity(userId, true)
    
    if (result.success) {
      await logAuthEvent({
        user_id: userId,
        action: 'admin_check',
        method: 'session_extended',
        success: true
      })
    }

    return result

  } catch (error) {
    console.error('Error in extendSession:', error)
    return { success: false, error: `Session extension failed: ${error}` }
  }
}