import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação admin via headers do middleware
    const adminSession = request.headers.get('X-Admin-Session')
    const adminVerified = request.headers.get('X-Admin-Verified')
    
    if (!adminSession || adminSession !== 'true' || !adminVerified) {
      return NextResponse.json(
        { error: 'Access denied - admin authentication required' },
        { status: 401 }
      )
    }

    // Use service role client to bypass RLS issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar parâmetros de query
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const available = searchParams.get('available')
    const search = searchParams.get('search')

    let query = supabase
      .from('pousada_rooms')
      .select('*')
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (type && type !== 'all') {
      query = query.eq('type', type.toUpperCase())
    }

    if (available && available !== 'all') {
      query = query.eq('available', available === 'true')
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: rooms, error } = await query

    if (error) {
      console.error('Erro ao buscar quartos:', error)
      return NextResponse.json({ error: 'Erro ao buscar quartos' }, { status: 500 })
    }

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação admin via headers do middleware
    const adminSession = request.headers.get('X-Admin-Session')
    const adminVerified = request.headers.get('X-Admin-Verified')
    
    if (!adminSession || adminSession !== 'true' || !adminVerified) {
      return NextResponse.json(
        { error: 'Access denied - admin authentication required' },
        { status: 401 }
      )
    }

    // Use service role client to bypass RLS issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    
    // Validar dados obrigatórios
    const { name, type, price_refundable, price_non_refundable, max_guests } = body
    
    if (!name || !type || !price_refundable || !price_non_refundable || !max_guests) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: name, type, price_refundable, price_non_refundable, max_guests' 
      }, { status: 400 })
    }

    // Validar tipo de quarto
    if (!['STANDARD', 'DELUXE', 'SUITE'].includes(type.toUpperCase())) {
      return NextResponse.json({ 
        error: 'Tipo de quarto deve ser STANDARD, DELUXE ou SUITE' 
      }, { status: 400 })
    }

    const roomData = {
      name,
      type: type.toUpperCase(),
      price_refundable: parseFloat(price_refundable),
      price_non_refundable: parseFloat(price_non_refundable),
      description: body.description || null,
      amenities: body.amenities || [],
      max_guests: parseInt(max_guests),
      image_url: body.image_url || null,
      available: body.available !== false
    }

    const { data: room, error } = await supabase
      .from('pousada_rooms')
      .insert(roomData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar quarto:', error)
      return NextResponse.json({ error: 'Erro ao criar quarto' }, { status: 500 })
    }

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}