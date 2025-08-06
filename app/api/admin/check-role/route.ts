import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers' // Não necessário mais
import { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
  console.log('🔍 API CheckRole: Iniciando verificação de permissões - ' + new Date().toISOString())
  
  try {
    const cookieStore = await cookies()
    
    // Create Supabase client with same configuration as other admin APIs
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              console.log('🍪 API CheckRole: Error setting cookies:', error)
            }
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          flowType: 'pkce',
          storageKey: 'armazem-sao-joaquim-auth',
          debug: process.env.NODE_ENV === 'development'
        },
      }
    )
    
    // Get session from cookies (same as other admin APIs)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ API CheckRole: Erro na sessão:', sessionError)
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Session error',
        details: sessionError.message 
      })
    }
    
    if (!session || !session.user) {
      console.log('❌ API CheckRole: Sem sessão ativa')
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'No active session' 
      })
    }

    const user = session.user
    console.log('✅ API CheckRole: Usuário autenticado:', user.email)

    // Primary check: admin email verification
    const isAdminByEmail = user.email === 'armazemsaojoaquimoficial@gmail.com'
    
    if (isAdminByEmail) {
      console.log('✅ API CheckRole: Admin confirmado por email direto')
      return NextResponse.json({ 
        isAdmin: true,
        user: {
          id: user.id,
          email: user.email,
          role: 'admin'
        },
        source: 'email_verification'
      })
    }

    // Secondary check: verify in public.users table for role
    try {
      console.log('🔍 API CheckRole: Verificando role na tabela users...')
      
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', user.id)
        .single()

      if (roleError) {
        console.error('❌ API CheckRole: Erro ao buscar usuário na tabela users:', roleError)
        
        // Fallback: if user not found in public.users but email matches admin, still allow
        if (user.email === 'armazemsaojoaquimoficial@gmail.com') {
          console.log('✅ API CheckRole: Admin confirmado por email (fallback)')
          return NextResponse.json({ 
            isAdmin: true,
            user: {
              id: user.id,
              email: user.email,
              role: 'admin'
            },
            source: 'email_fallback'
          })
        }
        
        return NextResponse.json({ 
          isAdmin: false, 
          error: 'User not found in database',
          details: roleError.message
        })
      }

      console.log('🔍 API CheckRole: Dados do usuário encontrados:', {
        email: userData.email,
        role: userData.role
      })
      
      // Check if user has admin role OR is the admin email
      const isAdminByRole = userData.role === 'admin'
      const isAdminByEmailMatch = userData.email === 'armazemsaojoaquimoficial@gmail.com'
      const finalIsAdmin = isAdminByRole || isAdminByEmailMatch
      
      console.log('🔍 API CheckRole: Verificação final:', {
        isAdminByRole,
        isAdminByEmailMatch,
        finalIsAdmin
      })

      return NextResponse.json({ 
        isAdmin: finalIsAdmin,
        user: {
          id: user.id,
          email: user.email,
          role: finalIsAdmin ? 'admin' : (userData.role || 'user')
        },
        source: 'database_verification'
      })

    } catch (dbError: any) {
      console.error('❌ API CheckRole: Erro no banco de dados:', dbError)
      
      // Final fallback: if database fails but email is admin, allow access
      if (user.email === 'armazemsaojoaquimoficial@gmail.com') {
        console.log('✅ API CheckRole: Admin confirmado por email (fallback de erro)')
        return NextResponse.json({ 
          isAdmin: true,
          user: {
            id: user.id,
            email: user.email,
            role: 'admin'
          },
          source: 'error_fallback'
        })
      }
      
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Database error',
        details: dbError.message
      })
    }

  } catch (error: any) {
    console.error('❌ API CheckRole: Erro interno:', error)
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}