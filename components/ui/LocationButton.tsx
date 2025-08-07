'use client'

import React, { useState } from 'react'
import { MapPin, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface LocationButtonProps {
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children?: React.ReactNode
}

export default function LocationButton({
  address = "Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ",
  coordinates = { lat: -22.9068, lng: -43.1729 },
  className,
  variant = 'outline',
  size = 'lg',
  children = 'Ver Localização',
  ...props
}: LocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const openInGoogleMaps = () => {
    setIsLoading(true)
    
    try {
      // Construir URL do Google Maps
      const encodedAddress = encodeURIComponent(address)
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}&query_place_id=${encodedAddress}`
      
      // Abrir em nova aba
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Erro ao abrir Google Maps:', error)
      
      // Fallback: abrir busca simples
      const fallbackUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
    } finally {
      // Remover loading após um tempo
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }

  const openInAppleMaps = () => {
    setIsLoading(true)
    
    try {
      // URL do Apple Maps
      const appleMapsUrl = `https://maps.apple.com/?q=${coordinates.lat},${coordinates.lng}&ll=${coordinates.lat},${coordinates.lng}`
      
      window.open(appleMapsUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Erro ao abrir Apple Maps:', error)
      openInGoogleMaps() // Fallback para Google Maps
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }

  const openInWaze = () => {
    setIsLoading(true)
    
    try {
      // URL do Waze
      const wazeUrl = `https://waze.com/ul?ll=${coordinates.lat},${coordinates.lng}&navigate=yes`
      
      window.open(wazeUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Erro ao abrir Waze:', error)
      openInGoogleMaps() // Fallback para Google Maps
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }

  const handleClick = () => {
    // Detectar plataforma e usar app apropriado
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('mac')) {
      // iOS/macOS - preferir Apple Maps
      openInAppleMaps()
    } else if (userAgent.includes('android')) {
      // Android - preferir Google Maps
      openInGoogleMaps()
    } else {
      // Desktop - usar Google Maps
      openInGoogleMaps()
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Botão principal */}
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'flex items-center gap-2',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        {children}
        <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
      </Button>

      {/* Botões alternativos para desktop */}
      <div className="hidden lg:flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={openInGoogleMaps}
          disabled={isLoading}
          className="text-xs"
        >
          Google Maps
        </Button>
        
        <Button
          variant="ghost" 
          size="sm"
          onClick={openInWaze}
          disabled={isLoading}
          className="text-xs"
        >
          Waze
        </Button>
      </div>
    </div>
  )
}

// Export nomeado também
export { LocationButton }