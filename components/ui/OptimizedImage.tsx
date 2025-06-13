'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

// Função para gerar um placeholder blur simples
const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  if (typeof window === 'undefined') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo='
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Gradiente suave para placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL()
}

// Função para verificar se a imagem existe
const checkImageExists = async (src: string): Promise<boolean> => {
  try {
    const response = await fetch(src, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Função para otimizar o src da imagem
const getOptimizedSrc = (src: string): string => {
  // Se já é uma URL absoluta, retorna como está
  if (src.startsWith('http')) {
    return src
  }
  
  // Se começa com /, é um caminho absoluto do site
  if (src.startsWith('/')) {
    return src
  }
  
  // Caso contrário, adiciona /images/ se não estiver presente
  if (!src.startsWith('/images/')) {
    return `/images/${src}`
  }
  
  return src
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  sizes,
  fill = false,
  style,
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(getOptimizedSrc(src))
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [generatedBlurDataURL, setGeneratedBlurDataURL] = useState<string>('')

  useEffect(() => {
    if (placeholder === 'blur' && !blurDataURL) {
      const generated = generateBlurDataURL(width || 400, height || 300)
      setGeneratedBlurDataURL(generated)
    }
  }, [placeholder, blurDataURL, width, height])

  // Verificar se a imagem existe
  useEffect(() => {
    const verifyImage = async () => {
      const exists = await checkImageExists(imageSrc)
      if (!exists) {
        setImageError(true)
        setImageSrc('/images/placeholder.jpg') // Fallback para placeholder
      }
    }

    if (imageSrc && !imageSrc.includes('placeholder')) {
      verifyImage()
    }
  }, [imageSrc])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setImageError(true)
    setIsLoading(false)
    setImageSrc('/images/placeholder.jpg')
    onError?.()
  }

  // Fallback para imagens quebradas
  if (imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
      >
        <svg 
          className="w-12 h-12" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
            clipRule="evenodd" 
          />
        </svg>
        <span className="sr-only">Imagem não disponível: {alt}</span>
      </div>
    )
  }

  // Configurações da imagem
  const imageProps = {
    src,
    alt,
    className: `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    quality,
    priority,
    style,
    ...(placeholder === 'blur' && {
      placeholder: 'blur' as const,
      blurDataURL: blurDataURL || generatedBlurDataURL
    }),
    ...(sizes && { sizes }),
    ...(fill ? { fill: true } : { width, height })
  }

  return (
    <div className="relative overflow-hidden">
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Imagem otimizada */}
      <Image
        {...imageProps}
        alt={alt}
      />
    </div>
  )
}

export default OptimizedImage 