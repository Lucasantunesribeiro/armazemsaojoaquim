import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'
// import { cookies } from 'next/headers' // Não necessário mais

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    
    const tables = [
      'cafe_products',
      'pousada_rooms', 
      'users',
      'profiles'
    ]
    
    const results: Record<string, any> = {}
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          results[table] = { 
            exists: false, 
            error: error.message,
            code: error.code 
          }
        } else {
          results[table] = { 
            exists: true, 
            count: count || 0 
          }
        }
      } catch (err: any) {
        results[table] = { 
          exists: false, 
          error: err.message || 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      tables: results,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Erro no teste de tabelas:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 })
  }
}