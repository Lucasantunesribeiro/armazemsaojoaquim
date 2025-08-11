import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing imports step by step...')
    
    // Test 1: Basic supabase client
    const supabase = await createClient()
    console.log('✅ Supabase client created')
    
    // Test 2: Import auth types
    try {
      const { AuthErrorType } = await import('@/lib/auth/types')
      console.log('✅ Auth types imported')
    } catch (error) {
      console.error('❌ Auth types import failed:', error)
      return NextResponse.json({ error: 'Auth types import failed', details: String(error) }, { status: 500 })
    }
    
    // Test 3: Import cache
    try {
      const { adminCache } = await import('@/lib/auth/cache')
      console.log('✅ Admin cache imported')
    } catch (error) {
      console.error('❌ Admin cache import failed:', error)
      return NextResponse.json({ error: 'Admin cache import failed', details: String(error) }, { status: 500 })
    }
    
    // Test 4: Import logging
    try {
      const { logAuthEvent } = await import('@/lib/auth/logging')
      console.log('✅ Logging imported')
    } catch (error) {
      console.error('❌ Logging import failed:', error)
      return NextResponse.json({ error: 'Logging import failed', details: String(error) }, { status: 500 })
    }
    
    // Test 5: Import admin verification
    try {
      const { verifyAdminStatus } = await import('@/lib/auth/admin-verification')
      console.log('✅ Admin verification imported')
    } catch (error) {
      console.error('❌ Admin verification import failed:', error)
      return NextResponse.json({ error: 'Admin verification import failed', details: String(error) }, { status: 500 })
    }
    
    // Test 6: Import enhanced login
    try {
      const { validateAndRefreshSession } = await import('@/lib/auth/enhanced-login')
      console.log('✅ Enhanced login imported')
    } catch (error) {
      console.error('❌ Enhanced login import failed:', error)
      return NextResponse.json({ error: 'Enhanced login import failed', details: String(error) }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'All imports successful',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Import test error:', error)
    return NextResponse.json({
      error: 'Import test failed',
      details: String(error)
    }, { status: 500 })
  }
}
