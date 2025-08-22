import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { formatDate } from '../../lib/utils'

interface CalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  unavailableDates?: string[]
  unavailableTimes?: { [date: string]: string[] }
  minDate?: Date
  maxDate?: Date
  className?: string
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  unavailableDates = [],
  unavailableTimes = {},
  minDate = new Date(),
  maxDate,
  className = ''
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Função para obter os dias do mês
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Dias do mês anterior (para preencher semana)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: true
      })
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      const dateString = formatDate(currentDate)
      const isToday = isDateToday(currentDate)
      const isDisabled = isDateDisabled(currentDate, dateString)
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday,
        isDisabled,
        availability: getDateAvailability(dateString)
      })
    }

    // Dias do próximo mês (para completar semana)
    const remainingSlots = 42 - days.length // 6 semanas x 7 dias
    for (let day = 1; day <= remainingSlots; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: true
      })
    }

    return days
  }

  const isDateToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isDateDisabled = (date: Date, dateString: string) => {
    // Verifica se é menor que a data mínima
    if (minDate && date < minDate) return true
    
    // Verifica se é maior que a data máxima
    if (maxDate && date > maxDate) return true
    
    // Verifica se está na lista de datas indisponíveis
    if (unavailableDates.includes(dateString)) return true
    
    // Verifica se é domingo (fechado)
    if (date.getDay() === 0) return true
    
    return false
  }

  const getDateAvailability = (dateString: string) => {
    const unavailableTimesForDate = unavailableTimes[dateString] || []
    const totalSlots = 12 // Exemplo: 12:00 às 00:00 (12 horários)
    const availableSlots = totalSlots - unavailableTimesForDate.length
    
    if (availableSlots === 0) return 'unavailable'
    if (availableSlots <= 3) return 'limited'
    return 'available'
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'unavailable': return 'bg-red-100 text-red-800'
      case 'limited': return 'bg-yellow-100 text-yellow-800'
      case 'available': return 'bg-green-100 text-green-800'
      default: return ''
    }
  }

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'unavailable': return '❌'
      case 'limited': return '⚠️'
      case 'available': return '✅'
      default: return ''
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const handleDateClick = (day: any) => {
    if (day.isDisabled || !day.isCurrentMonth) return
    onDateSelect(day.date)
  }

  const isDateSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header do Calendário */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h2 className="text-xl font-playfair font-semibold text-madeira-escura">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Dias do Mês */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = isDateSelected(day.date)
          const isHovered = hoveredDate && day.date.toDateString() === hoveredDate.toDateString()
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={day.isDisabled || !day.isCurrentMonth}
              className={`
                relative p-3 text-sm rounded-lg transition-all duration-200 min-h-[48px]
                ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                ${day.isDisabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-amarelo-armazem/20'
                }
                ${isSelected 
                  ? 'bg-amarelo-armazem text-madeira-escura font-bold' 
                  : ''
                }
                ${day.isToday && !isSelected 
                  ? 'bg-blue-100 text-blue-800 font-semibold' 
                  : ''
                }
                ${isHovered && !isSelected 
                  ? 'bg-amarelo-armazem/30' 
                  : ''
                }
                ${day.availability && day.isCurrentMonth && !day.isDisabled
                  ? `border-2 ${getAvailabilityColor(day.availability).includes('red') 
                      ? 'border-red-300' 
                      : getAvailabilityColor(day.availability).includes('yellow')
                        ? 'border-yellow-300'
                        : 'border-green-300'
                    }`
                  : 'border border-gray-200'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <span>{day.date.getDate()}</span>
                {day.availability && day.isCurrentMonth && !day.isDisabled && (
                  <span className="text-xs mt-1">
                    {getAvailabilityIcon(day.availability)}
                  </span>
                )}
              </div>
              
              {/* Tooltip para disponibilidade */}
              {isHovered && day.availability && day.isCurrentMonth && !day.isDisabled && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                  {day.availability === 'available' && 'Muitos horários disponíveis'}
                  {day.availability === 'limited' && 'Poucos horários disponíveis'}
                  {day.availability === 'unavailable' && 'Sem horários disponíveis'}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda:</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-300 rounded-full mr-2"></span>
            <span>✅ Muitos horários</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-300 rounded-full mr-2"></span>
            <span>⚠️ Poucos horários</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-300 rounded-full mr-2"></span>
            <span>❌ Sem horários</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-300 rounded-full mr-2"></span>
            <span>Fechado (Datas indisponíveis)</span>
          </div>
        </div>
      </div>
    </div>
  )
} 