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

// PUT - Atualizar item do menu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🍽️ API Menu: Atualizando item:', params.id)
    
    const auth = await checkAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    console.log('🍽️ API Menu: Dados para atualização:', body)
    
    // Se é apenas uma atualização de disponibilidade
    if (Object.keys(body).length === 1 && 'available' in body) {
      const { data, error } = await supabaseAdmin
        .from('menu_items')
        .update({
          available: body.available,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        console.error('❌ API Menu: Erro ao atualizar disponibilidade:', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      console.log('✅ API Menu: Disponibilidade atualizada:', data)
      return NextResponse.json(data)
    }

    // Atualização completa
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        available: body.available,
        featured: body.featured,
        allergens: body.allergens,
        image_url: body.image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('❌ API Menu: Erro ao atualizar:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Menu: Item atualizado:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API Menu: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE - Excluir item do menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🍽️ API Menu: Excluindo item:', params.id)
    
    const auth = await checkAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('❌ API Menu: Erro ao excluir:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Menu: Item excluído com sucesso')
    return NextResponse.json({ message: 'Item excluído com sucesso' })
  } catch (error) {
    console.error('❌ API Menu: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}