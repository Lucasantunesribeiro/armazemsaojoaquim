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

// GET - Listar categorias
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    // Categorias obrigatórias do projeto
    const requiredCategories = [
      { name: 'Petiscos', description: 'Aperitivos e petiscos para compartilhar', display_order: 1 },
      { name: 'Saladas', description: 'Saladas frescas e nutritivas', display_order: 2 },
      { name: 'Pratos Principais', description: 'Pratos principais da casa', display_order: 3 },
      { name: 'Sanduíches', description: 'Sanduíches artesanais', display_order: 4 },
      { name: 'Sobremesas', description: 'Doces e sobremesas especiais', display_order: 5 },
      { name: 'Bebidas sem Álcool', description: 'Bebidas não alcoólicas', display_order: 6 },
      { name: 'Cervejas', description: 'Seleção de cervejas nacionais e importadas', display_order: 7 },
      { name: 'Coquetéis', description: 'Drinks autorais da casa', display_order: 8 },
      { name: 'Caipirinhas', description: 'Caipirinhas tradicionais e especiais', display_order: 9 },
      { name: 'Destilados', description: 'Cachaças, vodkas e whiskies', display_order: 10 },
      { name: 'Vinhos', description: 'Carta de vinhos selecionados', display_order: 11 },
      { name: 'Guarnições', description: 'Acompanhamentos e guarnições', display_order: 12 },
    ]

    // Busca todas as categorias existentes
    const { data: existingCategories, error: fetchError } = await supabaseAdmin
      .from('menu_categories')
      .select('*')

    if (fetchError) {
      console.error('❌ API Categorias: Erro na query:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Insere categorias que não existem
    for (const cat of requiredCategories) {
      if (!existingCategories?.some((c: any) => c.name === cat.name)) {
        await supabaseAdmin.from('menu_categories').insert([cat])
      }
    }

    // Busca novamente, agora ordenando
    const { data: categories, error } = await supabaseAdmin
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('❌ API Categorias: Erro na query:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Categorias: Dados carregados:', categories?.length || 0, 'categorias')
    return NextResponse.json(categories || [])
  } catch (error) {
    console.error('❌ API Categorias: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST - Criar categoria
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const body = await request.json()
    console.log('📦 API Categorias: Dados recebidos:', body)

    const { data, error } = await supabaseAdmin
      .from('menu_categories')
      .insert([{
        name: body.name,
        description: body.description,
        display_order: body.display_order
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ API Categorias: Erro ao criar:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Categorias: Categoria criada:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API Categorias: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
