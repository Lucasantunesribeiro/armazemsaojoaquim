import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    // Teste de conectividade básica
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Teste 1: Verificar se consegue fazer uma query básica
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    // Teste 2: Verificar configurações de auth
    const authConfig = {
      url: supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        database: {
          success: !testError || testError.code === 'PGRST116', // PGRST116 = table not found is OK
          error: testError?.message || null
        },
        auth: authConfig
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isProduction: process.env.NODE_ENV === 'production'
      }
    })

  } catch (error: any) {
    console.error('Test Auth API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json()
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    if (action === 'test-signup') {
      // Teste de signup
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      
      return NextResponse.json({
        success: !error,
        data: data ? { user: { id: data.user?.id, email: data.user?.email } } : null,
        error: error?.message || null,
        timestamp: new Date().toISOString()
      })
    }
    
    if (action === 'test-signin') {
      // Teste de signin
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      return NextResponse.json({
        success: !error,
        data: data ? { user: { id: data.user?.id, email: data.user?.email } } : null,
        error: error?.message || null,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Test Auth POST Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 