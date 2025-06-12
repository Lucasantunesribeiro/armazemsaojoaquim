'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '../../components/providers/SupabaseProvider'

export interface UserReservation {
  id: string
  data: string
  horario: string
  pessoas: number
  status: string
  observacoes: string | null
  created_at: string
}

export const useUserReservations = () => {
  const [userReservations, setUserReservations] = useState<UserReservation[]>([])
  const [isLoadingReservations, setIsLoadingReservations] = useState(false)
  const { user, loading, supabase } = useSupabase()

  const fetchUserReservations = useCallback(async () => {
    if (!user || loading) return
    
    setIsLoadingReservations(true)
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: true })
        .limit(5)

      if (error) {
        console.error('Erro ao buscar reservas:', error)
      } else {
        setUserReservations(data || [])
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar reservas:', error)
    } finally {
      setIsLoadingReservations(false)
    }
  }, [user, loading, supabase])

  useEffect(() => {
    if (user && !loading) {
      fetchUserReservations()
    } else {
      setUserReservations([])
    }
  }, [user, loading, fetchUserReservations])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'cancelada': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmada': return 'Confirmada'
      case 'pendente': return 'Pendente'
      case 'cancelada': return 'Cancelada'
      default: return status
    }
  }

  return {
    userReservations,
    isLoadingReservations,
    formatDate,
    getStatusColor,
    getStatusText,
    refetchReservations: fetchUserReservations
  }
} 