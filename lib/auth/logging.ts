import { createClient } from '@/lib/supabase/server'
import { AuthLog } from './types'

/**
 * Log authentication events for audit trail
 */
export async function logAuthEvent(event: Partial<AuthLog>): Promise<void> {
  try {
    const supabase = await createClient()
    
    const logEntry: AuthLog = {
      timestamp: new Date().toISOString(),
      user_id: event.user_id || '',
      email: event.email || '',
      action: event.action || 'admin_check',
      method: event.method || 'unknown',
      ip_address: event.ip_address || '',
      user_agent: event.user_agent || '',
      success: event.success || false,
      error: event.error
    }

    // Try to insert into auth_logs table
    const { error } = await supabase
      .from('auth_logs')
      .insert(logEntry)

    if (error) {
      // If table doesn't exist or insert fails, log to console
      console.log('Auth Event:', logEntry)
    }

  } catch (error) {
    // Fallback to console logging
    console.log('Auth Event (fallback):', {
      timestamp: new Date().toISOString(),
      ...event
    })
  }
}

/**
 * Get authentication logs for analysis
 */
export async function getAuthLogs(filters?: {
  user_id?: string
  email?: string
  action?: string
  success?: boolean
  limit?: number
  offset?: number
}): Promise<AuthLog[]> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('auth_logs')
      .select('*')
      .order('timestamp', { ascending: false })

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    
    if (filters?.email) {
      query = query.eq('email', filters.email)
    }
    
    if (filters?.action) {
      query = query.eq('action', filters.action)
    }
    
    if (filters?.success !== undefined) {
      query = query.eq('success', filters.success)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching auth logs:', error)
      return []
    }

    return data as AuthLog[]

  } catch (error) {
    console.error('Error in getAuthLogs:', error)
    return []
  }
}

/**
 * Clean old authentication logs (keep last 30 days)
 */
export async function cleanOldAuthLogs(): Promise<void> {
  try {
    const supabase = await createClient()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { error } = await supabase
      .from('auth_logs')
      .delete()
      .lt('timestamp', thirtyDaysAgo.toISOString())

    if (error) {
      console.error('Error cleaning old auth logs:', error)
    }

  } catch (error) {
    console.error('Error in cleanOldAuthLogs:', error)
  }
}