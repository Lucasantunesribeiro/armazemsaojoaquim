import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Aceitar tanto português quanto inglês para compatibilidade
    const { 
      data: dataParam, 
      horario: horarioParam, 
      date: dateParam, 
      time: timeParam, 
      guests = 1 
    } = body

    // Usar os parâmetros em português se disponíveis, senão usar inglês
    const data = dataParam || dateParam
    const horario = horarioParam || timeParam

    if (!data || !horario) {
      return NextResponse.json({ 
        error: 'Data e horário são obrigatórios',
        details: 'Parâmetros esperados: data/date e horario/time'
      }, { status: 400 })
    }

    // Verificar reservas confirmadas para a data e horário
    const { data: reservasConfirmadas, error } = await supabase
      .from('reservas')
      .select('pessoas, observacoes')
      .eq('data', data)
      .eq('horario', horario)
      .eq('status', 'confirmada')

    if (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      return NextResponse.json({ 
        error: 'Erro ao verificar disponibilidade',
        details: error.message
      }, { status: 500 })
    }

    // Calcular total de pessoas já reservadas
    const totalPessoasReservadas = reservasConfirmadas?.reduce((total, reserva) => {
      return total + (reserva.pessoas || 0)
    }, 0) || 0

    // Capacidade máxima do restaurante (pode ser configurável)
    const capacidadeMaxima = 40 // Ajustar conforme necessário

    const available = totalPessoasReservadas + guests <= capacidadeMaxima
    const remainingCapacity = capacidadeMaxima - totalPessoasReservadas

    return NextResponse.json({
      available,
      totalReserved: totalPessoasReservadas,
      remainingCapacity,
      maxCapacity: capacidadeMaxima,
      message: available 
        ? `Horário disponível! Ainda há espaço para ${remainingCapacity} pessoas.`
        : 'Horário já reservado! Este horário não possui mais vagas disponíveis.',
      reservations: reservasConfirmadas?.length || 0
    })

  } catch (error) {
    console.error('Erro na verificação de disponibilidade:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: 'Use POST para verificar disponibilidade' 
  }, { status: 405 })
} 