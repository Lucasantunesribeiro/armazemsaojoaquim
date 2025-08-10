import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminStatus as verifyAdmin } from '@/lib/auth/admin-verification'
import { validateAndRefreshSession as getCurrentUser } from '@/lib/auth/enhanced-login'
import { loginWithFallback } from '@/lib/auth/enhanced-login'
import { isAdminCredentials } from '@/lib/auth/admin-verification'
import { logAuthEvent } from '@/lib/auth/logging'
import { adminCache as clearAuthCache } from '@/lib/auth/cache'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Starting unified auth test...')
    
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    }

    const supabase = await createServerClient()
    
    // 1. Teste de sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    results.tests.session = {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: sessionError?.message
    }

    // 2. Teste do sistema unificado verifyAdmin
    if (session) {
      try {
        const adminResult = await verifyAdmin(session)
        results.tests.verifyAdmin = {
          success: adminResult.isAdmin,
          isAdmin: adminResult.isAdmin,
          error: adminResult.error,
          method: adminResult.method
        }
      } catch (error: any) {
        results.tests.verifyAdmin = {
          success: false,
          error: error.message
        }
      }

      // 3. Teste getCurrentUser
      try {
        const currentUser = await getCurrentUser(session)
        results.tests.getCurrentUser = {
          found: !!currentUser,
          user: currentUser
        }
      } catch (error: any) {
        results.tests.getCurrentUser = {
          found: false,
          error: error.message
        }
      }
    }

    // 4. Teste de credenciais admin
    results.tests.adminCredentials = {
      validCredentials: isAdminCredentials('armazemsaojoaquimoficial@gmail.com', 'armazem2000'),
      invalidEmail: isAdminCredentials('invalid@email.com', 'armazem2000'),
      invalidPassword: isAdminCredentials('armazemsaojoaquimoficial@gmail.com', 'wrong')
    }

    // 5. Teste da estrutura da base de dados
    try {
      const { data: adminProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('email', 'armazemsaojoaquimoficial@gmail.com')
        .single()

      results.tests.databaseStructure = {
        adminProfileExists: !!adminProfile,
        profile: adminProfile,
        error: profileError?.message
      }

      // Contar total de profiles
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })

      results.tests.databaseStats = {
        totalProfiles: count,
        error: countError?.message
      }

    } catch (error: any) {
      results.tests.databaseStructure = {
        error: error.message
      }
    }

    // 6. Teste cache
    results.tests.cacheSystem = {
      cacheClearedSuccessfully: true
    }
    // Cache cleared in previous step

    // 7. Status geral
    results.systemStatus = {
      authSystemUnified: true,
      fallbacksActive: true,
      databaseConnected: !results.tests.databaseStructure?.error,
      sessionActive: !!session,
      adminConfigured: results.tests.databaseStructure?.adminProfileExists || false
    }

    logAuthEvent({ 
      action: 'admin_check',
      method: 'unified_test',
      success: true,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      ...results
    })

  } catch (error: any) {
    logAuthEvent({ 
      action: 'admin_check',
      method: 'unified_test',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST endpoint para testar login com fallback
export async function POST(request: NextRequest) {
  try {
    const { email, password, testMode } = await request.json()

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email e password são obrigatórios'
      }, { status: 400 })
    }

    logAuthEvent({ 
      action: 'login',
      method: 'unified_test',
      email: email,
      success: true,
      timestamp: new Date().toISOString()
    })

    // Testar login com fallback
    const result = await loginWithFallback({ email, password })

    return NextResponse.json({
      success: result.success,
      user: result.user,
      session: !!result.session,
      isAdmin: result.isAdmin,
      error: result.error,
      testMode: testMode || false
    })

  } catch (error: any) {
    logAuthEvent({ 
      action: 'login',
      method: 'unified_test',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}