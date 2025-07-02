import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  try {
    // Se for string, garantir que não haja conversão de timezone
    let dateObj: Date
    
    if (typeof date === 'string') {
      // Verificar se a string não está vazia ou inválida
      if (!date || date === 'null' || date === 'undefined') {
        return 'Data não disponível'
      }
      
      // Tentar diferentes formatos de data
      if (date.includes('T')) {
        dateObj = new Date(date)
      } else {
        dateObj = new Date(date + 'T00:00:00')
      }
    } else {
      dateObj = date
    }
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida'
    }
    
    return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch (error) {
    console.error('Erro ao formatar data:', error, 'Data original:', date)
    return 'Erro na formatação da data'
  }
}

export function formatTime(time: string): string {
  return time
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/
  return phoneRegex.test(phone)
}