import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG AUTH: Iniciando debug detalhado...')
    
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    
    const results: any = {}

    // 1. Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('🔍 DEBUG AUTH: Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: sessionError?.message
    })
    
    results.session = {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: sessionError?.message
    }

    if (session?.user) {
      // 2. Verificar admin por email
      const isAdminByEmail = session.user.email === 'armazemsaojoaquimoficial@gmail.com'
      results.adminByEmail = isAdminByEmail
      
      console.log('🔍 DEBUG AUTH: Admin check por email:', {
        userEmail: session.user.email,
        expectedEmail: 'armazemsaojoaquimoficial@gmail.com',
        isAdminByEmail
      })

      // 3. Verificar se o usuário existe na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      console.log('🔍 DEBUG AUTH: User data check:', {
        found: !!userData,
        data: userData,
        error: userError?.message
      })

      results.userInDatabase = {
        found: !!userData,
        data: userData,
        error: userError?.message
      }

      // 4. Verificar admin por role no banco
      if (userData) {
        const isAdminByRole = userData.role === 'admin'
        results.adminByRole = isAdminByRole
        
        console.log('🔍 DEBUG AUTH: Admin check por role:', {
          userRole: userData.role,
          isAdminByRole
        })
      }

      // 5. Simular exatamente o que requireAdmin faz
      const requireAdminSimulation = async () => {
        console.log('🔍 DEBUG AUTH: Simulando requireAdmin...')
        
        if (!session) {
          return 'FAIL: No session'
        }
        
        // Primeira verificação - por email
        if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
          return 'SUCCESS: Admin by email'
        }
        
        // Segunda verificação - por role no banco
        try {
          const { data: user, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          if (error) {
            return `FAIL: Database error - ${error.message}`
          }
          
          if (!user) {
            return 'FAIL: User not found in database'
          }
          
          if (user.role !== 'admin') {
            return `FAIL: User is not admin, role: ${user.role}`
          }
          
          return 'SUCCESS: Admin by role'
        } catch (error: any) {
          return `ERROR: ${error.message}`
        }
      }

      results.requireAdminSimulation = await requireAdminSimulation()
      
      // 6. Verificar se há discrepância entre auth.users e public.users
      const { data: adminInPublicUsers, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'armazemsaojoaquimoficial@gmail.com')
        .single()

      results.adminInPublicUsers = {
        found: !!adminInPublicUsers,
        data: adminInPublicUsers,
        error: adminError?.message
      }

      console.log('🔍 DEBUG AUTH: Admin em public.users:', {
        found: !!adminInPublicUsers,
        id: adminInPublicUsers?.id,
        email: adminInPublicUsers?.email,
        role: adminInPublicUsers?.role
      })

      // 7. Verificar se os IDs coincidem
      if (adminInPublicUsers) {
        const idMatch = session.user.id === adminInPublicUsers.id
        results.idMatch = idMatch
        
        console.log('🔍 DEBUG AUTH: ID match:', {
          authUserId: session.user.id,
          publicUserId: adminInPublicUsers.id,
          match: idMatch
        })
      }
    }

    console.log('✅ DEBUG AUTH: Resultados completos:', results)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error: any) {
    console.error('❌ DEBUG AUTH: Erro:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}