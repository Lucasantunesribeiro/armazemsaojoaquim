import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 }
  }

  const token = authHeader.substring(7)
  const { data: { user } } = await supabaseAuth.auth.getUser(token)
  
  if (!user) {
    return { error: 'Invalid token', status: 401 }
  }

  if (user.email !== 'armazemsaojoaquimoficial@gmail.com') {
    return { error: 'Admin required', status: 403 }
  }

  return { user }
}

// PUT - Atualizar status da reserva
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📅 API Reservas: Atualizando reserva:', params.id)
    
    const auth = await checkAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    console.log('📅 API Reservas: Dados para atualização:', body)

    const updateData: any = {
      status: body.status,
      updated_at: new Date().toISOString()
    }

    // Se estiver confirmando, adicionar data de confirmação
    if (body.status === 'confirmada') {
      updateData.confirmado_em = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('❌ API Reservas: Erro ao atualizar:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Reservas: Reserva atualizada:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API Reservas: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE - Cancelar/excluir reserva
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📅 API Reservas: Cancelando reserva:', params.id)
    
    const auth = await checkAuth(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { error } = await supabaseAdmin
      .from('reservations')
      .update({
        status: 'cancelada',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('❌ API Reservas: Erro ao cancelar:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Reservas: Reserva cancelada com sucesso')
    return NextResponse.json({ message: 'Reserva cancelada com sucesso' })
  } catch (error) {
    console.error('❌ API Reservas: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}