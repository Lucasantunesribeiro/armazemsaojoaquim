import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Testar conexão com uma query simples
    const { data, error, status } = await supabase
      .from('reservas')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      console.error('Database health check error:', error)
      return NextResponse.json({
        status: 'error',
        database: 'offline',
        error: error.message,
        responseTime,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    // Verificar se a resposta é muito lenta
    const isWarning = responseTime > 2000

    return NextResponse.json({
      status: isWarning ? 'warning' : 'healthy',
      database: 'online',
      responseTime,
      message: isWarning ? 'Database responding slowly' : 'Database connection healthy',
      supabase: {
        connected: true,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      },
      timestamp: new Date().toISOString()
    }, { 
      status: isWarning ? 200 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      database: 'offline',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: null,
      supabase: {
        connected: false,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      },
      timestamp: new Date().toISOString()
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed. Use GET for health checks.'
  }, { status: 405 })
} 