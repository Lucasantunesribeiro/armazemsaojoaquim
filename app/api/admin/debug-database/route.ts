import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('🔍 [ADMIN-DEBUG-DB] Verificando acesso ao banco de dados...')
      
      const supabase = await createServerClient()
      
      // Testar diferentes tabelas
      const tests = [
        { name: 'profiles', query: () => supabase.from('profiles').select('id, email, role').limit(1) },
        { name: 'blog_posts', query: () => supabase.from('blog_posts').select('id, title_pt').limit(1) },
        { name: 'users', query: () => supabase.from('users').select('id, email').limit(1) },
        { name: 'cafe_products', query: () => supabase.from('cafe_products').select('id, name').limit(1) },
        { name: 'pousada_rooms', query: () => supabase.from('pousada_rooms').select('id, name').limit(1) }
      ]
      
      const results: Record<string, any> = {}
      
      for (const test of tests) {
        try {
          console.log(`🧪 Testando tabela: ${test.name}`)
          const { data, error, count } = await test.query()
          
          results[test.name] = {
            accessible: !error,
            error: error?.message || null,
            count: count || data?.length || 0,
            sample: data?.[0] || null
          }
          
          if (error) {
            console.error(`❌ Erro na tabela ${test.name}:`, error.message)
          } else {
            console.log(`✅ Tabela ${test.name}: OK (${count || data?.length || 0} registros)`)
          }
        } catch (error) {
          console.error(`💥 Erro crítico na tabela ${test.name}:`, error)
          results[test.name] = {
            accessible: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            count: 0,
            sample: null
          }
        }
      }
      
      // Verificar sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('✅ [ADMIN-DEBUG-DB] Diagnóstico completo')
      return NextResponse.json({
        success: true,
        message: 'Database diagnostic complete',
        auth: {
          hasSession: !!session,
          sessionError: sessionError?.message || null,
          userEmail: session?.user?.email || 'N/A',
          userId: session?.user?.id || 'N/A'
        },
        database: {
          tables: results,
          summary: {
            accessible: Object.values(results).filter(r => r.accessible).length,
            total: Object.keys(results).length,
            errors: Object.values(results).filter(r => !r.accessible).length
          }
        },
        headers: {
          adminSession: request.headers.get('X-Admin-Session'),
          adminVerified: request.headers.get('X-Admin-Verified')
        }
      })
      
    } catch (error) {
      console.error('💥 [ADMIN-DEBUG-DB] Erro interno:', error)
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
        debug: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }, request)
}
