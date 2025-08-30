import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Cliente simples com Service Role para bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('🎨 Gallery API: Iniciando busca...')

    // Por enquanto, retornar array vazio com mensagem
    // Os itens da galeria serão adicionados em breve
    const artworks: any[] = []

    let filteredArtworks = artworks

    if (category && category !== 'all') {
      filteredArtworks = filteredArtworks.filter(art => 
        art.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (featured === 'true') {
      filteredArtworks = filteredArtworks.filter(art => art.featured)
    }

    // Aplicar limit e offset
    const paginatedArtworks = filteredArtworks.slice(offset, offset + limit)

    console.log(`✅ Gallery API: ${paginatedArtworks.length} artworks encontrados (galeria em construção)`)

    return NextResponse.json({
      success: true,
      data: paginatedArtworks,
      count: paginatedArtworks.length,
      total: filteredArtworks.length,
      message: 'Galeria em construção - itens serão adicionados em breve'
    })
  } catch (error) {
    console.error('💥 Erro na API de galeria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Para POST, vamos manter funcionalidade básica
    return NextResponse.json(
      { error: 'Funcionalidade de criação temporariamente desabilitada' },
      { status: 503 }
    )
  } catch (error) {
    console.error('💥 Erro na API de galeria POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
