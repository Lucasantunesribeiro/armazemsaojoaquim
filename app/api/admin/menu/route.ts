import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-auth'

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

// GET - Listar itens do menu
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
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
    
    const authResult = await verifyAdminAccess(request)
    if (!authResult.success) {
      console.log('❌ API Menu: Admin access denied:', authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }
    
    console.log('✅ API Menu: Admin access verified for:', authResult.user?.email)

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
