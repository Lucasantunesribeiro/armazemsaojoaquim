import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getDegradedMenuCatalog } from '@/lib/menu-static-catalog'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '100')
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
      console.warn('⚠️ Menu API: Banco indisponível (HTTP 402 ou erro). Retornando catálogo degradado de 70 itens:', error.message)
      const degradedCatalog = getDegradedMenuCatalog()
      let filteredData = degradedCatalog
      if (category && category !== 'all') {
        filteredData = filteredData.filter(item => item.category === category)
      }
      if (featured === 'true') {
        filteredData = filteredData.filter(item => item.featured)
      }

      const response = NextResponse.json({
        success: true,
        degraded: true,
        databaseUnavailable: true,
        data: filteredData.slice(offset, offset + limit),
        count: filteredData.length,
        total: degradedCatalog.length
      })
      response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30')
      return response
    }

    console.log(`✅ Menu API: ${menuItems?.length || 0} itens encontrados`)

    const response = NextResponse.json({
      success: true,
      degraded: false,
      databaseUnavailable: false,
      data: menuItems || [],
      count: menuItems?.length || 0
    })
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30')
    return response
  } catch (error) {
    console.error('💥 Erro grave na API de menu:', error)
    const degradedCatalog = getDegradedMenuCatalog()
    const response = NextResponse.json({
      success: true,
      degraded: true,
      databaseUnavailable: true,
      data: degradedCatalog,
      count: degradedCatalog.length,
      total: degradedCatalog.length
    })
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30')
    return response
  }
}
