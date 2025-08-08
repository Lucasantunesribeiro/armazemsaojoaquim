'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Users, DollarSign } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Separator } from '@/components/ui'

interface Room {
  id: string
  name: string
  type: 'STANDARD' | 'DELUXE' | 'SUITE'
  price_refundable: number
  price_non_refundable: number
  description: string
  amenities: string[]
  max_guests: number
  image_url: string
  available: boolean
  created_at: string
  updated_at: string
}

interface Booking {
  id: string
  room_id: string
  guest_name: string
  email: string
  phone: string
  check_in: string
  check_out: string
  guests_count: number
  total_price: number
  is_refundable: boolean
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  special_requests: string
  created_at: string
}

const initialRoomData: Omit<Room, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  type: 'STANDARD',
  price_refundable: 0,
  price_non_refundable: 0,
  description: '',
  amenities: [],
  max_guests: 2,
  image_url: '',
  available: true
}

export default function AdminPousadaPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomData, setRoomData] = useState(initialRoomData)
  const [amenityInput, setAmenityInput] = useState('')

  useEffect(() => {
    fetchRooms()
    fetchBookings()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/admin/pousada/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Erro ao carregar quartos:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/pousada/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Erro ao carregar reservas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRoom = async () => {
    try {
      const url = editingRoom 
        ? `/api/admin/pousada/rooms/${editingRoom.id}`
        : '/api/admin/pousada/rooms'
      
      const method = editingRoom ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData)
      })

      if (response.ok) {
        await fetchRooms()
        setIsRoomModalOpen(false)
        setEditingRoom(null)
        setRoomData(initialRoomData)
      }
    } catch (error) {
      console.error('Erro ao salvar quarto:', error)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Tem certeza que deseja excluir este quarto?')) return

    try {
      const response = await fetch(`/api/admin/pousada/rooms/${roomId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchRooms()
      }
    } catch (error) {
      console.error('Erro ao excluir quarto:', error)
    }
  }

  const openEditModal = (room: Room) => {
    setEditingRoom(room)
    setRoomData({
      name: room.name,
      type: room.type,
      price_refundable: room.price_refundable,
      price_non_refundable: room.price_non_refundable,
      description: room.description,
      amenities: room.amenities,
      max_guests: room.max_guests,
      image_url: room.image_url,
      available: room.available
    })
    setIsRoomModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingRoom(null)
    setRoomData(initialRoomData)
    setIsRoomModalOpen(true)
  }

  const addAmenity = () => {
    if (amenityInput.trim() && !roomData.amenities.includes(amenityInput.trim())) {
      setRoomData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }))
      setAmenityInput('')
    }
  }

  const removeAmenity = (amenity: string) => {
    setRoomData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'Standard'
      case 'DELUXE': return 'Deluxe'
      case 'SUITE': return 'Suíte'
      default: return type
    }
  }

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'bg-blue-100 text-blue-800'
      case 'DELUXE': return 'bg-purple-100 text-purple-800'
      case 'SUITE': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestão da Pousada</h1>
        <p className="text-slate-600">Gerencie quartos e reservas da Lobie Armazém São Joaquim</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Quartos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quartos Disponíveis</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rooms.filter(r => r.available).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              R$ {bookings
                .filter(b => b.status === 'CONFIRMED' && new Date(b.created_at).getMonth() === new Date().getMonth())
                .reduce((total, b) => total + b.total_price, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quartos */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quartos</CardTitle>
              <CardDescription>Gerencie os quartos da pousada</CardDescription>
            </div>
            <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Quarto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRoom ? 'Editar Quarto' : 'Novo Quarto'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRoom ? 'Edite as informações do quarto' : 'Adicione um novo quarto à pousada'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Quarto</Label>
                      <Input
                        id="name"
                        value={roomData.name}
                        onChange={(e) => setRoomData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select value={roomData.type} onValueChange={(value: any) => setRoomData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDARD">Standard</SelectItem>
                          <SelectItem value="DELUXE">Deluxe</SelectItem>
                          <SelectItem value="SUITE">Suíte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={roomData.description}
                      onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_refundable">Preço Reembolsável (R$)</Label>
                      <Input
                        id="price_refundable"
                        type="number"
                        step="0.01"
                        value={roomData.price_refundable}
                        onChange={(e) => setRoomData(prev => ({ ...prev, price_refundable: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_non_refundable">Preço Não-Reembolsável (R$)</Label>
                      <Input
                        id="price_non_refundable"
                        type="number"
                        step="0.01"
                        value={roomData.price_non_refundable}
                        onChange={(e) => setRoomData(prev => ({ ...prev, price_non_refundable: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_guests">Máx. Hóspedes</Label>
                      <Input
                        id="max_guests"
                        type="number"
                        value={roomData.max_guests}
                        onChange={(e) => setRoomData(prev => ({ ...prev, max_guests: parseInt(e.target.value) || 2 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">URL da Imagem</Label>
                      <Input
                        id="image_url"
                        value={roomData.image_url}
                        onChange={(e) => setRoomData(prev => ({ ...prev, image_url: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Comodidades</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        placeholder="Digite uma comodidade"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      />
                      <Button type="button" onClick={addAmenity} variant="outline">
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {roomData.amenities.map((amenity, index) => (
                        <button
                          key={index}
                          onClick={() => removeAmenity(amenity)}
                          className="cursor-pointer"
                        >
                          <Badge variant="secondary">
                            {amenity} ×
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={roomData.available}
                      onCheckedChange={(checked) => setRoomData(prev => ({ ...prev, available: checked }))}
                    />
                    <Label>Quarto disponível</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsRoomModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveRoom}>
                      {editingRoom ? 'Salvar Alterações' : 'Criar Quarto'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{room.name}</CardTitle>
                      <Badge className={getRoomTypeColor(room.type)}>
                        {getRoomTypeLabel(room.type)}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(room)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteRoom(room.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600 line-clamp-2">{room.description}</p>
                  <div className="flex justify-between text-sm">
                    <span>Reembolsável:</span>
                    <span className="font-bold">R$ {room.price_refundable}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Não-reembolsável:</span>
                    <span className="font-bold text-green-600">R$ {room.price_non_refundable}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Máx. hóspedes:</span>
                    <span>{room.max_guests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status:</span>
                    <Badge variant={room.available ? "default" : "secondary"}>
                      {room.available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reservas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Recentes</CardTitle>
          <CardDescription>Últimas reservas da pousada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.slice(0, 10).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{booking.guest_name}</div>
                  <div className="text-sm text-slate-600">
                    {booking.email} • {booking.phone}
                  </div>
                  <div className="text-sm text-slate-600">
                    Check-in: {new Date(booking.check_in).toLocaleDateString()} | 
                    Check-out: {new Date(booking.check_out).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    {booking.guests_count} hóspede{booking.guests_count !== 1 ? 's' : ''} • 
                    R$ {booking.total_price} • 
                    {booking.is_refundable ? 'Reembolsável' : 'Não-reembolsável'}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <div className="text-sm text-slate-600 mt-1">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}