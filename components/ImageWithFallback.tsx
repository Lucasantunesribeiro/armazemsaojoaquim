'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  sizes?: string
  width?: number
  height?: number
  fill?: boolean
  quality?: number
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/placeholder.svg',
  loading = 'lazy',
  priority = false,
  sizes,
  width,
  height,
  fill = false,
  quality = 85,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setImgSrc(fallbackSrc)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const imageProps = {
    src: imgSrc,
    alt,
    className: `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`,
    onError: handleError,
    onLoad: handleLoad,
    loading,
    priority,
    quality,
    ...(sizes && { sizes }),
    ...props
  }

  if (fill) {
    return (
      <Image 
        {...imageProps} 
        fill 
        alt={alt}
      />
    )
  }

  return (
    <Image
      {...imageProps}
      width={width || 800}
      height={height || 600}
      alt={alt}
    />
  )
} 