'use client'

interface SimpleImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
}

export default function SimpleImage({ 
  src, 
  alt, 
  className = '',
  width,
  height
}: SimpleImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  )
} 