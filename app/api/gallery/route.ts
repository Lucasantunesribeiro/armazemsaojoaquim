import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withAdminAuth } from '@/lib/admin-auth'

// Cliente admin com service role para bypass RLS
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('🎨 [GALLERY] Iniciando busca...')

    let query = supabaseAdmin
      .from('art_gallery')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category.toUpperCase())
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('❌ [GALLERY] Erro ao buscar artworks:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar galeria', debug: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ [GALLERY] ${data?.length || 0} artworks encontrados`)

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      total: count || 0
    })
  } catch (error) {
    console.error('💥 [GALLERY] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('🎨 [GALLERY] Criando novo artwork...')

      const body = await request.json()
      const { title, artist, description, price, image_url, category, dimensions, year_created, historical_context, stock_quantity, featured } = body

      console.log('📝 [GALLERY] Dados recebidos:', { title, artist, category, price })

      if (!title || !artist || !category || price === undefined) {
        console.error('❌ [GALLERY] Dados obrigatórios faltando')
        return NextResponse.json(
          { error: 'Dados obrigatórios não fornecidos: title, artist, category, price' },
          { status: 400 }
        )
      }

      const { data: artwork, error } = await supabaseAdmin
        .from('art_gallery')
        .insert({
          title,
          artist,
          description,
          price,
          image_url,
          category: category.toUpperCase(),
          dimensions,
          year_created,
          historical_context,
          stock_quantity: stock_quantity || 1,
          featured: featured || false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [GALLERY] Erro ao criar artwork:', error)
        return NextResponse.json(
          { error: 'Erro ao criar artwork', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [GALLERY] Artwork criado: ${artwork.title}`)
      return NextResponse.json({
        success: true,
        data: artwork,
        message: 'Artwork criado com sucesso!'
      })
    } catch (error) {
      console.error('💥 [GALLERY] Erro interno:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }, request)
}
