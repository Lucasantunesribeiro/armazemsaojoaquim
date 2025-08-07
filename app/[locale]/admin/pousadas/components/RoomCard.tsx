'use client'

import { useState } from 'react'
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building2,
  Users,
  Square,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PousadaRoom } from '@/types/database.types'

interface RoomCardProps {
  room: PousadaRoom
  onEdit: (room: PousadaRoom) => void
  onDelete: (roomId: string) => void
  onToggleAvailability: (roomId: string) => void
  onView?: (room: PousadaRoom) => void
}

export default function RoomCard({ 
  room, 
  onEdit, 
  onDelete, 
  onToggleAvailability,
  onView 
}: RoomCardProps) {
  const [showActions, setShowActions] = useState(false)

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir o quarto "${room.name}"?`)) {
      onDelete(room.id)
    }
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
      case 'STANDARD': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'DELUXE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'SUITE': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Room Image */}
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
        {room.image_url ? (
          <img
            src={room.image_url}
            alt={room.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        
        {/* Fallback when no image or image fails to load */}
        <div className={`${room.image_url ? 'hidden' : 'flex'} items-center justify-center h-full`}>
          <Building2 className="h-12 w-12 text-gray-400" />
        </div>
        
        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            room.available
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
          }`}>
            {room.available ? 'Disponível' : 'Indisponível'}
          </span>
        </div>

        {/* Room Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomTypeColor(room.type)}`}>
            {getRoomTypeLabel(room.type)}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="absolute bottom-2 right-2">
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowActions(!showActions)}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] z-10">
                {onView && (
                  <button
                    onClick={() => {
                      onView(room)
                      setShowActions(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </button>
                )}
                <button
                  onClick={() => {
                    onEdit(room)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onToggleAvailability(room.id)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  {room.available ? (
                    <>
                      <ToggleLeft className="h-4 w-4" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4" />
                      Ativar
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleDelete()
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {room.name}
          </h3>
          {room.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {room.description}
            </p>
          )}
        </div>

        {/* Room Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {room.max_guests} {room.max_guests === 1 ? 'pessoa' : 'pessoas'}
            </span>
          </div>
          
          {room.size_sqm && (
            <div className="flex items-center gap-2 text-sm">
              <Square className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {room.size_sqm}m²
              </span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Preços:</span>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                R$ {room.price_refundable.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                R$ {room.price_non_refundable.toFixed(2)} (não reembolsável)
              </p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Comodidades:</p>
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded">
                  +{room.amenities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(room)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleAvailability(room.id)}
            className={`flex items-center justify-center gap-2 ${
              room.available 
                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            {room.available ? (
              <>
                <ToggleLeft className="h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <ToggleRight className="h-4 w-4" />
                Ativar
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}