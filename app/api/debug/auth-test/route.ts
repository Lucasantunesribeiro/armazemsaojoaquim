import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔍 DEBUG AUTH TEST - Headers recebidos:')
  
  const headers = Object.fromEntries(request.headers.entries())
  console.log('Headers:', JSON.stringify(headers, null, 2))
  
  return NextResponse.json({
    success: true,
    headers: headers,
    middleware_headers: {
      'X-Admin-Session': request.headers.get('X-Admin-Session'),
      'X-Admin-Verified': request.headers.get('X-Admin-Verified'),
    },
    authorization: request.headers.get('authorization'),
    timestamp: new Date().toISOString()
  })
}