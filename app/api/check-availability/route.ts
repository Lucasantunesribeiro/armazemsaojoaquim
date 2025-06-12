import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface AvailabilityRequest {
  date: string
  time: string
  people: number
}

export async function POST(request: NextRequest) {
  try {
    const { date, time, people }: AvailabilityRequest = await request.json()

    // Validar dados básicos
    if (!date || !time || !people) {
      return NextResponse.json(
        { error: 'Date, time, and people are required' },
        { status: 400 }
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

    // Verificar reservas existentes para o mesmo horário
    const { data: existingReservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', date)
      .eq('time', time)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Erro ao verificar disponibilidade' },
        { status: 500 }
      )
    }

    // Calcular pessoas já reservadas neste horário
    const totalPeopleReserved = existingReservations?.reduce(
      (total, reservation) => total + (reservation.people || 0), 
      0
    ) || 0

    // Configurações do restaurante (você pode mover isso para uma tabela de configurações)
    const MAX_CAPACITY = 100 // Capacidade máxima do restaurante
    const MAX_PEOPLE_PER_RESERVATION = 12 // Máximo de pessoas por reserva

    // Verificar se excede o limite de pessoas por reserva
    if (people > MAX_PEOPLE_PER_RESERVATION) {
      return NextResponse.json({
        available: false,
        message: `Máximo de ${MAX_PEOPLE_PER_RESERVATION} pessoas por reserva`
      })
    }

    // Verificar disponibilidade baseada na capacidade
    const remainingCapacity = MAX_CAPACITY - totalPeopleReserved
    const available = remainingCapacity >= people

    return NextResponse.json({
      available,
      message: available 
        ? 'Horário disponível' 
        : `Capacidade insuficiente. Disponível para ${remainingCapacity} pessoas`,
      remainingCapacity,
      requestedPeople: people
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
    timestamp: new Date().toISOString()
  })
} 