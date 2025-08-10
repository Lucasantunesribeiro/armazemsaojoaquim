import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing error recovery imports...')
    
    // Test error recovery imports
    const { recoverFromAuthError } = await import('@/lib/auth/error-recovery')
    const { AuthErrorType } = await import('@/lib/auth/types')
    console.log('✅ Error recovery imported')
    
    const { ensureAdminProfile } = await import('@/lib/auth/admin-verification')
    console.log('✅ ensureAdminProfile imported')
    
    return NextResponse.json({
      message: 'Error recovery imports successful',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error recovery test error:', error)
    return NextResponse.json({
      error: 'Error recovery test failed',
      details: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
