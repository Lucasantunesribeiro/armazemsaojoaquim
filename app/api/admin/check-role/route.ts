import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Service Role para acessar dados sem RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Cliente regular para verificar auth
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API CheckRole: Verificando permissões...')
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ API CheckRole: Token não encontrado')
      return NextResponse.json({ isAdmin: false, error: 'No token' })
    }

    const token = authHeader.substring(7)
    
    // Verificar usuário com token
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token)
    
    if (userError || !user) {
      console.log('❌ API CheckRole: Usuário inválido:', userError?.message)
      return NextResponse.json({ isAdmin: false, error: 'Invalid user' })
    }

    console.log('✅ API CheckRole: Usuário válido:', user.email)

    // Verificar se é admin pelo email (método mais direto)
    const isAdmin = user.email === 'armazemsaojoaquimoficial@gmail.com'
    
    if (isAdmin) {
      console.log('✅ API CheckRole: Admin confirmado por email')
      return NextResponse.json({ 
        isAdmin: true,
        user: {
          id: user.id,
          email: user.email,
          role: 'admin'
        }
      })
    }

    // Verificar role usando Service Role (bypassa RLS) como fallback
    try {
      const { data: userData, error: roleError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, created_at')
        .eq('id', user.id)
        .single()

      if (roleError) {
        console.error('❌ API CheckRole: Erro ao buscar perfil:', roleError)
        // Se não encontrar no profiles, ainda pode ser admin se for o email correto
        return NextResponse.json({ 
          isAdmin: false, 
          error: 'Profile not found'
        })
      }

      console.log('🔍 API CheckRole: Perfil encontrado:', userData?.email)
      
      // Dupla verificação: email admin ou perfil existente
      const finalIsAdmin = userData?.email === 'armazemsaojoaquimoficial@gmail.com'
      
      console.log('🔍 API CheckRole: Verificação final:', {
        email: userData?.email,
        isAdmin: finalIsAdmin
      })

      return NextResponse.json({ 
        isAdmin: finalIsAdmin,
        user: {
          id: user.id,
          email: user.email,
          role: finalIsAdmin ? 'admin' : 'user'
        }
      })

    } catch (dbError) {
      console.error('❌ API CheckRole: Erro no banco:', dbError)
      // Em caso de erro no banco, verificar apenas pelo email
      return NextResponse.json({ 
        isAdmin: user.email === 'armazemsaojoaquimoficial@gmail.com',
        user: {
          id: user.id,
          email: user.email,
          role: user.email === 'armazemsaojoaquimoficial@gmail.com' ? 'admin' : 'user'
        }
      })
    }

  } catch (error) {
    console.error('❌ API CheckRole: Erro interno:', error)
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Internal error'
    })
  }
}