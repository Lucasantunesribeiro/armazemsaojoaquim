'use client'

import { useState } from 'react'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import Image from 'next/image'

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imagePath: string) => void
  label?: string
}

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  label = "Imagem de Destaque" 
}: ImageUploadProps) {
  const { adminFetch } = useAdminApi()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(currentImage || '')

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      console.log('🔄 ImageUpload: Iniciando upload:', file.name)
      
      // Criar preview local
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Fazer upload
      const formData = new FormData()
      formData.append('image', file)

      const response = await adminFetch('/api/admin/upload/blog-image', {
        method: 'POST',
        body: formData,
      })

      console.log('✅ ImageUpload: Upload concluído:', response)
      
      // Atualizar com o path final
      setPreview(response.path)
      onImageChange(response.path)

      // Limpar preview URL para evitar memory leak
      URL.revokeObjectURL(previewUrl)

    } catch (error: any) {
      console.error('❌ ImageUpload: Erro no upload:', error)
      setError(error.message || 'Erro ao fazer upload da imagem')
      setPreview(currentImage || '')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview('')
    onImageChange('')
    setError('')
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Preview da imagem */}
      {preview && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              loading="eager"
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Input de arquivo */}
      <div className="flex items-center space-x-4">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <div className={`
            px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
            ${uploading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
            }
          `}>
            {uploading ? 'Fazendo upload...' : 'Selecionar Imagem'}
          </div>
        </label>

        {preview && (
          <div className="text-sm text-gray-600">
            Path: <code className="bg-gray-100 px-2 py-1 rounded">{preview}</code>
          </div>
        )}
      </div>

      {/* Indicador de loading */}
      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Fazendo upload da imagem...</span>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Instruções */}
      <div className="text-xs text-gray-500">
        Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB.
      </div>
    </div>
  )
}