import { AuthErrorType, AdminVerificationResult } from './types'
import { verifyAdminStatus, checkAdminCredentials } from './admin-verification'
import { adminCache } from './cache'
import { logAuthEvent } from './logging'

/**
 * Simplified error recovery strategies - READ-ONLY operations only
 * No profile creation or modification to prevent recursion loops
 */
export const errorRecoveryStrategies = {
  [AuthErrorType.RLS_ERROR]: async (user: any): Promise<AdminVerificationResult> => {
    // Simple fallback to email verification for RLS errors
    const isAdmin = checkAdminCredentials(user.email || '')
    
    await logAuthEvent({
      user_id: user.id,
      email: user.email,
      action: 'admin_check',
      method: 'rls_error_fallback',
      success: isAdmin,
      error: 'RLS error, using email fallback'
    })
    
    return {
      isAdmin,
      method: 'fallback',
      error: 'RLS error, verified by email'
    }
  },

  [AuthErrorType.PROFILE_NOT_FOUND]: async (user: any): Promise<AdminVerificationResult> => {
    // For profile not found, use email verification only
    const isAdmin = checkAdminCredentials(user.email || '')
    
    await logAuthEvent({
      user_id: user.id,
      email: user.email,
      action: 'admin_check',
      method: 'profile_not_found_fallback',
      success: isAdmin,
      error: 'Profile not found, using email fallback'
    })
    
    return {
      isAdmin,
      method: 'fallback',
      error: 'Profile not found, verified by email'
    }
  },

  [AuthErrorType.DATABASE_ERROR]: async (user: any): Promise<AdminVerificationResult> => {
    // Fallback to email verification for database errors
    const isAdmin = checkAdminCredentials(user.email || '')
    
    await logAuthEvent({
      user_id: user.id,
      email: user.email,
      action: 'admin_check',
      method: 'database_error_fallback',
      success: isAdmin,
      error: 'Database error, using email fallback'
    })
    
    return {
      isAdmin,
      method: 'fallback',
      error: 'Database error, verified by email'
    }
  },

  [AuthErrorType.NO_SESSION]: async (user: any): Promise<AdminVerificationResult> => {
    return {
      isAdmin: false,
      method: 'fallback',
      error: 'No active session'
    }
  },

  [AuthErrorType.INVALID_CREDENTIALS]: async (user: any): Promise<AdminVerificationResult> => {
    return {
      isAdmin: false,
      method: 'fallback',
      error: 'Invalid credentials provided'
    }
  },

  [AuthErrorType.ACCESS_DENIED]: async (user: any): Promise<AdminVerificationResult> => {
    // For access denied, only use email verification
    const isAdmin = checkAdminCredentials(user.email || '')
    
    await logAuthEvent({
      user_id: user.id,
      email: user.email,
      action: 'admin_check',
      method: 'access_denied_fallback',
      success: isAdmin,
      error: 'Access denied, using email fallback'
    })
    
    return {
      isAdmin,
      method: 'fallback',
      error: 'Access denied, verified by email'
    }
  },

  [AuthErrorType.MIDDLEWARE_ERROR]: async (user: any): Promise<AdminVerificationResult> => {
    // For middleware errors, use email verification
    const isAdmin = checkAdminCredentials(user.email || '')
    
    await logAuthEvent({
      user_id: user.id,
      email: user.email,
      action: 'admin_check',
      method: 'middleware_error_fallback',
      success: isAdmin,
      error: 'Middleware error, using email fallback'
    })
    
    return {
      isAdmin,
      method: 'fallback',
      error: 'Middleware error, verified by email'
    }
  }
}

/**
 * Apply error recovery strategy based on error type
 * Simplified to use only email verification as fallback
 */
export async function recoverFromAuthError(
  errorType: AuthErrorType,
  user: any
): Promise<AdminVerificationResult> {
  const strategy = errorRecoveryStrategies[errorType]
  
  if (!strategy) {
    return {
      isAdmin: false,
      method: 'fallback',
      error: `No recovery strategy for error type: ${errorType}`
    }
  }
  
  try {
    return await strategy(user)
  } catch (error) {
    console.error(`Error recovery failed for ${errorType}:`, error)
    
    // Ultimate fallback - email verification only
    const isAdmin = checkAdminCredentials(user?.email || '')
    return {
      isAdmin,
      method: 'fallback',
      error: `Recovery strategy failed: ${error}`
    }
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries - 1) {
        throw error
      }
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Health check for authentication system
 */
export async function authSystemHealthCheck(): Promise<{
  healthy: boolean
  checks: Record<string, { status: 'ok' | 'error'; message?: string }>
}> {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {}
  
  // Check cache system
  try {
    adminCache.set('health-check', true)
    const cached = adminCache.get('health-check')
    adminCache.clear('health-check')
    
    checks.cache = cached ? { status: 'ok' } : { status: 'error', message: 'Cache not working' }
  } catch (error) {
    checks.cache = { status: 'error', message: `Cache error: ${error}` }
  }
  
  // Check logging system
  try {
    await logAuthEvent({
      user_id: 'health-check',
      email: 'health-check',
      action: 'admin_check',
      method: 'health_check',
      success: true
    })
    checks.logging = { status: 'ok' }
  } catch (error) {
    checks.logging = { status: 'error', message: `Logging error: ${error}` }
  }
  
  // Overall health
  const healthy = Object.values(checks).every(check => check.status === 'ok')
  
  return { healthy, checks }
}
