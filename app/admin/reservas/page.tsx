'use client'

import { useState, useEffect } from 'react'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { Calendar, Clock, Users, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reservas</h1>
        <div className="flex space-x-2">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total"
          value={reservas.length}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Confirmadas"
          value={reservas.filter(r => r.status === 'confirmada').length}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="Pendentes"
          value={reservas.filter(r => r.status === 'pendente').length}
          icon={<AlertCircle className="h-5 w-5" />}
          color="yellow"
        />
        <StatsCard
          title="Hoje"
          value={reservas.filter(r => r.data === new Date().toISOString().split('T')[0]).length}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
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
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900',
    green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900',
    yellow: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900',
    purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
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
  const statusColors = {
    confirmada: 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-800',
    pendente: 'text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-800',
    cancelada: 'text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-800'
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
    } catch {
      return date
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{reserva.nome}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[reserva.status]}`}>
              {reserva.status}
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(reserva.data)} às {reserva.horario}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {reserva.pessoas} pessoa(s)
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              {reserva.email}
            </div>
          </div>

          {reserva.telefone && (
            <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4 mr-2" />
              {reserva.telefone}
            </div>
          )}

          {reserva.observacoes && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Observações:</span> {reserva.observacoes}
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="mt-4 flex space-x-2">
            {reserva.status === 'pendente' && (
              <button
                onClick={() => onUpdateStatus(reserva.id, 'confirmada')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Confirmar
              </button>
            )}
            
            {reserva.status !== 'cancelada' && (
              <button
                onClick={() => onCancel(reserva.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Cancelar
              </button>
            )}

            {reserva.status === 'confirmada' && (
              <button
                onClick={() => onUpdateStatus(reserva.id, 'pendente')}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
              >
                Marcar como Pendente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}