import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PousadaRoomUpdate } from '@/types/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: room, error } = await supabase
      .from('pousada_rooms')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quarto não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar quarto:', error)
      return NextResponse.json({ error: 'Erro ao buscar quarto' }, { status: 500 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Validar tipo de quarto se fornecido
    if (body.type && !['STANDARD', 'DELUXE', 'SUITE'].includes(body.type.toUpperCase())) {
      return NextResponse.json({ 
        error: 'Tipo de quarto deve ser STANDARD, DELUXE ou SUITE' 
      }, { status: 400 })
    }

    const updateData: PousadaRoomUpdate = {}
    
    // Atualizar apenas campos fornecidos
    if (body.name !== undefined) updateData.name = body.name
    if (body.type !== undefined) updateData.type = body.type.toUpperCase()
    if (body.price_refundable !== undefined) updateData.price_refundable = parseFloat(body.price_refundable)
    if (body.price_non_refundable !== undefined) updateData.price_non_refundable = parseFloat(body.price_non_refundable)
    if (body.description !== undefined) updateData.description = body.description
    if (body.amenities !== undefined) updateData.amenities = body.amenities
    if (body.max_guests !== undefined) updateData.max_guests = parseInt(body.max_guests)
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.available !== undefined) updateData.available = body.available
    if (body.size_sqm !== undefined) updateData.size_sqm = body.size_sqm ? parseInt(body.size_sqm) : null

    const { data: room, error } = await supabase
      .from('pousada_rooms')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quarto não encontrado' }, { status: 404 })
      }
      console.error('Erro ao atualizar quarto:', error)
      return NextResponse.json({ error: 'Erro ao atualizar quarto' }, { status: 500 })
    }

    // Log da atividade admin
    await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: user.id,
        action: 'UPDATE_ROOM',
        resource_type: 'pousada_room',
        resource_id: room.id,
        details: { room_name: room.name, updated_fields: Object.keys(updateData) }
      })

    return NextResponse.json(room)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Buscar o quarto antes de deletar para o log
    const { data: roomToDelete } = await supabase
      .from('pousada_rooms')
      .select('name, type')
      .eq('id', params.id)
      .single()

    const { error } = await supabase
      .from('pousada_rooms')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar quarto:', error)
      return NextResponse.json({ error: 'Erro ao deletar quarto' }, { status: 500 })
    }

    // Log da atividade admin
    if (roomToDelete) {
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: user.id,
          action: 'DELETE_ROOM',
          resource_type: 'pousada_room',
          resource_id: params.id,
          details: { room_name: roomToDelete.name, room_type: roomToDelete.type }
        })
    }

    return NextResponse.json({ message: 'Quarto deletado com sucesso' })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}