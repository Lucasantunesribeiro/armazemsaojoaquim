'use client'

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface PousadaImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string
  fallback?: string | null
  onError?: () => void
}

export default function PousadaImage({ 
  src, 
  fallback = null,
  onError,
  ...props 
}: PousadaImageProps) {
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  const handleError = () => {
    if (!hasError && fallback && currentSrc !== fallback) {
      setHasError(true)
      setCurrentSrc(fallback)
      onError?.()
    } else if (!fallback) {
      setHasError(true)
      onError?.()
    }
  }

  // Para imagens da pousada, usar servidor direto em produção
  const optimizedSrc = currentSrc.includes('/images/pousada/') 
    ? currentSrc 
    : currentSrc

  return (
    <Image
      {...props}
      src={optimizedSrc}
      onError={handleError}
      priority={props.priority || false}
      placeholder={props.placeholder || 'blur'}
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyejVXZQhncig=="
    />
  )
}