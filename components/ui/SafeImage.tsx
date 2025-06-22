'use client'

import Image from 'next/image'
import { useSafeState } from '@/lib/hooks/useSafeState'

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  fallbackSrc?: string
  quality?: number
}

export const SafeImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  fill = false,
  fallbackSrc = '/images/placeholder.svg',
  quality = 75,
  ...props
}: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useSafeState(src)
  const [isLoading, setIsLoading] = useSafeState(true)
  const [hasError, setHasError] = useSafeState(false)

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        priority={priority}
        sizes={sizes}
        fill={fill}
        quality={quality}
        unoptimized={imgSrc.startsWith('/')}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      
      {hasError && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Imagem indisponível
        </div>
      )}
    </div>
  )
} 