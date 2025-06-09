'use client'

import { useState, useRef, useEffect, CSSProperties } from 'react'
import { useOptimization, getOptimizedImageSrc, supportsWebP } from '@/lib/hooks/useOptimization'

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
}

export default function ImageOptimized({
  src,
  alt,
  width,
  height,
  quality = 85,
  className = '',
  style,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  objectFit = 'cover',
  onLoad,
  onError,
}: ImageOptimizedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)
  const { elementRef, isVisible, lazyLoad } = useOptimization()

  // Generate optimized sources
  const generateSources = () => {
    if (!src) return { webp: '', fallback: '' }

    const webpSrc = getOptimizedImageSrc(
      src.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
      width,
      quality
    )
    const fallbackSrc = getOptimizedImageSrc(src, width, quality)

    return { webp: webpSrc, fallback: fallbackSrc }
  }

  const { webp, fallback } = generateSources()

  // Handle lazy loading
  useEffect(() => {
    if (priority) {
      setCurrentSrc(supportsWebP() ? webp : fallback)
      return
    }

    const element = imgRef.current
    if (element) {
      elementRef.current = element
      lazyLoad(() => {
        setCurrentSrc(supportsWebP() ? webp : fallback)
      })
    }
  }, [priority, webp, fallback, lazyLoad, elementRef])

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    setHasError(true)
    // Fallback to original source
    if (currentSrc !== src) {
      setCurrentSrc(src)
      setHasError(false)
    } else {
      onError?.()
    }
  }

  // Generate placeholder
  const getPlaceholder = () => {
    if (placeholder === 'empty') return null
    
    if (placeholder === 'blur') {
      const defaultBlur = blurDataURL || 
        `data:image/svg+xml;base64,${btoa(`
          <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)" />
            <circle cx="50%" cy="40%" r="20" fill="#d0d0d0" opacity="0.3"/>
            <rect x="20%" y="60%" width="60%" height="8" fill="#d0d0d0" opacity="0.3" rx="4"/>
            <rect x="20%" y="72%" width="40%" height="6" fill="#d0d0d0" opacity="0.2" rx="3"/>
          </svg>
        `)}`
      
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

    return (
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url(${placeholder})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    )
  }

  // Error state
  if (hasError && currentSrc === src) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={{ width, height, ...style }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
        <picture>
          {supportsWebP() && webp && (
            <source srcSet={webp} type="image/webp" sizes={sizes} />
          )}
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
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            sizes={sizes}
          />
        </picture>
      )}
    </div>
  )
} 