import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminStatus } from '@/lib/auth/admin-verification'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing verifyAdminStatus function...')
    
    // Test with a mock user object
    const mockUser = {
      id: 'test-user-id',
      email: 'armazemsaojoaquimoficial@gmail.com'
    }
    
    console.log('Calling verifyAdminStatus with mock user:', mockUser)
    
    const result = await verifyAdminStatus(mockUser)
    
    console.log('verifyAdminStatus result:', result)
    
    return NextResponse.json({
      message: 'verifyAdminStatus test completed',
      result: result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('verifyAdminStatus test error:', error)
    return NextResponse.json({
      error: 'verifyAdminStatus test failed',
      details: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
