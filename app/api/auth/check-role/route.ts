import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  verifyAdminStatus, 
  ensureAdminProfile
} from '@/lib/auth/admin-verification'
import { logAuthEvent } from '@/lib/auth/logging'
import { recoverFromAuthError } from '@/lib/auth/error-recovery'
import { AuthErrorType } from '@/lib/auth/types'
import { validateAndRefreshSession } from '@/lib/auth/enhanced-login'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Fast session validation with timeout
    const sessionPromise = validateAndRefreshSession(request)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session validation timeout')), 1500)
    )
    
    const sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any
    
    if (!sessionResult.valid || !sessionResult.user) {
      // Skip logging for faster response
      return NextResponse.json({
        isAdmin: false,
        authenticated: false,
        error: sessionResult.error || 'Invalid session',
        method: 'session_validation',
        responseTime: Date.now() - startTime
      }, { status: 401 })
    }

    // Fast admin verification with timeout
    const adminPromise = verifyAdminStatus(sessionResult.user)
    const adminTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Admin verification timeout')), 1000)
    )
    
    const adminResult = await Promise.race([adminPromise, adminTimeoutPromise]) as any
    
    // Skip profile ensuring for faster response - only do basic check
    let profile = null
    if (adminResult.isAdmin && adminResult.profile) {
      profile = adminResult.profile
    }
    
    // Skip detailed logging for faster response
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Fast admin check: ${adminResult.isAdmin} (${Date.now() - startTime}ms)`)
    }

    // Return minimal response for speed
    const response = {
      isAdmin: adminResult.isAdmin,
      authenticated: sessionResult.valid,
      method: adminResult.method,
      sessionValid: sessionResult.valid,
      user: {
        id: sessionResult.user.id,
        email: sessionResult.user.email
      },
      profile,
      responseTime: Date.now() - startTime,
      error: adminResult.error
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Auth check-role API error:', error)
    
    // Fast fallback response
    return NextResponse.json({
      isAdmin: false,
      authenticated: false,
      error: 'Request timeout or server error',
      method: 'error',
      responseTime: Date.now() - startTime,
      debug: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}