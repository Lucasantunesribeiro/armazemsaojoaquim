'use client'

import { useState, useRef, useEffect, memo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

// Function to get the best available image format
const getBestImageSrc = (src: string): string => {
  // If it's already a modern format or external URL, return as is
  if (src.includes('.webp') || src.includes('.avif') || src.startsWith('http')) {
    return src
  }

  // For local images, try to use AVIF first, then WebP, then original
  const basePath = src.replace(/\.(jpg|jpeg|png)$/i, '')
  
  // Check if we have AVIF version (best compression)
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx && canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return `${basePath}.avif`
    }
  }
  
  // Fallback to WebP (good compression, wide support)
  return `${basePath}.webp`
}

// Generate responsive srcSet for modern formats
const generateSrcSet = (src: string): string => {
  if (src.startsWith('http') || src.includes('_640w') || src.includes('_768w')) {
    return '' // External or already responsive
  }

  const basePath = src.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '')
  const ext = src.includes('.avif') ? 'avif' : 'webp'
  
  const srcSet = [
    `${basePath}_640w.${ext} 640w`,
    `${basePath}_768w.${ext} 768w`,
    `${basePath}.${ext} 1024w`
  ].join(', ')
  
  return srcSet
}

// Generate a simple blur placeholder
const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Create a simple gradient blur effect
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL()
}

const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [blurData, setBlurData] = useState<string | undefined>(blurDataURL)
  const [optimizedSrc, setOptimizedSrc] = useState(src)

  // Get the best available image format
  useEffect(() => {
    const bestSrc = getBestImageSrc(src)
    setOptimizedSrc(bestSrc)
  }, [src])

  // Generate blur placeholder if not provided
  useEffect(() => {
    if (placeholder === 'blur' && !blurDataURL && typeof window !== 'undefined') {
      const blur = generateBlurDataURL(width || 10, height || 10)
      setBlurData(blur)
    }
  }, [placeholder, blurDataURL, width, height])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // Default sizes for responsive images
  const defaultSizes = fill 
    ? '100vw'
    : sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-200 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Image not available</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={defaultSizes}
        placeholder={placeholder}
        blurDataURL={blurData}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage