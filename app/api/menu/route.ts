import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('🍽️ Menu API: Iniciando busca...')

    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    const { data: menuItems, error } = await query
      .order('category')
      .order('name')
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Menu API: Erro na query:', error)
      return NextResponse.json(
        { success: false, error: 'Database error', data: [], count: 0 },
        { status: 500 }
      )
    }

    console.log(`✅ Menu API: ${menuItems?.length || 0} itens encontrados`)

    const response = NextResponse.json({
      success: true,
      data: menuItems || [],
      count: menuItems?.length || 0
    })
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30')
    return response
  } catch (error) {
    console.error('💥 Erro na API de menu:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
