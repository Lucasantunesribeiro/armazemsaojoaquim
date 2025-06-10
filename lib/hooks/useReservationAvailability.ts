import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

// Função simples para formatar data
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

interface TimeSlot {
  time: string
  available: boolean
  reservationCount: number
}

interface DateAvailability {
  date: string
  timeSlots: TimeSlot[]
  isFullyBooked: boolean
}

export function useReservationAvailability() {
  const [availability, setAvailability] = useState<DateAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Horários de funcionamento (segunda a sábado)
  const businessHours = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30'
  ]

  // Capacidade máxima por horário (ajustar conforme necessário)
  const maxReservationsPerSlot = 8

  const fetchAvailability = async (startDate: Date, endDate: Date) => {
    setLoading(true)
    setError(null)

    try {
      // Buscar todas as reservas confirmadas no período
      const { data: reservations, error: reservationError } = await supabase
        .from('reservas')
        .select('data, horario, pessoas, status')
        .eq('status', 'confirmada')
        .gte('data', formatDate(startDate))
        .lte('data', formatDate(endDate))

      if (reservationError) {
        throw new Error(`Erro ao buscar reservas: ${reservationError.message}`)
      }

      // Processar disponibilidade por data
      const availabilityData: DateAvailability[] = []
      const currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        const dateString = formatDate(currentDate)
        const dayOfWeek = currentDate.getDay()

        // Verificar se não é domingo (fechado)
        if (dayOfWeek === 0) {
          currentDate.setDate(currentDate.getDate() + 1)
          continue
        }

        // Contar reservas por horário para esta data
        const reservationsForDate = reservations?.filter(
          (res: any) => res.data === dateString
        ) || []

        const timeSlots: TimeSlot[] = businessHours.map(time => {
          const reservationsAtTime = reservationsForDate.filter(
            (res: any) => res.horario === time
          )

          const totalPeople = reservationsAtTime.reduce(
            (sum: number, res: any) => sum + res.pessoas, 0
          )

          const available = totalPeople < maxReservationsPerSlot

          return {
            time,
            available,
            reservationCount: reservationsAtTime.length
          }
        })

        const isFullyBooked = timeSlots.every(slot => !slot.available)

        availabilityData.push({
          date: dateString,
          timeSlots,
          isFullyBooked
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      setAvailability(availabilityData)
    } catch (err: any) {
      console.error('Erro ao buscar disponibilidade:', err)
      setError(err.message || 'Erro ao carregar disponibilidade')
    } finally {
      setLoading(false)
    }
  }

  const getAvailabilityForDate = (date: string): DateAvailability | null => {
    return availability.find(item => item.date === date) || null
  }

  const getAvailableTimesForDate = (date: string): string[] => {
    const dateAvailability = getAvailabilityForDate(date)
    if (!dateAvailability) return []

    return dateAvailability.timeSlots
      .filter(slot => slot.available)
      .map(slot => slot.time)
  }

  const getUnavailableTimesForDate = (date: string): string[] => {
    const dateAvailability = getAvailabilityForDate(date)
    if (!dateAvailability) return []

    return dateAvailability.timeSlots
      .filter(slot => !slot.available)
      .map(slot => slot.time)
  }

  const isDateFullyBooked = (date: string): boolean => {
    const dateAvailability = getAvailabilityForDate(date)
    return dateAvailability?.isFullyBooked || false
  }

  const checkSpecificTimeAvailability = async (
    date: string, 
    time: string, 
    guests: number
  ): Promise<{ available: boolean; reason?: string }> => {
    try {
      // Verificar se é domingo
      const reservationDate = new Date(date)
      if (reservationDate.getDay() === 0) {
        return { available: false, reason: 'Restaurante fechado aos domingos' }
      }

      // Verificar se o horário está nos horários de funcionamento
      if (!businessHours.includes(time)) {
        return { available: false, reason: 'Horário fora do funcionamento' }
      }

      // Buscar reservas existentes para esta data e horário
      const { data: existingReservations, error } = await supabase
        .from('reservas')
        .select('pessoas')
        .eq('data', date)
        .eq('horario', time)
        .eq('status', 'confirmada')

      if (error) {
        throw new Error(`Erro ao verificar disponibilidade: ${error.message}`)
      }

      const totalPeopleAtTime = existingReservations?.reduce(
        (sum: number, res: any) => sum + res.pessoas, 0
      ) || 0

      const availableCapacity = maxReservationsPerSlot - totalPeopleAtTime

      if (guests > availableCapacity) {
        return { 
          available: false, 
          reason: `Capacidade insuficiente. Disponível para ${availableCapacity} pessoas.`
        }
      }

      return { available: true }
    } catch (err: any) {
      console.error('Erro ao verificar disponibilidade específica:', err)
      return { available: false, reason: 'Erro ao verificar disponibilidade' }
    }
  }

  const getNextAvailableDate = (): Date | null => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const dateAvailability of availability) {
      const date = new Date(dateAvailability.date)
      if (date >= today && !dateAvailability.isFullyBooked) {
        return date
      }
    }

    return null
  }

  // Função para recarregar disponibilidade
  const refreshAvailability = (startDate?: Date, endDate?: Date) => {
    const start = startDate || new Date()
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    fetchAvailability(start, end)
  }

  return {
    availability,
    loading,
    error,
    fetchAvailability,
    getAvailabilityForDate,
    getAvailableTimesForDate,
    getUnavailableTimesForDate,
    isDateFullyBooked,
    checkSpecificTimeAvailability,
    getNextAvailableDate,
    refreshAvailability
  }
} 