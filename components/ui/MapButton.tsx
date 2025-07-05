'use client'

import React from 'react'
import { MapPin, ExternalLink } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MapButtonProps {
  address: string
  className?: string
  variant?: 'default' | 'compact' | 'link'
  showIcon?: boolean
  target?: '_blank' | '_self'
}

const MapButton: React.FC<MapButtonProps> = ({
  address,
  className,
  variant = 'default',
  showIcon = true,
  target = '_blank'
}) => {
  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`
  
  const variants = {
    default: cn(
      "inline-flex items-center space-x-2 px-4 py-2 rounded-lg",
      "bg-amarelo-armazem hover:bg-yellow-500 text-madeira-escura",
      "font-semibold transition-all duration-300 hover:scale-105",
      "shadow-md hover:shadow-lg"
    ),
    compact: cn(
      "inline-flex items-center space-x-1 text-sm",
      "text-amarelo-armazem hover:text-yellow-300",
      "transition-colors duration-300"
    ),
    link: cn(
      "inline-flex items-center space-x-1 text-xs",
      "text-amarelo-armazem hover:text-yellow-300",
      "transition-colors duration-300 hover:underline"
    )
  }

  return (
    <a
      href={googleMapsUrl}
      target={target}
      rel="noopener noreferrer"
      className={cn(variants[variant], className)}
      aria-label={`Ver ${address} no Google Maps`}
    >
      {showIcon && (
        <MapPin className={cn(
          variant === 'default' ? "w-4 h-4" : "w-3 h-3"
        )} />
      )}
      <span>
        {variant === 'default' ? 'Ver no Google Maps' : 'Ver no Mapa'}
      </span>
      {variant !== 'default' && <ExternalLink className="w-3 h-3" />}
    </a>
  )
}

export default MapButton 