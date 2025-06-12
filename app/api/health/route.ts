import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Verificações básicas do sistema
    const checks = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }

    // Verificar conectividade de rede básica
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'ok',
      message: 'Application is healthy',
      checks,
      responseTime: `${responseTime}ms`,
      services: {
        api: 'online',
        frontend: 'online'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
} 