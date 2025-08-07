import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('🧪 [ADMIN-TEST-AUTH] Testando autenticação admin...')
      
      const supabase = await createServerClient()
      
      // Testar acesso ao banco de dados
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .limit(1)
      
      if (testError) {
        console.error('❌ [ADMIN-TEST-AUTH] Erro no teste de banco:', testError)
        return NextResponse.json({
          success: false,
          error: 'Database access failed',
          debug: testError.message
        }, { status: 500 })
      }
      
      console.log('✅ [ADMIN-TEST-AUTH] Autenticação admin funcionando')
      return NextResponse.json({
        success: true,
        message: 'Admin authentication working',
        authResult: {
          isAdmin: authResult.isAdmin,
          hasUser: !!authResult.user,
          hasSession: !!authResult.session,
          userEmail: authResult.user?.email || 'N/A'
        },
        database: {
          accessible: true,
          testData: testData?.length || 0
        },
        headers: {
          adminSession: request.headers.get('X-Admin-Session'),
          adminVerified: request.headers.get('X-Admin-Verified')
        }
      })
      
    } catch (error) {
      console.error('💥 [ADMIN-TEST-AUTH] Erro interno:', error)
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
        debug: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }, request)
}
