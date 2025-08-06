import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API test-auth: Iniciando teste de autenticação...')
    
    const supabase = await createServerClient()
    
    const results: any = {}

    // 1. Verificar sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('🔍 API test-auth: Session:', !!session, 'Error:', sessionError)
    
    results.session = {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: sessionError?.message
    }

    if (session?.user?.id) {
      // 2. Verificar usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      console.log('🔍 API test-auth: User data:', userData, 'Error:', userError)

      results.userInDatabase = {
        found: !!userData,
        data: userData,
        error: userError?.message
      }

      // 3. Verificar especificamente o admin
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'armazemsaojoaquimoficial@gmail.com')
        .single()

      console.log('🔍 API test-auth: Admin data:', adminData, 'Error:', adminError)

      results.adminUser = {
        found: !!adminData,
        data: adminData,
        error: adminError?.message
      }

      // 4. Simular requireAdmin logic
      try {
        if (!session) {
          results.requireAdminSimulation = 'FAIL: No session'
        } else {
          const { data: user, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (error) {
            results.requireAdminSimulation = `FAIL: Database error - ${error.message}`
          } else if (!user) {
            results.requireAdminSimulation = 'FAIL: User not found in users table'
          } else if (user.role !== 'admin') {
            results.requireAdminSimulation = `FAIL: User is not admin, role: ${user.role}`
          } else {
            results.requireAdminSimulation = 'SUCCESS: User is admin'
          }
        }
      } catch (error: any) {
        results.requireAdminSimulation = `ERROR: ${error.message}`
      }
    }

    // 5. Verificar todas as tabelas de usuários
    try {
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(10)

      results.allUsersInTable = {
        count: allUsers?.length || 0,
        users: allUsers,
        error: allUsersError?.message
      }
    } catch (error: any) {
      results.allUsersInTable = { error: error.message }
    }

    // 6. Headers e cookies info  
    const cookieHeader = request.headers.get('cookie')
    results.cookies = {
      hasCookies: !!cookieHeader,
      cookieCount: cookieHeader ? cookieHeader.split(';').length : 0,
      hasAuthCookie: cookieHeader?.includes('armazem-sao-joaquim-auth') || false
    }

    console.log('✅ API test-auth: Resultados:', results)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error: any) {
    console.error('❌ API test-auth: Erro:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}