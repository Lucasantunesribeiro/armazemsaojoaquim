'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  X, 
  Upload, 
  Plus, 
  Trash2,
  Loader2,
  ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { PousadaRoom, RoomType } from '@/types/database.types'
import ImageUpload from './ImageUpload'

const roomSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  type: z.enum(['STANDARD', 'DELUXE', 'SUITE'], {
    errorMap: () => ({ message: 'Selecione um tipo válido' })
  }),
  price_non_refundable: z.number().min(0, 'Preço deve ser positivo'),
  description: z.string().optional(),
  max_guests: z.number().min(1, 'Mínimo 1 hóspede').max(10, 'Máximo 10 hóspedes'),
  size_sqm: z.number().min(1, 'Área deve ser positiva').optional(),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  available: z.boolean(),
  amenities: z.array(z.string()).default([])
})

type RoomFormData = z.infer<typeof roomSchema>

interface RoomFormProps {
  room?: PousadaRoom
  onSubmit: (data: RoomFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const ROOM_TYPES: { value: RoomType; label: string; description: string }[] = [
  { 
    value: 'STANDARD', 
    label: 'Standard', 
    description: 'Quarto básico com comodidades essenciais' 
  },
  { 
    value: 'DELUXE', 
    label: 'Deluxe', 
    description: 'Quarto superior com comodidades extras' 
  },
  { 
    value: 'SUITE', 
    label: 'Suíte', 
    description: 'Acomodação premium com área de estar' 
  }
]

const COMMON_AMENITIES = [
  'WiFi gratuita',
  'TV a cabo',
  'Ar-condicionado',
  'Frigobar',
  'Cofre',
  'Varanda',
  'Banheira',
  'Banheira de hidromassagem',
  'Área de estar',
  'Sofá-cama',
  'Champanhe de boas-vindas',
  'Kit família',
  'Vista para o jardim',
  'Vista panorâmica'
]

export default function RoomForm({ room, onSubmit, onCancel, isLoading }: RoomFormProps) {
  const [newAmenity, setNewAmenity] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(room?.image_url || null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: room?.name || '',
      type: room?.type as RoomType || 'STANDARD',
      price_non_refundable: room?.price_non_refundable || 0,
      description: room?.description || '',
      max_guests: room?.max_guests || 2,
      size_sqm: room?.size_sqm || undefined,
      image_url: room?.image_url || '',
      available: room?.available ?? true,
      amenities: room?.amenities || []
    }
  })

  const watchedAmenities = watch('amenities')
  const watchedImageUrl = watch('image_url')

  const handleImageUrlChange = (url: string) => {
    setValue('image_url', url)
    setImagePreview(url || null)
  }

  const addAmenity = (amenity: string) => {
    const currentAmenities = watchedAmenities || []
    if (amenity && !currentAmenities.includes(amenity)) {
      setValue('amenities', [...currentAmenities, amenity])
    }
    setNewAmenity('')
  }

  const removeAmenity = (amenityToRemove: string) => {
    const currentAmenities = watchedAmenities || []
    setValue('amenities', currentAmenities.filter(a => a !== amenityToRemove))
  }

  const handleFormSubmit = async (data: RoomFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Erro ao salvar quarto:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {room ? 'Editar Quarto' : 'Novo Quarto'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Quarto *
                </label>
                <Input
                  {...register('name')}
                  placeholder="Ex: Quarto Standard 1"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Quarto *
                </label>
                <select
                  {...register('type')}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {ROOM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preço por Noite (R$) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price_non_refundable', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={errors.price_non_refundable ? 'border-red-500' : ''}
                />
                {errors.price_non_refundable && (
                  <p className="text-red-500 text-sm mt-1">{errors.price_non_refundable.message}</p>
                )}
              </div>
            </div>

            {/* Room Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacidade Máxima *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  {...register('max_guests', { valueAsNumber: true })}
                  placeholder="2"
                  className={errors.max_guests ? 'border-red-500' : ''}
                />
                {errors.max_guests && (
                  <p className="text-red-500 text-sm mt-1">{errors.max_guests.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Área (m²)
                </label>
                <Input
                  type="number"
                  min="1"
                  {...register('size_sqm', { valueAsNumber: true })}
                  placeholder="25"
                  className={errors.size_sqm ? 'border-red-500' : ''}
                />
                {errors.size_sqm && (
                  <p className="text-red-500 text-sm mt-1">{errors.size_sqm.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Descreva as características e diferenciais do quarto..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagem do Quarto
              </label>
              <div className="space-y-4">
                {/* Image Upload Component */}
                <ImageUpload
                  value={imagePreview || undefined}
                  onChange={(url) => {
                    setValue('image_url', url)
                    setImagePreview(url)
                  }}
                  onRemove={() => {
                    setValue('image_url', '')
                    setImagePreview(null)
                  }}
                  disabled={isLoading}
                />
                
                {/* Manual URL Input */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Ou insira uma URL manualmente:
                  </label>
                  <Input
                    {...register('image_url')}
                    placeholder="URL da imagem (ex: /images/rooms/standard-1.jpg)"
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className={errors.image_url ? 'border-red-500' : ''}
                  />
                  {errors.image_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comodidades
              </label>
              
              {/* Quick Add Buttons */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Comodidades comuns:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_AMENITIES.map(amenity => (
                    <Button
                      key={amenity}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAmenity(amenity)}
                      disabled={watchedAmenities?.includes(amenity)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {amenity}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amenity Input */}
              <div className="flex gap-2 mb-4">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Adicionar comodidade personalizada..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addAmenity(newAmenity)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addAmenity(newAmenity)}
                  disabled={!newAmenity.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Amenities */}
              {watchedAmenities && watchedAmenities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Comodidades selecionadas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {watchedAmenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                      >
                        <span>{amenity}</span>
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('available')}
                id="available"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="available" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quarto disponível para reservas
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {room ? 'Atualizar Quarto' : 'Criar Quarto'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}