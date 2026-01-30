'use client'

import { useState, useRef } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { useAdminApi } from '@/lib/hooks/useAdminApi'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { adminFetch } = useAdminApi()

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('O arquivo deve ter no máximo 5MB.')
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('image', file)

      const response = await adminFetch('/api/admin/upload/room-image', {
        method: 'POST',
        body: formData,
      })

      if (response && response.path) {
        onChange(response.path)
      } else {
        throw new Error('Caminho da imagem não retornado')
      }

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      alert(error.message || 'Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (disabled || uploading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !uploading) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  if (value) {
    return (
      <div className="relative">
        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={value}
            alt="Room image"
            className="w-full h-full object-contain"
            onError={() => {
              // Only remove if it's definitely broken, could render placeholder instead
              // onRemove()
            }}
          />

          {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors shadow-sm"
            title="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Replace button - Bottom Right */}
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || uploading}
            className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-medium rounded backdrop-blur-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3" />
                Substituir
              </>
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>
    )
  }

  return (
    <div
      className={`relative w-full h-48 border-2 border-dashed rounded-lg transition-all cursor-pointer group ${dragOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Enviando imagem...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Por favor aguarde
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full mb-3 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors shadow-sm">
              {dragOver ? (
                <Upload className="h-6 w-6 text-blue-500" />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              )}
            </div>

            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {dragOver ? 'Solte a imagem agora' : 'Clique para enviar ou arraste'}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, WEBP até 5MB
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  )
}