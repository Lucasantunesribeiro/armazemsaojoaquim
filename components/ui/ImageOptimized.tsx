'use client'

import { useState, useRef, useEffect, CSSProperties } from 'react'

interface ImageOptimizedProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  className?: string
  style?: CSSProperties
  priority?: boolean
  placeholder?: 'blur' | 'empty' | string
  blurDataURL?: string
  sizes?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  onLoad?: () => void
  onError?: () => void
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
}

// Detectar suporte a formatos modernos
const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  } catch {
    return false
  }
}

// Gerar URL otimizada
const getOptimizedSrc = (src: string, format?: string): string => {
  if (src.startsWith('http') || src.startsWith('//')) {
    return src
  }
  
  if (format && format !== 'original') {
    const baseName = src.replace(/\.(jpg|jpeg|png|webp)$/i, '')
    return `${baseName}.${format}`
  }
  
  return src
}

// Gerar placeholder blur
const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  if (typeof window === 'undefined') return ''
  
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

export default function ImageOptimized({
  src,
  alt,
  width,
  height,
  quality = 85,
  className = '',
  style,
  priority = true,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  objectFit = 'cover',
  onLoad,
  onError,
  loading = 'eager',
  fetchPriority = 'auto',
}: ImageOptimizedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const [modernFormat, setModernFormat] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Detectar suporte a formatos modernos
    if (supportsAVIF()) {
      setModernFormat('avif')
    } else if (supportsWebP()) {
      setModernFormat('webp')
    } else {
      setModernFormat('original')
    }
  }, [])

  useEffect(() => {
    if (modernFormat) {
      setCurrentSrc(getOptimizedSrc(src, modernFormat))
    }
  }, [src, modernFormat])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    if (modernFormat !== 'original') {
      // Fallback para formato original
      setCurrentSrc(getOptimizedSrc(src, 'original'))
      setModernFormat('original')
      setHasError(false)
    } else {
      setHasError(true)
      onError?.()
    }
  }

  // Gerar placeholder
  const getPlaceholder = () => {
    if (placeholder === 'empty') return null
    
    const defaultBlur = blurDataURL || generateBlurDataURL(width || 10, height || 10)
    
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url(${defaultBlur})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    )
  }

  // Fallback para erro
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
        role="img"
        aria-label={`Erro ao carregar: ${alt}`}
      >
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height, ...style }}>
      {getPlaceholder()}
      
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit,
            width: '100%',
            height: '100%',
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="eager"
          decoding="async"
          sizes={sizes}
          fetchPriority={fetchPriority}
        />
      )}
    </div>
  )
} 