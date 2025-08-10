import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyAdminStatus as verifyAdmin } from '@/lib/auth/admin-verification'
import { validateAndRefreshSession as getCurrentUser } from '@/lib/auth/enhanced-login'
import { loginWithFallback } from '@/lib/auth/enhanced-login'
import { logAuthEvent } from '@/lib/auth/logging'

export async function GET(request: NextRequest) {
  try {
    logAuthEvent({ 
      action: 'admin_check',
      method: 'test_auth',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      success: true,
      timestamp: new Date().toISOString()
    })
    
    const supabase = await createServerClient()
    
    const results: any = {}

    // 1. Verificar sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    logAuthEvent({ 
      action: 'admin_check',
      method: 'session_check',
      success: !!session,
      error: sessionError?.message,
      timestamp: new Date().toISOString()
    })
    
    results.session = {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: sessionError?.message
    }

    if (session?.user?.id) {
      // 2. Verificar usuário na tabela profiles (corrigido)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      logAuthEvent({ 
        action: 'admin_check',
        method: 'profile_check',
        success: !!profileData,
        error: profileError?.message,
        timestamp: new Date().toISOString()
      })

      results.userInDatabase = {
        found: !!profileData,
        data: profileData,
        error: profileError?.message,
        table: 'profiles'
      }

      // 3. Verificar especificamente o admin
      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'armazemsaojoaquimoficial@gmail.com')
        .single()

      logAuthEvent({ 
        action: 'admin_check',
        method: 'admin_check',
        success: !!adminData,
        error: adminError?.message,
        timestamp: new Date().toISOString()
      })

      results.adminUser = {
        found: !!adminData,
        data: adminData,
        error: adminError?.message,
        table: 'profiles'
      }

      // 4. Testar novo sistema de autenticação unificado
      try {
        const adminResult = await verifyAdmin(session)
        results.unifiedAuthSystem = {
          isAdmin: adminResult.isAdmin,
          user: adminResult.profile,
          error: adminResult.error,
          method: adminResult.method,
          status: adminResult.isAdmin ? 'SUCCESS' : 'FAIL'
        }

        // 5. Testar getCurrentUser
        const currentUser = await getCurrentUser(session)
        results.getCurrentUser = {
          found: !!currentUser,
          user: currentUser
        }

      } catch (error: any) {
        results.unifiedAuthSystem = {
          status: 'ERROR',
          error: error.message
        }
      }
    }

    // 6. Verificar todas as tabelas de usuários (corrigido para profiles)
    try {
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
        .limit(10)

      results.allUsersInTable = {
        count: allProfiles?.length || 0,
        users: allProfiles,
        error: allProfilesError?.message,
        table: 'profiles'
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
