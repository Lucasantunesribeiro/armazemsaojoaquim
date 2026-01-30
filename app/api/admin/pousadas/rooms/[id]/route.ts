import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação admin via headers do middleware OU Authorization header
    const adminSession = request.headers.get('X-Admin-Session')
    const adminVerified = request.headers.get('X-Admin-Verified')
    const authHeader = request.headers.get('authorization')

    if ((!adminSession || adminSession !== 'true' || !adminVerified) && !authHeader?.startsWith('Bearer ')) {
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
    // Verificar autenticação admin via headers do middleware OU Authorization header
    const adminSession = request.headers.get('X-Admin-Session')
    const adminVerified = request.headers.get('X-Admin-Verified')
    const authHeader = request.headers.get('authorization')

    if ((!adminSession || adminSession !== 'true' || !adminVerified) && !authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Access denied - admin authentication required' },
        { status: 401 }
      )
    }

    // Environment Check
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ API ROOM UPDATE: Variáveis de ambiente faltando')
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await request.json()
    console.log('📝 API ROOM UPDATE: Recebido:', body)

    // Validar tipo de quarto se fornecido
    if (body.type && !['STANDARD', 'DELUXE', 'SUITE'].includes(body.type.toUpperCase())) {
      return NextResponse.json({
        error: 'Tipo de quarto deve ser STANDARD, DELUXE ou SUITE'
      }, { status: 400 })
    }

    const updateData: any = {}

    // Helper para parsing seguro de números
    const safeParseFloat = (val: any) => {
      const num = parseFloat(val)
      return isNaN(num) ? null : num
    }
    const safeParseInt = (val: any) => {
      const num = parseInt(val)
      return isNaN(num) ? null : num
    }

    // Atualizar apenas campos fornecidos
    if (body.name !== undefined) updateData.name = body.name
    if (body.type !== undefined) updateData.type = body.type.toUpperCase()
    if (body.price_refundable !== undefined) updateData.price_refundable = safeParseFloat(body.price_refundable)
    if (body.price_non_refundable !== undefined) updateData.price_non_refundable = safeParseFloat(body.price_non_refundable)
    if (body.description !== undefined) updateData.description = body.description
    if (body.amenities !== undefined) updateData.amenities = body.amenities
    if (body.max_guests !== undefined) updateData.max_guests = safeParseInt(body.max_guests)
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.available !== undefined) updateData.available = body.available
    // if (body.size_sqm !== undefined) updateData.size_sqm = body.size_sqm ? safeParseInt(body.size_sqm) : null // Column missing in DB

    console.log('🔄 API ROOM UPDATE: Atualizando dados:', updateData)

    const { data: room, error } = await supabase
      .from('pousada_rooms')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('❌ API ROOM UPDATE: Erro no banco:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quarto não encontrado' }, { status: 404 })
      }
      return NextResponse.json({ error: `Erro ao atualizar quarto: ${error.message}` }, { status: 500 })
    }

    console.log('✅ API ROOM UPDATE: Sucesso:', room.id)
    return NextResponse.json(room)
  } catch (error: any) {
    console.error('❌ API ROOM UPDATE: Erro interno:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação admin via headers do middleware OU Authorization header
    const adminSession = request.headers.get('X-Admin-Session')
    const adminVerified = request.headers.get('X-Admin-Verified')
    const authHeader = request.headers.get('authorization')

    if ((!adminSession || adminSession !== 'true' || !adminVerified) && !authHeader?.startsWith('Bearer ')) {
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

    // Log da atividade admin removido - usando service role

    return NextResponse.json({ message: 'Quarto deletado com sucesso' })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}