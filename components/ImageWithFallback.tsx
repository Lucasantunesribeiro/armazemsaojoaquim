'use client'

import { useState, useCallback } from 'react'
import { cn } from '../lib/utils'

interface ImageWithFallbackProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  role?: string
  'aria-describedby'?: string
  'aria-labelledby'?: string
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/armazem-sem-imagem.jpg',
  className,
  width,
  height,
  loading = 'lazy',
  priority = false,
  sizes,
  onLoad,
  onError,
  role,
  'aria-describedby': ariaDescribedby,
  'aria-labelledby': ariaLabelledby,
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
    onError?.()
  }, [imageSrc, fallbackSrc, onError])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-cinza-claro animate-pulse"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        role={role}
        aria-describedby={ariaDescribedby}
        aria-labelledby={ariaLabelledby}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError ? 'object-contain' : 'object-cover',
          'w-full h-full'
        )}
      />
      
      {/* Error state indicator */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-cinza-claro">
          <div className="text-center text-cinza-medio">
            <svg 
              className="w-12 h-12 mx-auto mb-2 opacity-50" 
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
            <span className="text-xs opacity-75">Imagem não disponível</span>
          </div>
        </div>
      )}
    </div>
  )
} 