import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

// GET - List all users (from public.users table) or get count
export async function GET(request: NextRequest) {
  console.log('🚀 API /admin/users: ROTA CHAMADA - ' + new Date().toISOString())
  try {
    console.log('🔍 API /admin/users: Iniciando verificação de autenticação...')
    
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    console.log('🍪 API /admin/users: Cookies encontrados:', allCookies.map(c => c.name))
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const allCookies = cookieStore.getAll()
            console.log('🍪 API /admin/users: getAll chamado, retornando:', allCookies.length, 'cookies')
            return allCookies
          },
          setAll(cookiesToSet) {
            console.log('🍪 API /admin/users: setAll chamado com:', cookiesToSet.length, 'cookies')
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                console.log('🍪 API /admin/users: Setting cookie:', name)
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              console.log('🍪 API /admin/users: Erro ao definir cookies:', error)
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
    
    // Check if user is admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('🔍 API /admin/users: Sessão no servidor:', session ? 'Encontrada' : 'Não encontrada')
    console.log('🔍 API /admin/users: Erro de sessão:', sessionError)
    
    if (!session) {
      console.log('❌ API /admin/users: Sem sessão ativa no servidor')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ API /admin/users: Sessão encontrada para:', session.user.email)

    // Check if user is admin - exact email match
    if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
      console.log('❌ API /admin/users: Usuário não é admin:', session.user.email)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    
    // Check if this is a count request
    if (request.url.includes('/count')) {
      console.log('🔢 API /admin/users: Contando usuários via função SECURITY DEFINER...')
      
      const { data: count, error } = await supabase.rpc('admin_get_users_count')

      if (error) {
        console.error('❌ API /admin/users: Erro ao contar usuários:', error)
        return NextResponse.json({ error: 'Failed to fetch users count' }, { status: 500 })
      }

      console.log('✅ API /admin/users: Total de usuários:', count)
      return NextResponse.json({ count: count || 0 })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('📋 API /admin/users: Buscando usuários via função SECURITY DEFINER - página:', page, 'limite:', limit)
    
    // Use SECURITY DEFINER function for better performance and security
    const search = searchParams.get('search') || null
    const role = searchParams.get('role') || null
    
    const { data: usersData, error } = await supabase.rpc('admin_get_users', {
      page_size: limit,
      page_number: page,
      search_term: search,
      role_filter: role
    })

    if (error) {
      console.error('❌ API /admin/users: Erro ao buscar usuários:', error)
      console.error('❌ API /admin/users: Detalhes do erro:', JSON.stringify(error, null, 2))
      
      // Fallback to direct table query if function fails
      console.log('🔄 API /admin/users: Tentando fallback para query direta...')
      const { data: fallbackUsers, error: fallbackError, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, (page - 1) * limit + limit - 1)
      
      if (fallbackError) {
        console.error('❌ API /admin/users: Fallback também falhou:', fallbackError)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
      }
      
      return NextResponse.json({
        users: fallbackUsers || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        },
        source: 'fallback'
      })
    }

    // A nova função RPC retorna um objeto com users e pagination
    const users = usersData?.users || []
    const pagination = usersData?.pagination || { total_count: 0 }
    
    console.log('✅ API /admin/users: Usuários encontrados:', users.length)
    console.log('✅ API /admin/users: Total de usuários:', pagination.total_count)
    
    // Log sample data for debugging
    if (users.length > 0) {
      console.log('📊 API /admin/users: Amostra dos dados:', {
        id: users[0].id,
        email: users[0].email,
        full_name: users[0].full_name,
        role: users[0].role,
        created_at: users[0].created_at
      })
    }

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone,
        created_at: u.created_at,
        updated_at: u.updated_at,
        role: u.role,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at
      })),
      pagination,
      source: 'security_definer'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 