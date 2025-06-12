import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

// Função simples para formatar data
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

interface TimeSlot {
  time: string
  available: boolean
  remainingCapacity: number
  totalReserved: number
}

interface AvailabilityResponse {
  available: boolean
  totalReserved: number
  remainingCapacity: number
  maxCapacity: number
  message: string
  reservations: number
}

export function useReservationAvailability(selectedDate?: string) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const businessHours = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30'
  ]

  // Verificar se uma data específica e horário estão disponíveis
  const checkAvailability = async (date: string, time: string, guests: number = 1): Promise<AvailabilityResponse> => {
    try {
      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: date,
          horario: time,
          guests: guests
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao verificar disponibilidade')
      }

      return await response.json()
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err)
      throw err
    }
  }

  // Verificar disponibilidade para todos os horários de uma data
  const loadAvailabilityForDate = async (date: string) => {
    if (!date) return

    setLoading(true)
    setError(null)

    try {
      // Buscar todas as reservas confirmadas para a data
      const { data: reservas, error: reservasError } = await supabase
        .from('reservas')
        .select('horario, pessoas')
        .eq('data', date)
        .eq('status', 'confirmada')

      if (reservasError) {
        throw reservasError
      }

      // Agrupar reservas por horário
      const reservasPorHorario = (reservas || []).reduce((acc, reserva) => {
        const time = reserva.horario
        if (!acc[time]) {
          acc[time] = 0
        }
        acc[time] += reserva.pessoas || 0
        return acc
      }, {} as Record<string, number>)

      // Capacidade máxima por horário
      const maxCapacity = 40

      // Criar slots de tempo com disponibilidade
      const slots: TimeSlot[] = businessHours.map(time => {
        const totalReserved = reservasPorHorario[time] || 0
        const remainingCapacity = maxCapacity - totalReserved
        
        return {
          time,
          available: remainingCapacity > 0,
          remainingCapacity: Math.max(0, remainingCapacity),
          totalReserved
        }
      })

      setTimeSlots(slots)

    } catch (err) {
      console.error('Erro ao carregar disponibilidade:', err)
      setError('Erro ao verificar disponibilidade dos horários')
    } finally {
      setLoading(false)
    }
  }

  // Carregar disponibilidade quando a data muda
  useEffect(() => {
    if (selectedDate) {
      loadAvailabilityForDate(selectedDate)
    }
  }, [selectedDate])

  // Verificar se um horário está disponível (função auxiliar)
  const isTimeAvailable = (time: string, requiredCapacity: number = 1): boolean => {
    const slot = timeSlots.find(slot => slot.time === time)
    return slot ? slot.remainingCapacity >= requiredCapacity : false
  }

  // Obter slot específico
  const getTimeSlot = (time: string): TimeSlot | undefined => {
    return timeSlots.find(slot => slot.time === time)
  }

  // Obter próximos horários disponíveis
  const getNextAvailableSlots = (count: number = 5): TimeSlot[] => {
    return timeSlots
      .filter(slot => slot.available)
      .slice(0, count)
  }

  // Obter horários com pouca disponibilidade (alerta)
  const getLimitedAvailabilitySlots = (): TimeSlot[] => {
    return timeSlots.filter(slot => 
      slot.available && slot.remainingCapacity <= 10 && slot.remainingCapacity > 0
    )
  }

  // Obter horários esgotados
  const getUnavailableSlots = (): TimeSlot[] => {
    return timeSlots.filter(slot => !slot.available)
  }

  // Verificar se é domingo (fechado)
  const isSunday = (date: string): boolean => {
    const day = new Date(date + 'T00:00:00').getDay()
    return day === 0 // 0 = domingo
  }

  // Verificar se é um dia útil (segunda a sábado)
  const isBusinessDay = (date: string): boolean => {
    return !isSunday(date)
  }

  // Formatar horário para exibição
  const formatTimeSlot = (slot: TimeSlot): string => {
    if (!slot.available) {
      return `${slot.time} - Esgotado`
    }
    if (slot.remainingCapacity <= 10) {
      return `${slot.time} - ${slot.remainingCapacity} vagas restantes`
    }
    return `${slot.time} - Disponível`
  }

  return {
    timeSlots,
    loading,
    error,
    checkAvailability,
    loadAvailabilityForDate,
    isTimeAvailable,
    getTimeSlot,
    getNextAvailableSlots,
    getLimitedAvailabilitySlots,
    getUnavailableSlots,
    isSunday,
    isBusinessDay,
    formatTimeSlot,
    businessHours
  }
} 