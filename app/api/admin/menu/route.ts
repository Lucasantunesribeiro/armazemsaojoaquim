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

// GET - Listar itens do menu
export async function GET(request: NextRequest) {
  try {
    console.log('🍽️ API Menu: Carregando lista...')
    
    const auth = await checkAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { data: menuItems, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name')

    if (error) {
      console.error('❌ API Menu: Erro na query:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Menu: Dados carregados:', menuItems?.length || 0, 'itens')
    return NextResponse.json(menuItems || [])
  } catch (error) {
    console.error('❌ API Menu: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST - Criar item do menu
export async function POST(request: NextRequest) {
  try {
    console.log('🍽️ API Menu: Criando novo item...')
    
    const auth = await checkAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    console.log('🍽️ API Menu: Dados recebidos:', body)

    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .insert([{
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        available: body.available,
        featured: body.featured,
        allergens: body.allergens,
        image_url: body.image_url
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ API Menu: Erro ao criar:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Menu: Item criado:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API Menu: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}