'use client'

import Image from 'next/image'
import { useState, SyntheticEvent, useEffect } from 'react'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  fallbackSrc?: string
  showPlaceholderIcon?: boolean
}

// Lista de imagens que sabemos que falham no Supabase (400 errors)
// ATUALIZADA em 22/06/2025 - Apenas imagens que realmente falham
const KNOWN_FAILING_IMAGES = [
  // Imagens que retornam 400 no Supabase Storage
  'ceviche_carioca.png',
  'feijoada_da_casa_individual.png', 
  'feijoada_da_casa_para_dois.png',
  'marquise_au_chocolat.png',
  'farofa.png',
  'pure_de_batata.png',
  'legumes_na_brasa.png',
  'patatas_brava.png',
  'linguica_na_brasa.png',
  'pasteis_de_pupunha.png',
  'bife_a_milanesa.png',
  'peixe_grelhado.png',
  'risotto_cogumelos.png',
  'salmao_grelhado.png',
  'torta_limao.png',
  'mousse_chocolate.png',
  'cheesecake_frutas.png',
  'tiramisu.png',
  
  // NOTA: Imagens removidas da lista pois agora funcionam:
  // - bife_ancho.png ✅ OK
  // - caesar_salad_com_frango.png ✅ OK  
  // - bolinho_de_bacalhau.png ✅ OK
  // - picanha_ao_carvao.png ✅ OK
  // E outras 23+ imagens que estão funcionando no Supabase
]

const SafeImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  sizes,
  quality = 90,
  placeholder = 'empty',
  fallbackSrc = '/images/placeholder.jpg',
  showPlaceholderIcon = true
}: SafeImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)
  const [fallbackLevel, setFallbackLevel] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Verificar se a imagem é conhecida por falhar
  const isKnownFailingImage = (imageSrc: string | null | undefined): boolean => {
    if (!imageSrc) return false
    const filename = imageSrc.split('/').pop()
    return filename ? KNOWN_FAILING_IMAGES.includes(filename) : false
  }

  // Sistema de fallback inteligente
  const getFallbackSources = (originalSrc: string | null | undefined): string[] => {
    if (!originalSrc) {
      return ['/images/placeholder.svg']
    }
    
    const sources: string[] = []
    const filename = originalSrc.split('/').pop()
    
    // Se é uma imagem conhecida por falhar, pular direto para o SVG
    if (isKnownFailingImage(originalSrc)) {
      console.log(`⚠️ Imagem conhecida por falhar, usando SVG diretamente:`, filename)
      if (filename) {
        const svgFilename = filename.replace(/\.(png|jpg|jpeg)$/i, '.svg')
        sources.push(`/images/menu_images/${svgFilename}`)
      }
      sources.push('/images/placeholder.svg')
      return sources
    }
    
    // Fluxo normal para outras imagens
    sources.push(originalSrc)
    
    // Fallback local PNG (se for do Supabase)
    if (originalSrc.includes('supabase.co') && filename) {
      sources.push(`/images/menu_images/${filename}`)
    }
    
    // Fallback SVG (se for do Supabase)
    if (originalSrc.includes('supabase.co') && filename) {
      const svgFilename = filename.replace(/\.(png|jpg|jpeg)$/i, '.svg')
      sources.push(`/images/menu_images/${svgFilename}`)
    }
    
    // Placeholder final
    sources.push('/images/placeholder.svg')
    
    return sources
  }

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    const sources = getFallbackSources(src)
    const nextLevel = fallbackLevel + 1
    
    console.warn(`❌ SafeImage Error (Level ${fallbackLevel}):`, e.currentTarget.src)
    
    if (nextLevel < sources.length) {
      const nextSrc = sources[nextLevel]
      console.log(`🔄 SafeImage Fallback (Level ${nextLevel}):`, nextSrc)
      setFallbackLevel(nextLevel)
      setCurrentSrc(nextSrc)
    } else {
      console.error('❌ SafeImage: Todos os fallbacks falharam para:', src)
      setHasError(true)
      setIsLoading(false)
    }
  }

  const handleImageLoad = () => {
    console.log(`✅ SafeImage Loaded (Level ${fallbackLevel}):`, currentSrc)
    setIsLoading(false)
    setHasError(false)
  }

  // Inicializar quando src muda
  useEffect(() => {
    const sources = getFallbackSources(src)
    const firstSrc = sources[0]
    
    console.log(`🚀 SafeImage Init:`, { 
      src, 
      firstSrc, 
      isKnownFailing: isKnownFailingImage(src),
      sources 
    })
    
    setFallbackLevel(0)
    setCurrentSrc(firstSrc)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  // Se não há src válida, mostrar placeholder
  if (!currentSrc) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center relative ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-center">
          <div className="text-2xl mb-1">🖼️</div>
          <div className="text-xs">Sem imagem</div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded-bl">
            NO-SRC
          </div>
        )}
      </div>
    )
  }

  // Se todos os fallbacks falharam
  if (hasError) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center relative ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-center p-4">
          <div className="text-2xl mb-2">🍽️</div>
          <div className="text-sm font-medium text-gray-600 mb-1">
            {alt || 'Imagem do prato'}
          </div>
          <div className="text-xs text-gray-500">
            Imagem não disponível
          </div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded-bl">
            ERROR
          </div>
        )}
      </div>
    )
  }

  // Verificar se é SVG
  const isSvg = currentSrc.endsWith('.svg')

  // Para SVGs, usar img tag normal
  if (isSvg) {
    return (
      <div className="relative">
        {/* Loading overlay */}
        {isLoading && (
          <div 
            className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-10"
            style={{ width, height }}
          >
            <div className="text-gray-400">
              <div className="animate-spin text-xl">⏳</div>
            </div>
          </div>
        )}
        
        {/* SVG image */}
        <img
          src={currentSrc}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : { width, height }}
        />
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs p-1 rounded-bl">
            L{fallbackLevel}-SVG
          </div>
        )}
      </div>
    )
  }

  // Para imagens normais, usar Next.js Image
  const imageProps = {
    src: currentSrc,
    alt,
    onError: handleImageError,
    onLoad: handleImageLoad,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    loading: 'eager' as const,
    priority: true,
    quality,
    sizes,
    ...(fill
      ? {
          fill: true,
        }
      : {
          width: width || 400,
          height: height || 300,
        }),
  }

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-10"
          style={{ width, height }}
        >
          <div className="text-gray-400">
            <div className="animate-spin text-xl">⏳</div>
          </div>
        </div>
      )}
      
      {/* Next.js Image */}
      <Image {...imageProps} alt={alt} />
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs p-1 rounded-bl">
          L{fallbackLevel}
        </div>
      )}
    </div>
  )
}

export default SafeImage 