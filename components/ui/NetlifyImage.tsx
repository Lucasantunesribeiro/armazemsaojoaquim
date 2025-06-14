'use client'

import { useState, useRef, useEffect, memo } from 'react'
import { cn } from '@/lib/utils'

interface NetlifyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
}

const NetlifyImage = memo(function NetlifyImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.svg',
  loading = 'lazy'
}: NetlifyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    }
    onError?.()
  }

  // Intersection Observer para lazy loading (apenas se não for priority)
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Imagem está visível, pode carregar
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  // Detectar suporte a WebP e AVIF
  const getOptimizedSrc = (originalSrc: string): string => {
    if (typeof window === 'undefined') return originalSrc
    
    // Para imagens locais, tentar usar formatos otimizados
    if (originalSrc.startsWith('/images/')) {
      const pathWithoutExt = originalSrc.replace(/\.[^/.]+$/, '')
      const isSupportsWebP = () => {
        const canvas = document.createElement('canvas')
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
      }
      
      // Tentar WebP primeiro se suportado
      if (isSupportsWebP()) {
        return `${pathWithoutExt}.webp`
      }
    }
    
    return originalSrc
  }

  const optimizedSrc = getOptimizedSrc(currentSrc)

  return (
    <div className="relative overflow-hidden">
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError ? 'object-contain' : 'object-cover',
          'w-full h-full',
          className
        )}
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse',
          'flex items-center justify-center'
        )}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Imagem não disponível</p>
          </div>
        </div>
      )}
    </div>
  )
})

export default NetlifyImage 