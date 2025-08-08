import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PousadaRoomInsert } from '@/types/database.types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Verificar autenticação admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

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
    const supabase = await createSupabaseServerClient()
    
    // Verificar autenticação admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar role admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

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

    const roomData: PousadaRoomInsert = {
      name,
      type: type.toUpperCase(),
      price_refundable: parseFloat(price_refundable),
      price_non_refundable: parseFloat(price_non_refundable),
      description: body.description || null,
      amenities: body.amenities || [],
      max_guests: parseInt(max_guests),
      image_url: body.image_url || null,
      available: body.available !== false,
      size_sqm: body.size_sqm ? parseInt(body.size_sqm) : null
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

    // Log da atividade admin
    await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: user.id,
        action: 'CREATE_ROOM',
        resource_type: 'pousada_room',
        resource_id: room.id,
        details: { room_name: room.name, room_type: room.type }
      })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}