import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminStatus, ensureAdminProfile } from '@/lib/auth/admin-verification'
import { logAuthEvent } from '@/lib/auth/logging'
import { recoverFromAuthError } from '@/lib/auth/error-recovery'
import { AuthErrorType } from '@/lib/auth/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current session (try cookies first, then Authorization header)
    let { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // If no session from cookies, try Authorization header
    if ((!session || sessionError) && request.headers.get('authorization')) {
      const authHeader = request.headers.get('authorization')
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
              expires_at: Math.floor(Date.now() / 1000) + 3600
            }
            sessionError = null
          }
        } catch (tokenError) {
          console.log('Token validation failed:', tokenError)
        }
      }
    }
    
    if (sessionError) {
      await logAuthEvent({
        action: 'admin_check',
        method: 'api_endpoint',
        success: false,
        error: `Session error: ${sessionError.message}`,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        user_agent: request.headers.get('user-agent') || ''
      })
      
      return NextResponse.json({
        isAdmin: false,
        error: 'Session error',
        method: 'session_error',
        details: sessionError.message
      }, { status: 401 })
    }
    
    if (!session?.user) {
      await logAuthEvent({
        action: 'admin_check',
        method: 'api_endpoint',
        success: false,
        error: 'No active session',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        user_agent: request.headers.get('user-agent') || ''
      })
      
      return NextResponse.json({
        isAdmin: false,
        error: 'No active session',
        method: 'no_session'
      }, { status: 401 })
    }

    // Multi-layer admin verification
    let adminResult = await verifyAdminStatus(session.user)
    
    // If verification failed with database error, try recovery
    if (!adminResult.isAdmin && adminResult.error?.includes('permission denied')) {
      console.log('Attempting RLS error recovery...')
      adminResult = await recoverFromAuthError(AuthErrorType.RLS_ERROR, session.user)
    }
    
    // If user is admin, ensure profile exists
    if (adminResult.isAdmin) {
      try {
        const profile = await ensureAdminProfile(session.user)
        if (profile) {
          adminResult.profile = profile
        }
      } catch (profileError) {
        console.warn('Could not ensure admin profile:', profileError)
        // Don't fail the request for profile creation errors
      }
    }
    
    // Log the verification attempt
    await logAuthEvent({
      user_id: session.user.id,
      email: session.user.email || '',
      action: 'admin_check',
      method: `api_endpoint_${adminResult.method}`,
      success: adminResult.isAdmin,
      error: adminResult.error,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      user_agent: request.headers.get('user-agent') || ''
    })

    // Return detailed response
    const response = {
      isAdmin: adminResult.isAdmin,
      method: adminResult.method,
      user: adminResult.profile ? {
        id: session.user.id,
        email: session.user.email,
        full_name: adminResult.profile.full_name,
        role: adminResult.profile.role,
        last_login: adminResult.profile.last_login,
        login_count: adminResult.profile.login_count
      } : {
        id: session.user.id,
        email: session.user.email
      },
      timestamp: new Date().toISOString()
    }
    
    if (adminResult.error && process.env.NODE_ENV === 'development') {
      (response as any).debug = adminResult.error
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Check-role API error:', error)
    
    await logAuthEvent({
      action: 'admin_check',
      method: 'api_endpoint',
      success: false,
      error: `API error: ${error}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      user_agent: request.headers.get('user-agent') || ''
    })

    return NextResponse.json({
      isAdmin: false,
      error: 'Internal server error',
      method: 'error',
      debug: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}

// Handle POST requests for admin verification with additional data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    const supabase = await createClient()
    let { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // If no session from cookies, try Authorization header
    if ((!session || sessionError) && request.headers.get('authorization')) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser(token)
          if (user && !userError) {
            session = {
              user,
              access_token: token,
              token_type: 'bearer',
              expires_at: Math.floor(Date.now() / 1000) + 3600
            }
            sessionError = null
          }
        } catch (tokenError) {
          console.log('Token validation failed:', tokenError)
        }
      }
    }
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        isAdmin: false,
        error: 'No active session'
      }, { status: 401 })
    }

    // Verify admin status
    const adminResult = await verifyAdminStatus(session.user)
    
    if (!adminResult.isAdmin) {
      await logAuthEvent({
        user_id: session.user.id,
        email: session.user.email || '',
        action: 'access_denied',
        method: 'api_post',
        success: false,
        error: `Unauthorized POST action: ${action}`,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        user_agent: request.headers.get('user-agent') || ''
      })
      
      return NextResponse.json({
        isAdmin: false,
        error: 'Access denied'
      }, { status: 403 })
    }

    // Handle different actions
    switch (action) {
      case 'refresh_profile':
        const profile = await ensureAdminProfile(session.user)
        return NextResponse.json({
          isAdmin: true,
          action: 'refresh_profile',
          profile
        })
        
      case 'clear_cache':
        const { adminCache } = await import('@/lib/auth/cache')
        adminCache.clear(session.user.id)
        return NextResponse.json({
          isAdmin: true,
          action: 'clear_cache',
          message: 'Cache cleared'
        })
        
      default:
        return NextResponse.json({
          isAdmin: true,
          error: 'Unknown action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Check-role POST error:', error)
    return NextResponse.json({
      isAdmin: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}