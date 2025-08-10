import { NextRequest, NextResponse } from 'next/server'
import { validateAndRefreshSession } from '@/lib/auth/enhanced-login'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing session validation...')
    
    // Test validateAndRefreshSession function
    const sessionResult = await validateAndRefreshSession()
    
    console.log('Session validation result:', sessionResult)
    
    return NextResponse.json({
      message: 'Session validation test completed',
      result: sessionResult,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Session test error:', error)
    return NextResponse.json({
      error: 'Session test failed',
      details: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
