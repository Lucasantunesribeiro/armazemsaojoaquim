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

// PUT - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📦 API Categorias: Atualizando categoria:', params.id)
    
    const auth = await checkAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    console.log('📦 API Categorias: Dados para atualização:', body)

    const { data, error } = await supabaseAdmin
      .from('menu_categories')
      .update({
        name: body.name,
        description: body.description,
        display_order: body.display_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('❌ API Categorias: Erro ao atualizar:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Categorias: Categoria atualizada:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API Categorias: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE - Excluir categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📦 API Categorias: Excluindo categoria:', params.id)
    
    const auth = await checkAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Verificar se há itens usando esta categoria
    const { data: items } = await supabaseAdmin
      .from('menu_items')
      .select('id')
      .eq('category', params.id)
      .limit(1)

    if (items && items.length > 0) {
      console.log('❌ API Categorias: Categoria tem itens associados')
      return NextResponse.json(
        { error: 'Não é possível excluir categoria com itens associados' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('menu_categories')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('❌ API Categorias: Erro ao excluir:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Categorias: Categoria excluída com sucesso')
    return NextResponse.json({ message: 'Categoria excluída com sucesso' })
  } catch (error) {
    console.error('❌ API Categorias: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}