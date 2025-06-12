import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de confirmação obrigatório' },
        { status: 400 }
      )
    }

    // Buscar reserva pelo código de confirmação
    const { data: reserva, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('codigo_confirmacao', token)
      .eq('status', 'pendente')
      .single()

    if (error || !reserva) {
      return NextResponse.json(
        { error: 'Reserva não encontrada ou já processada' },
        { status: 404 }
      )
    }

    // Verificar se a reserva ainda está dentro do prazo (24h)
    const reservaCreatedAt = new Date(reserva.created_at)
    const now = new Date()
    const hoursDiff = (now.getTime() - reservaCreatedAt.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      // Cancelar reserva por expiração
      await supabase
        .from('reservas')
        .update({
          status: 'cancelada',
          motivo_cancelamento: 'Expiração do prazo de confirmação (24h)',
          cancelado_em: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reserva.id)

      return NextResponse.json(
        { error: 'Reserva expirada. O prazo de confirmação era de 24 horas.' },
        { status: 410 }
      )
    }

    // Confirmar a reserva
    const { error: updateError } = await supabase
      .from('reservas')
      .update({
        status: 'confirmada',
        confirmado_em: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reserva.id)

    if (updateError) {
      throw updateError
    }

    // Enviar e-mail de notificação para o restaurante
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reservation_confirmed',
          reservationData: {
            id: reserva.id,
            data: reserva.data,
            horario: reserva.horario,
            pessoas: reserva.pessoas,
            observacoes: reserva.observacoes,
            telefone_confirmacao: reserva.telefone_confirmacao,
            nome: reserva.user_id || 'Cliente sem cadastro'
          }
        })
      })
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de notificação:', emailError)
    }

    // Redirecionar para página de sucesso
    return NextResponse.redirect(
      new URL('/reservas?confirmed=true', request.url)
    )

  } catch (error) {
    console.error('Erro ao confirmar reserva:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Para cancelar reservas não confirmadas após 24h
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'cancel_expired') {
      // Buscar reservas pendentes há mais de 24 horas
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const { data: expiredReservations, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('status', 'pendente')
        .lte('created_at', twentyFourHoursAgo.toISOString())

      if (error) {
        console.error('Erro ao buscar reservas expiradas:', error)
        return NextResponse.json({ error: 'Erro ao buscar reservas' }, { status: 500 })
      }

      if (expiredReservations && expiredReservations.length > 0) {
        // Cancelar reservas expiradas
        const { error: cancelError } = await supabase
          .from('reservas')
          .update({ status: 'cancelada' })
          .in('id', expiredReservations.map(r => r.id))

        if (cancelError) {
          console.error('Erro ao cancelar reservas:', cancelError)
          return NextResponse.json({ error: 'Erro ao cancelar reservas' }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true, 
          cancelled: expiredReservations.length,
          message: `${expiredReservations.length} reserva(s) cancelada(s) automaticamente` 
        })
      }

      return NextResponse.json({ 
        success: true, 
        cancelled: 0,
        message: 'Nenhuma reserva expirada encontrada' 
      })
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 })

  } catch (error) {
    console.error('Erro no processamento:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 