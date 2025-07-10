'use client'

import { useState, useEffect } from 'react'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { Calendar, Clock, Users, Mail, Phone, CheckCircle, AlertCircle, X } from 'lucide-react'

interface Reservation {
  id: string
  nome: string
  email: string
  telefone: string
  data: string
  horario: string
  pessoas: number
  observacoes?: string
  status: 'pendente' | 'confirmada' | 'cancelada'
  created_at: string
  confirmado_em?: string
}

export default function AdminReservas() {
  const { adminFetch } = useAdminApi()
  const [reservas, setReservas] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'today'>('all')

  useEffect(() => {
    loadReservas()
  }, [adminFetch])

  const loadReservas = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('📅 Reservas: Carregando lista...')
      const data = await adminFetch('/api/admin/reservas')
      
      console.log('✅ Reservas: Dados carregados:', data.length, 'reservas')
      setReservas(data)
    } catch (error) {
      console.error('❌ Reservas: Erro ao carregar:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar reservas')
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      console.log('📅 Reservas: Atualizando status:', id, 'para', status)
      await adminFetch(`/api/admin/reservas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      loadReservas() // Recarregar lista
    } catch (error) {
      console.error('❌ Reservas: Erro ao atualizar status:', error)
      setError(error instanceof Error ? error.message : 'Erro ao atualizar status')
    }
  }

  const cancelReservation = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return
    
    try {
      console.log('📅 Reservas: Cancelando reserva:', id)
      await adminFetch(`/api/admin/reservas/${id}`, { method: 'DELETE' })
      loadReservas() // Recarregar lista
    } catch (error) {
      console.error('❌ Reservas: Erro ao cancelar reserva:', error)
      setError(error instanceof Error ? error.message : 'Erro ao cancelar reserva')
    }
  }

  const filteredReservas = reservas.filter(reserva => {
    const today = new Date().toISOString().split('T')[0]
    
    switch (filter) {
      case 'active':
        return reserva.status === 'confirmada' || reserva.status === 'pendente'
      case 'today':
        return reserva.data === today
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando reservas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 max-w-md mx-auto">
          <p className="font-bold">Erro ao carregar reservas</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Reservas</h1>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="Todas"
          />
          <FilterButton
            active={filter === 'active'}
            onClick={() => setFilter('active')}
            label="Ativas"
          />
          <FilterButton
            active={filter === 'today'}
            onClick={() => setFilter('today')}
            label="Hoje"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total"
          value={reservas.length}
          icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
          color="blue"
        />
        <StatsCard
          title="Confirmadas"
          value={reservas.filter(r => r.status === 'confirmada').length}
          icon={<CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
          color="green"
        />
        <StatsCard
          title="Pendentes"
          value={reservas.filter(r => r.status === 'pendente').length}
          icon={<AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
          color="yellow"
        />
        <StatsCard
          title="Hoje"
          value={reservas.filter(r => r.data === new Date().toISOString().split('T')[0]).length}
          icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
          color="purple"
        />
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {filteredReservas.length} reserva(s) encontrada(s)
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredReservas.map((reserva) => (
            <ReservaCard 
              key={reserva.id} 
              reserva={reserva} 
              onUpdateStatus={updateReservationStatus}
              onCancel={cancelReservation}
            />
          ))}
        </div>
        
        {filteredReservas.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma reserva encontrada para este filtro</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Componentes auxiliares
function FilterButton({ active, onClick, label }: { 
  active: boolean; 
  onClick: () => void; 
  label: string 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  )
}

function StatsCard({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
      <div className="flex items-center">
        <div className={`p-1.5 sm:p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-2 sm:ml-3 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
            {title}
          </p>
          <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function ReservaCard({ reserva, onUpdateStatus, onCancel }: { 
  reserva: Reservation; 
  onUpdateStatus: (id: string, status: string) => void;
  onCancel: (id: string) => void;
}) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelada':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="space-y-3 sm:space-y-4">
        {/* Header com nome e status */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {reserva.nome}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(reserva.data)}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {reserva.horario}
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {reserva.pessoas} pessoas
              </span>
            </div>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reserva.status)}`}>
            {reserva.status.charAt(0).toUpperCase() + reserva.status.slice(1)}
          </span>
        </div>

        {/* Contato */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4 mr-2" />
            <span className="truncate">{reserva.email}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4 mr-2" />
            <span>{reserva.telefone}</span>
          </div>
        </div>

        {/* Observações */}
        {reserva.observacoes && (
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <strong>Observações:</strong> {reserva.observacoes}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          {reserva.status === 'pendente' && (
            <button
              onClick={() => onUpdateStatus(reserva.id, 'confirmada')}
              className="flex-1 sm:flex-none bg-green-500 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Confirmar
            </button>
          )}
          {reserva.status === 'confirmada' && (
            <button
              onClick={() => onUpdateStatus(reserva.id, 'pendente')}
              className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Pendente
            </button>
          )}
          <button
            onClick={() => onCancel(reserva.id)}
            className="flex-1 sm:flex-none bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
          >
            <X className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Cancelar</span>
          </button>
        </div>
      </div>
    </div>
  )
}