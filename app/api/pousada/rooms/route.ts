import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🏨 Pousada Rooms API: Iniciando busca de quartos...')

    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const roomType = searchParams.get('type')
    const maxGuests = searchParams.get('max_guests')
    const maxPrice = searchParams.get('max_price')
    
    // Construir query base
    let query = supabase
      .from('pousada_rooms')
      .select('*')
      .order('type', { ascending: true })

    // Aplicar filtros
    if (roomType && roomType !== 'all') {
      query = query.eq('type', roomType.toUpperCase())
    }

    if (maxGuests) {
      query = query.gte('max_guests', parseInt(maxGuests))
    }

    if (maxPrice) {
      query = query.lte('price_non_refundable', parseFloat(maxPrice))
    }

    const { data: rooms, error } = await query

    if (error) {
      console.error('❌ Pousada Rooms API: Erro ao buscar quartos:', error)
      return NextResponse.json(
        { error: 'Erro ao carregar quartos', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Pousada Rooms API: ${rooms?.length || 0} quartos encontrados`)

    return NextResponse.json({
      success: true,
      data: rooms || [],
      count: rooms?.length || 0,
      total: rooms?.length || 0
    })
  } catch (error) {
    console.error('💥 Erro na API de quartos da pousada:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
