'use client'

import { useState, useRef } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'rooms') // Organize uploads by folder
      
      // TODO: Implement actual file upload to your storage service
      // For now, we'll create a local URL for preview
      const imageUrl = URL.createObjectURL(file)
      
      // In a real implementation, you would upload to:
      // - Supabase Storage
      // - AWS S3
      // - Cloudinary
      // - Or your preferred image hosting service
      
      // Example for Supabase Storage:
      /*
      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(`${Date.now()}-${file.name}`, file)
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('room-images')
        .getPublicUrl(data.path)
      
      onChange(publicUrl)
      */
      
      // For now, just use the object URL
      onChange(imageUrl)
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da imagem. Tente novamente.')
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
        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <img
            src={value}
            alt="Room image"
            className="w-full h-full object-cover"
            onError={() => {
              // Handle broken image
              onRemove()
            }}
          />
          
          {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Replace button */}
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || uploading}
            className="absolute bottom-2 right-2 px-3 py-1 bg-black/50 text-white text-sm rounded hover:bg-black/70 disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Enviando...
              </div>
            ) : (
              'Substituir'
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
      className={`relative w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
        dragOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enviando imagem...
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3">
              {dragOver ? (
                <Upload className="h-6 w-6 text-blue-500" />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
            
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {dragOver ? 'Solte a imagem aqui' : 'Clique para enviar ou arraste uma imagem'}
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