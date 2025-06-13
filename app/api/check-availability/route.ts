import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface AvailabilityRequest {
  date: string
  time: string
  guests: number
}

export async function POST(request: NextRequest) {
  try {
    const { date, time, guests }: AvailabilityRequest = await request.json()

    // Validar dados básicos
    if (!date || !time || !guests) {
      return NextResponse.json(
        { error: 'Date, time, and guests are required' },
        { status: 400 }
      )
    }

    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validar formato do horário
    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM' },
        { status: 400 }
      )
    }

    // Validar número de convidados
    if (guests < 1 || guests > 20) {
      return NextResponse.json(
        { error: 'Number of guests must be between 1 and 20' },
        { status: 400 }
      )
    }

    // Verificar se as variáveis de ambiente estão configuradas
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Criar timestamp da reserva solicitada
    const requestedDateTime = new Date(`${date}T${time}`)
    const now = new Date()

    // Verificar se a data/hora é no futuro
    if (requestedDateTime <= now) {
      return NextResponse.json({
        available: false,
        message: 'Data e horário devem ser no futuro'
      })
    }

    // Verificar se é um dia da semana e horário de funcionamento
    const dayOfWeek = requestedDateTime.getDay() // 0 = domingo, 6 = sábado
    const hour = parseInt(time.split(':')[0])
    
    // Horários de funcionamento: Terça a Domingo, 18h às 23h
    if (dayOfWeek === 1) { // Segunda-feira fechado
      return NextResponse.json({
        available: false,
        message: 'Restaurante fechado às segundas-feiras'
      })
    }

    if (hour < 18 || hour >= 23) {
      return NextResponse.json({
        available: false,
        message: 'Horário de funcionamento: 18h às 23h'
      })
    }

    // Verificar reservas existentes para o mesmo horário (usando nome correto da tabela)
    const { data: existingReservations, error } = await supabase
      .from('reservas') // Nome correto da tabela
      .select('pessoas')
      .eq('data', date)
      .eq('horario', time)
      .neq('status', 'cancelada') // Não contar reservas canceladas

    if (error) {
      console.error('Database error:', error)
      
      // Se houver erro no banco, assumir disponibilidade limitada
      return NextResponse.json({
        available: true,
        message: 'Verificação de disponibilidade limitada. Entre em contato para confirmar.',
        remainingCapacity: 50,
        requestedPeople: guests,
        totalReserved: 0,
        fallback: true
      })
    }

    // Calcular pessoas já reservadas neste horário
    const totalPeopleReserved = existingReservations?.reduce(
      (total, reservation) => total + (reservation.pessoas || 0), 
      0
    ) || 0

    // Configurações do restaurante
    const MAX_CAPACITY = 100 // Capacidade máxima do restaurante
    const MAX_PEOPLE_PER_RESERVATION = 12 // Máximo de pessoas por reserva

    // Verificar se excede o limite de pessoas por reserva
    if (guests > MAX_PEOPLE_PER_RESERVATION) {
      return NextResponse.json({
        available: false,
        message: `Máximo de ${MAX_PEOPLE_PER_RESERVATION} pessoas por reserva`
      })
    }

    // Verificar disponibilidade baseada na capacidade
    const remainingCapacity = MAX_CAPACITY - totalPeopleReserved
    const available = remainingCapacity >= guests

    return NextResponse.json({
      available,
      message: available 
        ? 'Horário disponível' 
        : `Capacidade insuficiente. Disponível para ${remainingCapacity} pessoas`,
      remainingCapacity,
      requestedPeople: guests,
      totalReserved: totalPeopleReserved
    })

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Availability check endpoint is working',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  })
} 