'use client'

import { useState, useRef, useEffect, memo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  quality?: number
  sizes?: string
  className?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  aspectRatio?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  lazy?: boolean
  webpFallback?: boolean
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  sizes,
  className,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.svg',
  aspectRatio,
  objectFit = 'cover',
  lazy = true,
  webpFallback = true
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isVisible, setIsVisible] = useState(!lazy || priority)
  const [currentSrc, setCurrentSrc] = useState(src)
  const imgRef = useRef<HTMLDivElement>(null)

  // Gerar blur placeholder automaticamente se não fornecido
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  // Otimizar src para formatos modernos
  const getOptimizedSrc = (originalSrc: string) => {
    if (!webpFallback || originalSrc.includes('.svg') || originalSrc.startsWith('data:')) {
      return originalSrc
    }

    // Tentar carregar versão WebP para imagens locais
    if (originalSrc.startsWith('/')) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    }

    return originalSrc
  }

  const optimizedSrc = getOptimizedSrc(currentSrc)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    
    // Tentar fallback se ainda não tentou
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      setIsLoading(true)
    }
    
    onError?.()
  }

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
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
  }, [lazy, priority])

  // Estilos do container
  const containerStyle = aspectRatio ? {
    aspectRatio,
    width: width ? `${width}px` : '100%'
  } : {}

  // Não renderizar imagem até estar visível (lazy loading)
  if (!isVisible) {
    return (
      <div
        ref={imgRef}
        className={cn('bg-gray-200 animate-pulse', className)}
        style={containerStyle}
      />
    )
  }

  const imageProps = {
    src: optimizedSrc,
    alt,
    quality,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      objectFit === 'cover' && 'object-cover',
      objectFit === 'contain' && 'object-contain',
      objectFit === 'fill' && 'object-fill',
      objectFit === 'none' && 'object-none',
      objectFit === 'scale-down' && 'object-scale-down'
    ),
    ...(placeholder === 'blur' && {
      placeholder: 'blur' as const,
      blurDataURL: blurDataURL || defaultBlurDataURL
    }),
    ...(sizes && { sizes }),
    ...(priority && { priority: true })
  }

  return (
    <div 
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={containerStyle}
    >
      {fill ? (
        <Image
          {...imageProps}
          fill
          alt={alt}
        />
      ) : (
        <Image
          {...imageProps}
          width={width}
          height={height}
          alt={alt}
        />
      )}
      
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
      {hasError && currentSrc === fallbackSrc && (
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

// Componente para imagens responsivas
export const ResponsiveImage = memo(function ResponsiveImage({
  aspectRatio = '16/9',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  aspectRatio?: string
  sizes?: string
}) {
  return (
    <OptimizedImage
      fill
      aspectRatio={aspectRatio}
      sizes={sizes}
      {...props}
    />
  )
})

// Componente para avatares
export const OptimizedAvatar = memo(function OptimizedAvatar({
  size = 40,
  fallbackSrc = '/images/default-avatar.svg',
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  size?: number
}) {
  return (
    <OptimizedImage
      width={size}
      height={size}
      objectFit="cover"
      fallbackSrc={fallbackSrc}
      className={cn('rounded-full', className)}
      {...props}
    />
  )
})

export default OptimizedImage 