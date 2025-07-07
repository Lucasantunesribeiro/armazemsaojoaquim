'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Database } from '@/types/database.types'

type Reserva = Database['public']['Tables']['reservas']['Row']

export default function ReservasManagementPage() {
  const { supabase } = useSupabase()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'todas' | 'pendente' | 'confirmada' | 'cancelada'>('todas')

  useEffect(() => {
    fetchReservas()
  }, [filter])

  const fetchReservas = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('reservas')
        .select(`
          *,
          profiles!user_id (
            id,
            name,
            email,
            phone
          )
        `)
        .order('data', { ascending: false })
        .order('horario', { ascending: false })

      // Aplicar filtro de status
      if (filter !== 'todas') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setReservas(data || [])
    } catch (err) {
      console.error('Error fetching reservas:', err)
      setError('Erro ao carregar reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reservaId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() }
      
      if (newStatus === 'confirmada') {
        updateData.confirmado_em = new Date().toISOString()
      } else if (newStatus === 'cancelada') {
        updateData.cancelado_em = new Date().toISOString()
      }

      const { error } = await supabase
        .from('reservas')
        .update(updateData)
        .eq('id', reservaId)

      if (error) throw error

      await fetchReservas()
      alert(`Reserva ${newStatus} com sucesso!`)
    } catch (err) {
      console.error('Error updating reserva:', err)
      alert('Erro ao atualizar reserva')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelada':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'concluida':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: reservas.length,
    pendentes: reservas.filter(r => r.status === 'pendente').length,
    confirmadas: reservas.filter(r => r.status === 'confirmada').length,
    canceladas: reservas.filter(r => r.status === 'cancelada').length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Carregando reservas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchReservas}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gerenciar Reservas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie as reservas do restaurante
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-yellow-600">Pendentes</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendentes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-green-600">Confirmadas</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmadas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-red-600">Canceladas</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.canceladas}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {(['todas', 'pendente', 'confirmada', 'cancelada'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-2 px-4 border-b-2 font-medium text-sm capitalize ${
                  filter === status
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {status === 'todas' ? 'Todas' : status}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pessoas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Observações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reservas.map((reserva) => {
                const profile = (reserva as any).profiles
                return (
                  <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(reserva.data)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {reserva.horario}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile?.name || 'Cliente não identificado'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {profile?.email || ''}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {reserva.telefone_confirmacao || profile?.phone || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reserva.pessoas} {reserva.pessoas === 1 ? 'pessoa' : 'pessoas'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reserva.status)}`}>
                        {reserva.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {reserva.observacoes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={reserva.status}
                        onChange={(e) => handleStatusChange(reserva.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="concluida">Concluída</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {reservas.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhuma reserva encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filter !== 'todas' ? `Não há reservas com status "${filter}".` : 'Ainda não há reservas cadastradas.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 