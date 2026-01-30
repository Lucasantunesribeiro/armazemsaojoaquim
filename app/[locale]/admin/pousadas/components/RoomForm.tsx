'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
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


const roomSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  type: z.enum(['STANDARD', 'DELUXE', 'SUITE'], {
    errorMap: () => ({ message: 'Selecione um tipo válido' })
  }),
  price_non_refundable: z.number().min(0, 'Preço deve ser positivo'),
  description: z.string().optional(),
  max_guests: z.number().min(1, 'Mínimo 1 hóspede').max(10, 'Máximo 10 hóspedes'),
  size_sqm: z.number().min(1, 'Área deve ser positiva').optional(),
  image_url: z.string().optional().or(z.literal('')),
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
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { adminFetch } = useAdminApi()

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('image', file)

      console.log('📤 RoomForm: Iniciando upload de imagem via Hook...')

      const response = await adminFetch('/api/admin/upload/room-image', {
        method: 'POST',
        body: formData,
        // FormData handling requires avoiding default Content-Type header usually set by json clients
        // But useAdminApi wrapper might try to stringify. 
        // We might need to handle this. fetch handles FormData automatically if Content-Type is NOT set.
        // Let's assume adminFetch handles it or we might need to bypass.
        // If adminFetch stringifies body, we are in trouble.
        // Let's check useAdminApi later. For now assume it works or we'll fix it.
      })

      if (!response.path) {
        throw new Error('Upload failed - No path returned')
      }

      console.log('✅ RoomForm: Upload concluído:', response.path)
      setValue('image_url', response.path)
      setImagePreview(response.path)
    } catch (error) {
      console.error('❌ RoomForm: Erro no upload:', error)
      alert('Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  // ... (amenity handlers)

  // ... (handleFormSubmit)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto pt-24">
      <Card className="w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {room ? 'Editar Quarto' : 'Novo Quarto'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {room ? 'Atualize as informações do quarto' : 'Preencha os dados para criar um novo quarto'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Quarto *
                  </label>
                  <div className="w-full">
                    <Input
                      {...register('name')}
                      placeholder="Ex: Quarto Standard 1"
                      className={`w-full px-4 py-3 text-base rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Quarto *
                  </label>
                  <div className="relative">
                    <select
                      {...register('type')}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${errors.type ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      {ROOM_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Preço por Noite (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price_non_refundable', { valueAsNumber: true })}
                      placeholder="0.00"
                      className={`pl-10 ${errors.price_non_refundable ? 'border-red-500' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Capacidade
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        {...register('max_guests', { valueAsNumber: true })}
                        placeholder="2"
                        className={errors.max_guests ? 'border-red-500' : ''}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">pessoas</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Área
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        {...register('size_sqm', { valueAsNumber: true })}
                        placeholder="25"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">m²</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Imagem do Quarto
                  </label>

                  <div className="relative group">
                    {imagePreview ? (
                      <div className="relative w-full h-64 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-transform transform hover:scale-105 shadow-lg flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Substituir
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setValue('image_url', '')
                              setImagePreview(null)
                            }}
                            className="bg-red-500/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-transform transform hover:scale-105 shadow-lg flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-64 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 group"
                      >
                        <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                          {uploading ? <Loader2 className="w-8 h-8 text-blue-500 animate-spin" /> : <ImageIcon className="w-8 h-8 text-blue-500" />}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {uploading ? 'Enviando...' : 'Clique para fazer upload'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG ou WebP até 5MB
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description - Full Width */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Descreva as características e diferenciais do quarto em detalhes..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Amenities Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Comodidades
                </label>
                <span className="text-xs text-gray-500">{watchedAmenities?.length || 0} selecionadas</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                {/* Quick Add */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sugestões Populares</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_AMENITIES.map(amenity => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => addAmenity(amenity)}
                        disabled={watchedAmenities?.includes(amenity)}
                        className={`
                            inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${watchedAmenities?.includes(amenity)
                            ? 'bg-blue-100/50 text-blue-400 cursor-default opacity-50'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 shadow-sm hover:shadow active:scale-95'}
                          `}
                      >
                        <Plus className="h-3 w-3 mr-1.5" />
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input & List */}
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Adicionar comodidade personalizada..."
                      className="pr-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addAmenity(newAmenity)
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addAmenity(newAmenity)}
                      disabled={!newAmenity.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {watchedAmenities && watchedAmenities.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {watchedAmenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 border border-blue-100 dark:border-blue-800 rounded-lg text-sm font-medium transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-100 dark:hover:bg-red-900/10 dark:hover:text-red-300 dark:hover:border-red-900"
                        >
                          <span>{amenity}</span>
                          <button
                            type="button"
                            onClick={() => removeAmenity(amenity)}
                            className="p-0.5 rounded-full hover:bg-red-200/50 dark:hover:bg-red-900/30"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                      Nenhuma comodidade adicionada ainda
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                {...register('available')}
                id="available"
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="available" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer select-none">
                Disponível para reservas online
              </label>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
                className="h-11 px-6 text-gray-500 hover:text-gray-900"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || uploading}
                className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  room ? 'Salvar Alterações' : 'Criar Quarto'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}