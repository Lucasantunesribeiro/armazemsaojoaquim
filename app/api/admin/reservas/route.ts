import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 }
  }

  const token = authHeader.substring(7)
  const { data: { user } } = await supabaseAuth.auth.getUser(token)
  
  if (!user) {
    return { error: 'Invalid token', status: 401 }
  }

  if (user.email !== 'armazemsaojoaquimoficial@gmail.com') {
    return { error: 'Admin required', status: 403 }
  }

  return { user }
}

// GET - Listar reservas
export async function GET(request: NextRequest) {
  try {
    console.log('📅 API Reservas: Carregando lista...')
    
    const auth = await checkAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    console.log('✅ API Reservas: Admin autenticado')

    const { data: reservations, error } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .order('data', { ascending: false })
      .order('horario', { ascending: false })

    if (error) {
      console.error('❌ API Reservas: Erro na query:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Reservas: Dados carregados:', reservations?.length || 0, 'reservas')
    return NextResponse.json(reservations || [])

  } catch (error) {
    console.error('❌ API Reservas: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}