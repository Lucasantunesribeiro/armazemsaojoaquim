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

    // Mock data primeiro para testar
    const mockArtworks = [
      {
        id: '1',
        title: 'Pôr do Sol em Santa Teresa',
        artist: 'Maria Silva',
        description: 'Uma linda vista do pôr do sol no bairro histórico',
        price: 450.00,
        image_url: '/images/gallery/artwork1.jpg',
        category: 'PAISAGEM',
        dimensions: '40x60cm',
        year_created: 2023,
        historical_context: 'Retrata a vista icônica do bairro',
        stock_quantity: 1,
        featured: true,
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      },
      {
        id: '2',
        title: 'Bondinho Amarelo',
        artist: 'João Santos',
        description: 'O famoso bondinho amarelo de Santa Teresa',
        price: 380.00,
        image_url: '/images/gallery/artwork2.jpg',
        category: 'TRANSPORTE',
        dimensions: '30x40cm',
        year_created: 2022,
        historical_context: 'Símbolo histórico do transporte local',
        stock_quantity: 2,
        featured: false,
        created_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z'
      },
      {
        id: '3',
        title: 'Ruas de Paralelepípedo',
        artist: 'Ana Costa',
        description: 'As características ruas de paralelepípedo do bairro',
        price: 520.00,
        image_url: '/images/gallery/artwork3.jpg',
        category: 'ARQUITETURA',
        dimensions: '50x70cm',
        year_created: 2023,
        historical_context: 'Preservação do patrimônio histórico',
        stock_quantity: 1,
        featured: true,
        created_at: '2024-02-01T12:00:00Z',
        updated_at: '2024-02-01T12:00:00Z'
      }
    ]

    let filteredArtworks = mockArtworks

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

    console.log(`✅ Gallery API: ${paginatedArtworks.length} artworks encontrados (mock data)`)

    return NextResponse.json({
      success: true,
      data: paginatedArtworks,
      count: paginatedArtworks.length,
      total: filteredArtworks.length
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
