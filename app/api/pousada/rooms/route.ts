import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🏨 Pousada Rooms API: Iniciando busca de quartos...')

    // Mock data dos quartos da Pousada Armazém São Joaquim
    const mockRooms = [
      {
        id: '1',
        name: 'Suíte Histórica Santa Teresa',
        type: 'suite',
        description: 'Suíte espaçosa com vista panorâmica para o bairro histórico de Santa Teresa. Decoração inspirada na arquitetura colonial brasileira.',
        price_per_night: 280.00,
        max_guests: 2,
        amenities: ['Wi-Fi', 'Ar condicionado', 'TV', 'Frigobar', 'Vista panorâmica', 'Varanda'],
        images: ['/images/rooms/suite-historica-1.jpg', '/images/rooms/suite-historica-2.jpg'],
        available: true,
        size_sqm: 35,
        bed_type: 'King size',
        bathroom_type: 'Privativo',
        historical_context: 'Quarto localizado na parte histórica do prédio, preservando elementos originais do século XIX',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        name: 'Quarto Colonial',
        type: 'standard',
        description: 'Quarto aconchegante com decoração que remete ao período colonial. Ideal para quem busca conforto e história.',
        price_per_night: 180.00,
        max_guests: 2,
        amenities: ['Wi-Fi', 'Ventilador de teto', 'TV', 'Armário vintage'],
        images: ['/images/rooms/colonial-1.jpg', '/images/rooms/colonial-2.jpg'],
        available: true,
        size_sqm: 25,
        bed_type: 'Queen size',
        bathroom_type: 'Privativo',
        historical_context: 'Quarto decorado com móveis e objetos que remetem ao período colonial brasileiro',
        created_at: '2024-01-02T10:00:00Z',
        updated_at: '2024-01-02T10:00:00Z'
      },
      {
        id: '3',
        name: 'Quarto do Bondinho',
        type: 'standard',
        description: 'Quarto temático com vista direta para a linha do bondinho. Perfeito para admirar o vai e vem do transporte histórico.',
        price_per_night: 200.00,
        max_guests: 2,
        amenities: ['Wi-Fi', 'Ar condicionado', 'TV', 'Vista para o bondinho'],
        images: ['/images/rooms/bondinho-1.jpg', '/images/rooms/bondinho-2.jpg'],
        available: true,
        size_sqm: 28,
        bed_type: 'Queen size',
        bathroom_type: 'Privativo',
        historical_context: 'Localização privilegiada com vista para a linha histórica do bondinho de Santa Teresa',
        created_at: '2024-01-03T10:00:00Z',
        updated_at: '2024-01-03T10:00:00Z'
      },
      {
        id: '4',
        name: 'Suíte do Armazém',
        type: 'suite',
        description: 'Suíte premium que ocupa parte do antigo armazém. Ambiente amplo com pé-direito alto e elementos históricos preservados.',
        price_per_night: 350.00,
        max_guests: 4,
        amenities: ['Wi-Fi', 'Ar condicionado', 'TV Smart', 'Frigobar', 'Varanda privativa', 'Banheira'],
        images: ['/images/rooms/suite-armazem-1.jpg', '/images/rooms/suite-armazem-2.jpg'],
        available: true,
        size_sqm: 45,
        bed_type: 'King size + sofá-cama',
        bathroom_type: 'Privativo com banheira',
        historical_context: 'Antiga área de estoque do armazém, convertida em suíte de luxo mantendo vigas e tijolos originais',
        created_at: '2024-01-04T10:00:00Z',
        updated_at: '2024-01-04T10:00:00Z'
      },
      {
        id: '5',
        name: 'Quarto dos Azulejos',
        type: 'standard',
        description: 'Quarto decorado com azulejos portugueses originais encontrados durante a restauração do edifício.',
        price_per_night: 220.00,
        max_guests: 2,
        amenities: ['Wi-Fi', 'Ventilador de teto', 'TV', 'Azulejos históricos'],
        images: ['/images/rooms/azulejos-1.jpg', '/images/rooms/azulejos-2.jpg'],
        available: true,
        size_sqm: 30,
        bed_type: 'Queen size',
        bathroom_type: 'Privativo com azulejos portugueses',
        historical_context: 'Azulejos portugueses originais do século XIX, descobertos e restaurados durante a reforma',
        created_at: '2024-01-05T10:00:00Z',
        updated_at: '2024-01-05T10:00:00Z'
      }
    ]

    const { searchParams } = new URL(request.url)
    const roomType = searchParams.get('type')
    const maxGuests = searchParams.get('max_guests')
    const maxPrice = searchParams.get('max_price')
    
    let filteredRooms = mockRooms

    // Filtros
    if (roomType && roomType !== 'all') {
      filteredRooms = filteredRooms.filter(room => 
        room.type.toLowerCase() === roomType.toLowerCase()
      )
    }

    if (maxGuests) {
      filteredRooms = filteredRooms.filter(room => 
        room.max_guests >= parseInt(maxGuests)
      )
    }

    if (maxPrice) {
      filteredRooms = filteredRooms.filter(room => 
        room.price_per_night <= parseFloat(maxPrice)
      )
    }

    console.log(`✅ Pousada Rooms API: ${filteredRooms.length} quartos encontrados (mock data)`)

    return NextResponse.json({
      success: true,
      data: filteredRooms,
      count: filteredRooms.length,
      total: mockRooms.length
    })
  } catch (error) {
    console.error('💥 Erro na API de quartos da pousada:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}