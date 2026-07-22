'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface SimpleImageProps {
  src: string | null
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  loading?: 'lazy' | 'eager'
  priority?: boolean
}

const SimpleImage = ({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = '', 
  fill = false,
  loading = 'lazy',
  priority = false
}: SimpleImageProps) => {
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  
  // Evitar loops infinitos - máximo 1 tentativa
  const MAX_RETRIES = 1
  
  // Verificar se src é válido
  const isValidSrc = src && src.trim() !== ''
  
  // Reset estado quando URL muda
  useEffect(() => {
    setError(false)
    setIsLoading(true)
    setRetryCount(0)
  }, [src])
  
  // Definir dimensões baseadas no uso de fill ou width/height
  const useFixedDimensions = !fill
  const finalWidth = useFixedDimensions ? width : undefined
  const finalHeight = useFixedDimensions ? height : undefined

  // Se não há src válido ou houve erro, mostrar placeholder
  if (!isValidSrc || error || retryCount >= MAX_RETRIES) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${fill ? 'absolute inset-0' : ''} ${className}`}
        style={fill ? {} : { width: finalWidth, height: finalHeight }}
      >
        <div className="text-gray-500 text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Imagem não disponível</div>
          {src && <div className="text-xs text-red-500 mt-1 break-all">{src.substring(0, 30)}...</div>}
        </div>
      </div>
    )
  }

  const isPriority = priority === true
  const imageLoadingMode = isPriority ? undefined : (loading || 'lazy')

  return (
    <div className={fill ? 'relative w-full h-full' : 'relative'}>
      {isLoading && (
        <div 
          className={`bg-gray-100 animate-pulse flex items-center justify-center z-10 ${fill ? 'absolute inset-0 w-full h-full' : ''}`}
          style={fill ? {} : { width: finalWidth, height: finalHeight }}
        >
          <div className="text-gray-400 animate-spin">⏳</div>
        </div>
      )}
      
      <Image
        src={src!}
        alt={alt}
        {...(fill ? {
          fill: true,
          sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        } : {
          width: finalWidth!,
          height: finalHeight!
        })}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={imageLoadingMode}
        priority={isPriority}
        decoding="async"
        onError={() => {
          setRetryCount(prev => prev + 1)
          
          if (retryCount >= MAX_RETRIES - 1) {
            setError(true)
          }
          setIsLoading(false)
        }}
        onLoad={() => {
          setIsLoading(false)
          setRetryCount(0) // Reset contador em caso de sucesso
        }}
      />
    </div>
  )
}

export default SimpleImage 