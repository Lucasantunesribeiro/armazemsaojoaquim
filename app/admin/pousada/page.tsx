'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAdmin } from '@/hooks/useAdmin'
import { PousadaRoom, PousadaRoomInsert, PousadaRoomType } from '@/types/database.types'

const roomTypes: { value: PousadaRoomType; label: string }[] = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'DELUXE', label: 'Deluxe' },
  { value: 'SUITE', label: 'Suíte' }
]

const defaultAmenities = [
  'WiFi gratuita',
  'TV a cabo', 
  'Frigobar',
  'Cofre',
  'Ar-condicionado',
  'Varanda privativa',
  'Sala de estar',
  'Banheira'
]

export default function AdminPousadaPage() {
  const { supabase } = useSupabase()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [rooms, setRooms] = useState<PousadaRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<PousadaRoom | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<Partial<PousadaRoomInsert>>({
    name: '',
    type: 'STANDARD',
    price_refundable: 0,
    price_non_refundable: 0,
    description: '',
    amenities: [],
    max_guests: 2,
    image_url: '',
    available: true
  })

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadRooms()
    }
  }, [adminLoading, isAdmin])

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('pousada_rooms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Erro ao carregar quartos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingRoom) {
        const { error } = await supabase
          .from('pousada_rooms')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRoom.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('pousada_rooms')
          .insert([formData as PousadaRoomInsert])

        if (error) throw error
      }

      await loadRooms()
      setShowForm(false)
      setEditingRoom(null)
      resetForm()
      alert(editingRoom ? 'Quarto atualizado!' : 'Quarto criado!')
    } catch (error) {
      console.error('Erro ao salvar quarto:', error)
      alert('Erro ao salvar quarto')
    }
  }

  const handleEdit = (room: PousadaRoom) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      type: room.type as PousadaRoomType,
      price_refundable: room.price_refundable,
      price_non_refundable: room.price_non_refundable,
      description: room.description,
      amenities: room.amenities || [],
      max_guests: room.max_guests,
      image_url: room.image_url,
      available: room.available
    })
    setShowForm(true)
  }

  const handleDelete = async (room: PousadaRoom) => {
    if (!confirm(`Tem certeza que deseja excluir o quarto "${room.name}"?`)) return

    try {
      const { error } = await supabase
        .from('pousada_rooms')
        .delete()
        .eq('id', room.id)

      if (error) throw error
      
      await loadRooms()
      alert('Quarto excluído!')
    } catch (error) {
      console.error('Erro ao excluir quarto:', error)
      alert('Erro ao excluir quarto')
    }
  }

  const toggleAvailability = async (room: PousadaRoom) => {
    try {
      const { error } = await supabase
        .from('pousada_rooms')
        .update({ 
          available: !room.available,
          updated_at: new Date().toISOString()
        })
        .eq('id', room.id)

      if (error) throw error
      await loadRooms()
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'STANDARD',
      price_refundable: 0,
      price_non_refundable: 0,
      description: '',
      amenities: [],
      max_guests: 2,
      image_url: '',
      available: true
    })
  }

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.amenities || []
    if (currentAmenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: currentAmenities.filter(a => a !== amenity)
      })
    } else {
      setFormData({
        ...formData,
        amenities: [...currentAmenities, amenity]
      })
    }
  }

  if (adminLoading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  if (!isAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Acesso negado</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Quartos da Pousada
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Administre os quartos do Lobie Armazém São Joaquim
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingRoom(null)
              resetForm()
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Quarto
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingRoom ? 'Editar Quarto' : 'Novo Quarto'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Quarto</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Quarto Standard"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as PousadaRoomType })}
                        className="w-full p-2 border rounded-lg"
                        required
                      >
                        {roomTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_refundable">Preço Reembolsável (R$)</Label>
                      <Input
                        id="price_refundable"
                        type="number"
                        step="0.01"
                        value={formData.price_refundable}
                        onChange={(e) => setFormData({ ...formData, price_refundable: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price_non_refundable">Preço Não-reembolsável (R$)</Label>
                      <Input
                        id="price_non_refundable"
                        type="number"
                        step="0.01"
                        value={formData.price_non_refundable}
                        onChange={(e) => setFormData({ ...formData, price_non_refundable: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="max_guests">Máximo de Hóspedes</Label>
                    <Input
                      id="max_guests"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.max_guests}
                      onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border rounded-lg h-24"
                      placeholder="Descrição do quarto..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">URL da Imagem</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label>Comodidades</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {defaultAmenities.map(amenity => (
                        <label key={amenity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(formData.amenities || []).includes(amenity)}
                            onChange={() => handleAmenityToggle(amenity)}
                            className="rounded"
                          />
                          <span className="text-sm">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    />
                    <Label htmlFor="available">Disponível para reservas</Label>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                      {editingRoom ? 'Atualizar' : 'Criar'} Quarto
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingRoom(null)
                        resetForm()
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}

        {/* Rooms List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando quartos...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Nenhum quarto cadastrado ainda.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <Card key={room.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{room.name}</h3>
                    <Badge className={`mt-1 ${room.type === 'SUITE' ? 'bg-purple-100 text-purple-800' : room.type === 'DELUXE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {room.type}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAvailability(room)}
                      className={room.available ? 'hover:bg-red-50' : 'hover:bg-green-50'}
                    >
                      {room.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(room)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(room)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {room.image_url && (
                  <img
                    src={room.image_url}
                    alt={room.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}

                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {room.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Reembolsável:</span>
                    <span className="font-semibold text-green-600">R$ {room.price_refundable}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Não-reembolsável:</span>
                    <span className="font-semibold text-orange-600">R$ {room.price_non_refundable}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Máx. hóspedes:</span>
                    <span>{room.max_guests}</span>
                  </div>
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Comodidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Badge className={room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {room.available ? 'Disponível' : 'Indisponível'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(room.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}