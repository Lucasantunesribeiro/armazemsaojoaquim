import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getDegradedCafeProducts } from '@/lib/cafe-static-catalog'

export async function GET(request: NextRequest) {
  try {
    console.log('☕ Cafe Products API: Iniciando busca de produtos...')

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const maxPrice = searchParams.get('max_price')
    const available = searchParams.get('available')

    // Buscar produtos do banco
    let query = supabase
      .from('cafe_products')
      .select('*')

    // Aplicar filtros
    if (category && category !== 'all') {
      query = query.eq('category', category.toUpperCase())
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (available === 'true') {
      query = query.eq('available', true)
    }

    // Ordenar por categoria e nome
    query = query.order('category').order('name')

    const { data, error } = await query

    if (error) {
      console.warn('⚠️ Cafe Products API: Banco indisponível (HTTP 402 ou erro). Retornando catálogo degradado do café:', error.message)
      return getDegradedResponse(category, maxPrice, available)
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Nenhum produto encontrado no banco, usando catálogo degradado do café')
      return getDegradedResponse(category, maxPrice, available)
    }

    console.log(`✅ Cafe Products API: ${data.length} produtos encontrados no banco`)

    const response = NextResponse.json({
      success: true,
      degraded: false,
      databaseUnavailable: false,
      data: data,
      count: data.length,
      categories: ['CAFE', 'DOCE', 'SALGADO', 'BEBIDA', 'SORVETE']
    })
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30')
    return response

  } catch (error) {
    console.error('💥 Erro na API de produtos do café:', error)
    return getDegradedResponse()
  }
}

function getDegradedResponse(category?: string | null, maxPrice?: string | null, available?: string | null) {
  console.log('📦 Retornando catálogo de produtos degradado do café')

  const mockProducts = getDegradedCafeProducts()
  let filteredProducts = [...mockProducts]

  // Aplicar filtros no fallback
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category.toUpperCase() === category.toUpperCase())
  }

  if (maxPrice) {
    const priceNum = parseFloat(maxPrice)
    filteredProducts = filteredProducts.filter(p => p.price <= priceNum)
  }

  if (available === 'true') {
    filteredProducts = filteredProducts.filter(p => p.available)
  }

  const response = NextResponse.json({
    success: true,
    degraded: true,
    databaseUnavailable: true,
    data: filteredProducts,
    count: filteredProducts.length,
    total: mockProducts.length,
    categories: ['CAFE', 'DOCE', 'SALGADO', 'BEBIDA', 'SORVETE']
  })
  response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30')
  return response
}