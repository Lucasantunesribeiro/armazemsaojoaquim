'use client'

import Image from 'next/image'
import { useState, SyntheticEvent, useEffect } from 'react'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  fallbackSrc?: string
  showPlaceholderIcon?: boolean
}

const SafeImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  sizes,
  quality = 90,
  placeholder = 'empty',
  fallbackSrc = '/images/placeholder.jpg',
  showPlaceholderIcon = true
}: SafeImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fallbackLevel, setFallbackLevel] = useState(0)

  // Sistema de fallback inteligente
  const getFallbackSrc = (originalSrc: string | null | undefined, level: number): string | null => {
    if (!originalSrc) return fallbackSrc

    // Se é URL do Supabase, tentar versão local primeiro
    if (originalSrc.includes('supabase.co/storage/v1/object/public/menu-images/')) {
      const filename = originalSrc.split('/').pop()
      
      switch (level) {
        case 0:
          // Nível 0: Tentar Supabase primeiro (original)
          return originalSrc
        case 1:
          // Nível 1: Tentar versão local da pasta menu_images
          return `/images/menu_images/${filename}`
        case 2:
          // Nível 2: Usar placeholder personalizado ou padrão
          return fallbackSrc
        default:
          return null
      }
    }

    // Para outras URLs, usar fallback padrão
    switch (level) {
      case 0:
        return originalSrc
      case 1:
        return fallbackSrc
      default:
        return null
    }
  }

  // Resetar estado quando src muda
  useEffect(() => {
    setImageError(false)
    setIsLoading(true)
    setFallbackLevel(0)
    
    const newSrc = getFallbackSrc(src, 0)
    setCurrentSrc(newSrc)
  }, [src, fallbackSrc])

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`❌ Erro ao carregar imagem (nível ${fallbackLevel}):`, e.currentTarget.src)
    
    const nextLevel = fallbackLevel + 1
    const nextSrc = getFallbackSrc(src, nextLevel)
    
    if (nextSrc && nextLevel <= 2) {
      console.log(`🔄 Tentando fallback nível ${nextLevel}:`, nextSrc)
      setFallbackLevel(nextLevel)
      setCurrentSrc(nextSrc)
      setIsLoading(true)
    } else {
      console.warn('❌ Todos os fallbacks falharam')
      setImageError(true)
      setIsLoading(false)
    }
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    if (fallbackLevel > 0) {
      console.log(`✅ Imagem carregada com fallback nível ${fallbackLevel}:`, currentSrc)
    }
  }

  // Se não há src válida e não há fallback, mostrar placeholder
  if (!currentSrc && imageError) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-cinza-claro/20 to-cinza-medio/20 ${className}`}>
        {showPlaceholderIcon && (
          <div className="text-center space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl text-cinza-medio">🍽️</div>
            <p className="text-xs text-cinza-medio font-medium">Imagem não disponível</p>
          </div>
        )}
      </div>
    )
  }

  if (!currentSrc) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-cinza-claro/20 to-cinza-medio/20 ${className}`}>
        <div className="animate-pulse text-cinza-medio">Carregando...</div>
      </div>
    )
  }

  return (
    <div className={`relative ${isLoading ? 'bg-gradient-to-br from-cinza-claro/20 to-cinza-medio/20' : ''}`}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        onError={handleImageError}
        onLoad={handleImageLoad}
        unoptimized={fallbackLevel > 0} // Desabilitar otimização para fallbacks
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cinza-claro/20 to-cinza-medio/20">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-2 border-amarelo-armazem border-t-transparent rounded-full animate-spin"></div>
            {fallbackLevel > 0 && (
              <p className="text-xs text-cinza-medio">
                Tentativa {fallbackLevel + 1}...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Fallback indicator para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && fallbackLevel > 0 && !isLoading && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
          F{fallbackLevel}
        </div>
      )}
    </div>
  )
}

export default SafeImage 