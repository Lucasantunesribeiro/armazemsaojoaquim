'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Building2,
  Users,
  Star,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { PousadaRoom } from '@/types/database.types'
import RoomForm from './components/RoomForm'
import RoomCard from './components/RoomCard'

interface PousadasPageProps {
  params: Promise<{ locale: string }>
}

export default function PousadasPage({ params }: PousadasPageProps) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale || 'pt'
  
  const [rooms, setRooms] = useState<PousadaRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterAvailability, setFilterAvailability] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<PousadaRoom | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (filterAvailability !== 'all') params.append('available', filterAvailability)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/admin/pousadas/rooms?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar quartos')
      }
      
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error('Erro ao carregar quartos:', error)
      setError('Erro ao carregar quartos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Reload rooms when filters change
  useEffect(() => {
    if (!loading) {
      loadRooms()
    }
  }, [filterType, filterAvailability, searchTerm])

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTypeFilter = filterType === 'all' || room.type === filterType.toUpperCase()
    const matchesAvailabilityFilter = filterAvailability === 'all' || 
                                     (filterAvailability === 'available' && room.available) ||
                                     (filterAvailability === 'unavailable' && !room.available)
    return matchesSearch && matchesTypeFilter && matchesAvailabilityFilter
  })

  const handleCreateRoom = async (roomData: any) => {
    try {
      setFormLoading(true)
      
      const response = await fetch('/api/admin/pousadas/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar quarto')
      }

      const newRoom = await response.json()
      setRooms(prev => [newRoom, ...prev])
      setShowRoomForm(false)
      setError(null)
    } catch (error) {
      console.error('Erro ao criar quarto:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar quarto')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateRoom = async (roomData: any) => {
    if (!editingRoom) return

    try {
      setFormLoading(true)
      
      const response = await fetch(`/api/admin/pousadas/rooms/${editingRoom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar quarto')
      }

      const updatedRoom = await response.json()
      setRooms(prev => prev.map(room => 
        room.id === updatedRoom.id ? updatedRoom : room
      ))
      setEditingRoom(null)
      setShowRoomForm(false)
      setError(null)
    } catch (error) {
      console.error('Erro ao atualizar quarto:', error)
      setError(error instanceof Error ? error.message : 'Erro ao atualizar quarto')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/admin/pousadas/rooms/${roomId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir quarto')
      }

      setRooms(prev => prev.filter(room => room.id !== roomId))
      setError(null)
    } catch (error) {
      console.error('Erro ao excluir quarto:', error)
      setError(error instanceof Error ? error.message : 'Erro ao excluir quarto')
    }
  }

  const handleToggleAvailability = async (roomId: string) => {
    try {
      const room = rooms.find(r => r.id === roomId)
      if (!room) return

      const response = await fetch(`/api/admin/pousadas/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !room.available }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao alterar disponibilidade')
      }

      const updatedRoom = await response.json()
      setRooms(prev => prev.map(r => 
        r.id === updatedRoom.id ? updatedRoom : r
      ))
      setError(null)
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error)
      setError(error instanceof Error ? error.message : 'Erro ao alterar disponibilidade')
    }
  }

  const handleEditRoom = (room: PousadaRoom) => {
    setEditingRoom(room)
    setShowRoomForm(true)
  }

  const handleNewRoom = () => {
    setEditingRoom(null)
    setShowRoomForm(true)
  }

  const handleCancelForm = () => {
    setEditingRoom(null)
    setShowRoomForm(false)
    setError(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando quartos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Pousadas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie quartos, comodidades e disponibilidade
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          
          <Button 
            onClick={handleNewRoom}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Quarto
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              Fechar
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar quartos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Quarto
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suíte</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disponibilidade
                </label>
                <select 
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos</option>
                  <option value="available">Disponível</option>
                  <option value="unavailable">Indisponível</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacidade
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="all">Qualquer capacidade</option>
                  <option value="1-2">1-2 pessoas</option>
                  <option value="3-4">3-4 pessoas</option>
                  <option value="5+">5+ pessoas</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de Quartos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rooms.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Disponíveis
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rooms.filter(room => room.available).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Capacidade Total
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rooms.reduce((sum, room) => sum + room.max_guests, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Área Total
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rooms.reduce((sum, room) => sum + (room.size_sqm || 0), 0)}m²
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
            onToggleAvailability={handleToggleAvailability}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum quarto encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filterType !== 'all' || filterAvailability !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro quarto.'}
          </p>
          <Button onClick={handleNewRoom} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Primeiro Quarto
          </Button>
        </Card>
      )}

      {/* Room Form Modal */}
      {showRoomForm && (
        <RoomForm
          room={editingRoom || undefined}
          onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom}
          onCancel={handleCancelForm}
          isLoading={formLoading}
        />
      )}
    </div>
  )
}