import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API check-admin-user: Verificando se usuário admin existe...')
    
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    const results: any = {}

    // 1. Verificar se o usuário admin existe por email
    const { data: adminByEmail, error: adminEmailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'armazemsaojoaquimoficial@gmail.com')
      .single()

    console.log('🔍 Admin por email:', adminByEmail, 'Error:', adminEmailError)

    results.adminByEmail = {
      found: !!adminByEmail,
      data: adminByEmail,
      error: adminEmailError?.message
    }

    // 2. Verificar todos os usuários admin
    const { data: allAdmins, error: allAdminsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')

    console.log('🔍 Todos admins:', allAdmins, 'Error:', allAdminsError)

    results.allAdmins = {
      count: allAdmins?.length || 0,
      data: allAdmins,
      error: allAdminsError?.message
    }

    // 3. Verificar primeiros 5 usuários da tabela
    const { data: firstUsers, error: firstUsersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    console.log('🔍 Primeiros usuários:', firstUsers, 'Error:', firstUsersError)

    results.firstUsers = {
      count: firstUsers?.length || 0,
      data: firstUsers,
      error: firstUsersError?.message
    }

    // 4. Verificar se o ID específico do admin existe em auth.users
    if (adminByEmail?.id) {
      console.log('🔍 Verificando ID do admin em auth.users:', adminByEmail.id)
      
      // Simular uma sessão com esse ID
      const { data: userAuth, error: userAuthError } = await supabase.auth.admin.getUserById(adminByEmail.id)
      
      results.adminInAuthUsers = {
        found: !!userAuth.user,
        data: userAuth.user,
        error: userAuthError?.message
      }
    }

    // 5. Teste de inserção temporária (para verificar se a tabela funciona)
    const testId = '00000000-0000-0000-0000-000000000000'
    
    // Tentar inserir um usuário teste
    const { data: insertTest, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      })
      .select()

    if (!insertError) {
      // Se inseriu com sucesso, deletar imediatamente
      await supabase
        .from('users')
        .delete()
        .eq('id', testId)
    }

    results.tableWriteTest = {
      canWrite: !insertError,
      error: insertError?.message
    }

    console.log('✅ API check-admin-user: Resultados:', results)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error: any) {
    console.error('❌ API check-admin-user: Erro:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}