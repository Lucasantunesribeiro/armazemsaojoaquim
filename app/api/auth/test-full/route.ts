import { NextRequest, NextResponse } from 'next/server'
import { validateAndRefreshSession } from '@/lib/auth/enhanced-login'
import { logAuthEvent } from '@/lib/auth/logging'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing full auth flow...')
    
    // Use enhanced session validation
    const sessionResult = await validateAndRefreshSession()
    console.log('Session result:', sessionResult)
    
    if (!sessionResult.valid || !sessionResult.user) {
      console.log('Session invalid, logging event...')
      
      await logAuthEvent({
        action: 'admin_check',
        method: 'auth_api_endpoint',
        success: false,
        error: sessionResult.error || 'Invalid session',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        user_agent: request.headers.get('user-agent') || ''
      })
      
      return NextResponse.json({
        isAdmin: false,
        authenticated: false,
        error: sessionResult.error || 'Invalid session',
        method: 'session_validation'
      }, { status: 401 })
    }

    console.log('Session valid, user found:', sessionResult.user.email)
    
    // For now, just return success without full admin verification
    return NextResponse.json({
      isAdmin: sessionResult.user.email === 'armazemsaojoaquimoficial@gmail.com',
      authenticated: true,
      method: 'email_fallback',
      sessionValid: true,
      user: {
        id: sessionResult.user.id,
        email: sessionResult.user.email
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Full auth test error:', error)
    
    try {
      await logAuthEvent({
        action: 'admin_check',
        method: 'auth_api_error',
        success: false,
        error: `API error: ${error}`,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        user_agent: request.headers.get('user-agent') || ''
      })
    } catch (logError) {
      console.error('Logging error:', logError)
    }
    
    return NextResponse.json({
      isAdmin: false,
      authenticated: false,
      method: 'error',
      sessionValid: false,
      user: null,
      timestamp: new Date().toISOString(),
      error: `Authentication check failed: ${error}`
    }, { status: 500 })
  }
}
