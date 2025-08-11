import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simple health check without database or auth dependencies
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      // Only check if environment variables exist, don't use them
      env_check: {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabase_service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        resend_key: !!process.env.RESEND_API_KEY,
        site_url: !!process.env.NEXT_PUBLIC_SITE_URL
      }
    }

    return NextResponse.json(health, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
