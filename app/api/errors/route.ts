import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface ErrorData {
  message: string
  stack?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  timestamp: string
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorData = await request.json()

    // Validar dados básicos
    if (!errorData.message || !errorData.severity || !errorData.type) {
      return NextResponse.json(
        { error: 'Message, severity, and type are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Log do erro para desenvolvimento
    console.error('Error tracked:', {
      message: errorData.message,
      severity: errorData.severity,
      type: errorData.type,
      timestamp: errorData.timestamp,
      url: errorData.url,
      userId: errorData.userId,
      sessionId: errorData.sessionId
    })

    // Em produção, você salvaria no Supabase em uma tabela de erros
    // Descomente e configure a tabela quando necessário:
    /*
    const { error } = await supabase
      .from('error_logs')
      .insert({
        message: errorData.message,
        stack: errorData.stack,
        severity: errorData.severity,
        type: errorData.type,
        timestamp: errorData.timestamp,
        user_id: errorData.userId,
        session_id: errorData.sessionId,
        url: errorData.url,
        user_agent: errorData.userAgent,
        metadata: errorData.metadata
      })

    if (error) {
      throw error
    }
    */

    return NextResponse.json({ 
      success: true,
      message: 'Error logged successfully'
    })

  } catch (error) {
    console.error('Error logging API error:', error)
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Endpoint para recuperar estatísticas de erro
    // Por enquanto, retorna dados mockados
    
    const mockStats = {
      total: 42,
      recent: 5,
      critical: 1,
      byType: {
        'network': 15,
        'validation': 12,
        'runtime': 8,
        'database': 4,
        'authentication': 3
      },
      bySeverity: {
        'low': 20,
        'medium': 15,
        'high': 6,
        'critical': 1
      },
      recentErrors: [
        {
          id: 1,
          message: 'Network timeout error',
          severity: 'medium',
          type: 'network',
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
        },
        {
          id: 2,
          message: 'Database connection failed',
          severity: 'critical',
          type: 'database',
          timestamp: new Date(Date.now() - 1800000).toISOString() // 30 min atrás
        }
      ]
    }

    return NextResponse.json({
      success: true,
      stats: mockStats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to get error stats' },
      { status: 500 }
    )
  }
} 