import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Simple test endpoint called')
    
    // Test basic response
    return NextResponse.json({
      message: 'Simple test endpoint working',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Simple test error:', error)
    return NextResponse.json({
      error: 'Simple test failed',
      details: String(error)
    }, { status: 500 })
  }
}
