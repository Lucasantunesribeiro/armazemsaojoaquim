import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validar dados básicos
    if (!data.event || !data.timestamp) {
      return NextResponse.json(
        { error: 'Event and timestamp are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Inserir dados de analytics (se você tiver uma tabela de analytics)
    // Por enquanto, apenas log no console para desenvolvimento
    console.log('Analytics data received:', {
      event: data.event,
      timestamp: data.timestamp,
      userId: data.userId,
      sessionId: data.sessionId,
      page: data.page,
      properties: data.properties
    })

    // Se você quiser salvar no Supabase, descomente e configure a tabela:
    /*
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event: data.event,
        timestamp: data.timestamp,
        user_id: data.userId,
        session_id: data.sessionId,
        page: data.page,
        properties: data.properties
      })

    if (error) {
      throw error
    }
    */

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed',
    message: 'Use POST to send analytics data',
    timestamp: new Date().toISOString()
  }, { status: 405 })
} 