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
  const [fallbackLevel, setFallbackLevel] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Sistema de fallback inteligente com múltiplos níveis
  const getFallbackSources = (originalSrc: string | null | undefined): string[] => {
    if (!originalSrc) return [fallbackSrc]
    
    const sources: string[] = []
    
    // Nível 0: URL original (Supabase)
    sources.push(originalSrc)
    
    // Nível 1: Versão local PNG (se for do Supabase)
    if (originalSrc.includes('supabase.co')) {
      const filename = originalSrc.split('/').pop()
      if (filename) {
        sources.push(`/images/menu_images/${filename}`)
      }
    }
    
    // Nível 2: Versão SVG placeholder local
    if (originalSrc.includes('supabase.co')) {
      const filename = originalSrc.split('/').pop()
      if (filename) {
        const svgFilename = filename.replace('.png', '.svg').replace('.jpg', '.svg').replace('.jpeg', '.svg')
        sources.push(`/images/menu_images/${svgFilename}`)
      }
    }
    
    // Nível 3: Placeholder genérico
    sources.push(fallbackSrc)
    
    // Nível 4: Placeholder SVG final
    sources.push('/images/placeholder.svg')
    
    return sources
  }

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`❌ Erro ao carregar imagem (nível ${fallbackLevel}):`, e.currentTarget.src)
    
    const sources = getFallbackSources(src)
    const nextLevel = fallbackLevel + 1
    
    if (nextLevel < sources.length) {
      console.log(`🔄 Tentando fallback nível ${nextLevel}:`, sources[nextLevel])
      setFallbackLevel(nextLevel)
      setCurrentSrc(sources[nextLevel])
    } else {
      console.error('❌ Todos os fallbacks falharam para:', src)
      setHasError(true)
      setIsLoading(false)
    }
  }

  const handleImageLoad = () => {
    console.log(`✅ Imagem carregada com sucesso (nível ${fallbackLevel}):`, currentSrc)
    setIsLoading(false)
    setHasError(false)
  }

  // Inicializar ou resetar quando src muda
  useEffect(() => {
    const sources = getFallbackSources(src)
    setFallbackLevel(0)
    setCurrentSrc(sources[0])
    setIsLoading(true)
    setHasError(false)
  }, [src, fallbackSrc]) // getFallbackSources é uma função estável dentro do componente

  // Se não há src válida, mostrar placeholder final
  if (!currentSrc) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {showPlaceholderIcon && (
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-1">🖼️</div>
            <div className="text-xs">Sem imagem</div>
          </div>
        )}
      </div>
    )
  }

  // Se todos os fallbacks falharam, mostrar placeholder personalizado
  if (hasError) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-center p-4">
          <div className="text-2xl mb-2">🍽️</div>
          <div className="text-sm font-medium text-gray-600 mb-1">
            {alt || 'Imagem do prato'}
          </div>
          <div className="text-xs text-gray-500">
            Imagem não disponível
          </div>
        </div>
      </div>
    )
  }

  const imageProps = {
    src: currentSrc,
    alt,
    onError: handleImageError,
    onLoad: handleImageLoad,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    priority,
    quality,
    placeholder,
    sizes: sizes || (fill ? undefined : `(max-width: 768px) ${width || 300}px, ${width || 400}px`),
    ...(fill ? { fill: true } : { width, height })
  }

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400">
            <div className="animate-spin text-xl">⏳</div>
          </div>
        </div>
      )}
      
             {/* Actual image */}
       <Image {...imageProps} alt={alt} />
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-bl">
          L{fallbackLevel}
        </div>
      )}
    </div>
  )
}

export default SafeImage 