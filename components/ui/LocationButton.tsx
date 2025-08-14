'use client'

import React, { useState } from 'react'
import { MapPin, ExternalLink, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import './LocationButton.module.css'

// Custom SVG Icons for map services
const GoogleMapsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    <circle cx="12" cy="9" r="1.5" fill="white"/>
  </svg>
)

const WazeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
)

const AppleMapsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    <path d="M12 6.5c1.38 0 2.5 1.12 2.5 2.5S13.38 11.5 12 11.5 9.5 10.38 9.5 9s1.12-2.5 2.5-2.5z" fill="white"/>
  </svg>
)

// Enhanced button variants with improved contrast and visibility
const locationButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500 border-0",
        outline: "border-2 border-amber-600 text-amber-700 bg-white hover:bg-amber-50 focus-visible:ring-amber-500 dark:bg-gray-900 dark:text-amber-400 dark:border-amber-500 dark:hover:bg-amber-950",
        secondary: "bg-amber-100 text-amber-800 hover:bg-amber-200 focus-visible:ring-amber-500 dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800",
        ghost: "text-amber-700 hover:bg-amber-100 hover:text-amber-800 focus-visible:ring-amber-500 dark:text-amber-400 dark:hover:bg-amber-950 dark:hover:text-amber-300"
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-12 px-8 py-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "lg"
    }
  }
)

// Map service button variants with brand-specific styling
const mapServiceButtonVariants = cva(
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      service: {
        google: [
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
          "hover:from-blue-600 hover:to-blue-700",
          "focus-visible:ring-blue-500",
          "dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
        ],
        waze: [
          "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white",
          "hover:from-cyan-500 hover:to-cyan-600",
          "focus-visible:ring-cyan-500",
          "dark:from-cyan-500 dark:to-cyan-600 dark:hover:from-cyan-600 dark:hover:to-cyan-700",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
        ],
        apple: [
          "bg-gradient-to-r from-gray-700 to-gray-800 text-white",
          "hover:from-gray-800 hover:to-gray-900",
          "focus-visible:ring-gray-500",
          "dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
        ],
        failed: [
          "bg-gradient-to-r from-gray-400 to-gray-500 text-gray-100 cursor-not-allowed",
          "dark:from-gray-600 dark:to-gray-700"
        ]
      },
      preferred: {
        true: "ring-2 ring-offset-1",
        false: ""
      }
    },
    compoundVariants: [
      {
        service: "google",
        preferred: true,
        class: "ring-blue-300 dark:ring-blue-400"
      },
      {
        service: "waze", 
        preferred: true,
        class: "ring-cyan-300 dark:ring-cyan-400"
      },
      {
        service: "apple",
        preferred: true,
        class: "ring-gray-300 dark:ring-gray-400"
      }
    ],
    defaultVariants: {
      service: "google",
      preferred: false
    }
  }
)

interface LocationButtonProps extends VariantProps<typeof locationButtonVariants> {
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

export default function LocationButton({
  address = "R. Alm. Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ",
  coordinates = { lat: -22.9150, lng: -43.1886 },
  className,
  variant = 'outline',
  size = 'lg',
  children = 'Ver Localização',
  onClick,
  ...props
}: LocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingService, setLoadingService] = useState<'main' | 'google' | 'waze' | null>(null)
  const [userPreference, setUserPreference] = useState<'google' | 'waze' | 'apple' | null>(null)
  const [failedServices, setFailedServices] = useState<Set<string>>(new Set())
  
  // Memoize URLs to avoid recalculation
  const mapUrls = React.useMemo(() => ({
    google: `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`,
    waze: `https://waze.com/ul?ll=${coordinates.lat},${coordinates.lng}&navigate=yes`,
    apple: `https://maps.apple.com/?q=${coordinates.lat},${coordinates.lng}&ll=${coordinates.lat},${coordinates.lng}`
  }), [coordinates.lat, coordinates.lng])

  // Detect platform and set intelligent defaults
  const platformInfo = React.useMemo(() => {
    if (typeof window === 'undefined') return { platform: 'unknown', preferredService: 'google' }
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return { platform: 'ios', preferredService: 'apple' as const }
    } else if (userAgent.includes('mac')) {
      return { platform: 'macos', preferredService: 'apple' as const }
    } else if (userAgent.includes('android')) {
      return { platform: 'android', preferredService: 'google' as const }
    } else {
      return { platform: 'desktop', preferredService: 'google' as const }
    }
  }, [])

  // Load user preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('map-service-preference')
    if (saved && ['google', 'waze', 'apple'].includes(saved)) {
      setUserPreference(saved as 'google' | 'waze' | 'apple')
    }
  }, [])

  // Preload map service URLs for faster opening
  React.useEffect(() => {
    // Create invisible links to preload DNS and establish connections
    const preloadLinks = [
      { href: 'https://www.google.com', rel: 'dns-prefetch' },
      { href: 'https://maps.google.com', rel: 'dns-prefetch' },
      { href: 'https://waze.com', rel: 'dns-prefetch' },
      { href: 'https://maps.apple.com', rel: 'dns-prefetch' }
    ]

    preloadLinks.forEach(({ href, rel }) => {
      const link = document.createElement('link')
      link.rel = rel
      link.href = href
      document.head.appendChild(link)
    })

    // Cleanup function to remove preload links
    return () => {
      preloadLinks.forEach(({ href, rel }) => {
        const existingLink = document.querySelector(`link[rel="${rel}"][href="${href}"]`)
        if (existingLink) {
          document.head.removeChild(existingLink)
        }
      })
    }
  }, [])

  // Save user preference
  const saveUserPreference = (service: 'google' | 'waze' | 'apple') => {
    setUserPreference(service)
    localStorage.setItem('map-service-preference', service)
    
    // Track usage analytics (optional)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // @ts-ignore
      window.gtag('event', 'map_service_used', {
        service,
        platform: platformInfo.platform
      })
    }
  }

  const openInGoogleMaps = React.useCallback(() => {
    setLoadingService('google')
    setIsLoading(true)
    
    try {
      const newWindow = window.open(mapUrls.google, '_blank', 'noopener,noreferrer')
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked, try fallback methods
        console.warn('Popup bloqueado, tentando fallback...')
        
        // Try fallback with address search in same tab
        const fallbackUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`
        
        // Try to create a temporary link for better user experience
        const tempLink = document.createElement('a')
        tempLink.href = fallbackUrl
        tempLink.target = '_blank'
        tempLink.rel = 'noopener noreferrer'
        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        return
      }
      
      // Save preference and mark as successful
      saveUserPreference('google')
      setFailedServices(prev => {
        const newSet = new Set(prev)
        newSet.delete('google')
        return newSet
      })
      
    } catch (error) {
      console.error('Erro ao abrir Google Maps:', error)
      
      // Try fallback with address search in same tab
      try {
        const fallbackUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`
        
        // Try to create a temporary link for better user experience
        const tempLink = document.createElement('a')
        tempLink.href = fallbackUrl
        tempLink.target = '_blank'
        tempLink.rel = 'noopener noreferrer'
        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
      } catch (fallbackError) {
        console.error('Fallback também falhou:', fallbackError)
        setFailedServices(prev => new Set(prev).add('google'))
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false)
        setLoadingService(null)
      }, 600)
    }
  }, [mapUrls.google, address, saveUserPreference, setFailedServices])

  const openInAppleMaps = React.useCallback(() => {
    setIsLoading(true)
    
    try {
      const newWindow = window.open(mapUrls.apple, '_blank', 'noopener,noreferrer')
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked, try fallback to Google Maps
        console.warn('Popup do Apple Maps bloqueado, tentando Google Maps...')
        
        if (!failedServices.has('google')) {
          // Try Google Maps as fallback
          const fallbackUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`
          const tempLink = document.createElement('a')
          tempLink.href = fallbackUrl
          tempLink.target = '_blank'
          tempLink.rel = 'noopener noreferrer'
          document.body.appendChild(tempLink)
          tempLink.click()
          document.body.removeChild(tempLink)
          return
        } else {
          // If Google also failed, go to same tab
          const tempLink = document.createElement('a')
          tempLink.href = mapUrls.apple
          tempLink.target = '_blank'
          tempLink.rel = 'noopener noreferrer'
          document.body.appendChild(tempLink)
          tempLink.click()
          document.body.removeChild(tempLink)
          return
        }
      }
      
      saveUserPreference('apple')
      setFailedServices(prev => {
        const newSet = new Set(prev)
        newSet.delete('apple')
        return newSet
      })
      
    } catch (error) {
      console.error('Erro ao abrir Apple Maps:', error)
      setFailedServices(prev => new Set(prev).add('apple'))
      
      // Fallback to Google Maps
      if (!failedServices.has('google')) {
        const fallbackUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`
        const tempLink = document.createElement('a')
        tempLink.href = fallbackUrl
        tempLink.target = '_blank'
        tempLink.rel = 'noopener noreferrer'
        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 600)
    }
  }, [mapUrls.apple, failedServices, address, saveUserPreference])

  const openInWaze = React.useCallback(() => {
    setLoadingService('waze')
    setIsLoading(true)
    
    try {
      const newWindow = window.open(mapUrls.waze, '_blank', 'noopener,noreferrer')
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked, try fallback to Google Maps
        console.warn('Popup do Waze bloqueado, tentando Google Maps...')
        
        if (!failedServices.has('google')) {
          // Try Google Maps as fallback
          const fallbackUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`
          const tempLink = document.createElement('a')
          tempLink.href = fallbackUrl
          tempLink.target = '_blank'
          tempLink.rel = 'noopener noreferrer'
          document.body.appendChild(tempLink)
          tempLink.click()
          document.body.removeChild(tempLink)
          return
        } else {
          // If Google also failed, go to same tab
          const tempLink = document.createElement('a')
          tempLink.href = mapUrls.waze
          tempLink.target = '_blank'
          tempLink.rel = 'noopener noreferrer'
          document.body.appendChild(tempLink)
          tempLink.click()
          document.body.removeChild(tempLink)
          return
        }
      }
      
      saveUserPreference('waze')
      setFailedServices(prev => {
        const newSet = new Set(prev)
        newSet.delete('waze')
        return newSet
      })
      
    } catch (error) {
      console.error('Erro ao abrir Waze:', error)
      setFailedServices(prev => new Set(prev).add('waze'))
      
      // Fallback to Google Maps
      if (!failedServices.has('google')) {
        const fallbackUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`
        const tempLink = document.createElement('a')
        tempLink.href = fallbackUrl
        tempLink.target = '_blank'
        tempLink.rel = 'noopener noreferrer'
        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false)
        setLoadingService(null)
      }, 600)
    }
  }, [mapUrls.waze, failedServices, address])

  const handleClick = React.useCallback(() => {
    // If custom onClick is provided, use it instead
    if (onClick) {
      onClick()
      return
    }
    
    setLoadingService('main')
    
    // Use user preference first, then platform default, then fallback
    const preferredService = userPreference || platformInfo.preferredService
    
    // Check if preferred service has failed before
    if (failedServices.has(preferredService)) {
      // Try alternative services
      const alternatives = ['google', 'waze', 'apple'].filter(
        service => service !== preferredService && !failedServices.has(service)
      )
      
      if (alternatives.length > 0) {
        const alternative = alternatives[0] as 'google' | 'waze' | 'apple'
        switch (alternative) {
          case 'google': openInGoogleMaps(); break
          case 'waze': openInWaze(); break
          case 'apple': openInAppleMaps(); break
        }
        return
      }
    }
    
    // Use preferred service
    switch (preferredService) {
      case 'apple':
        openInAppleMaps()
        break
      case 'waze':
        openInWaze()
        break
      case 'google':
      default:
        openInGoogleMaps()
        break
    }
  }, [onClick, userPreference, platformInfo.preferredService, failedServices, openInGoogleMaps, openInWaze, openInAppleMaps])

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      {/* Enhanced main button with improved contrast */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          locationButtonVariants({ variant, size }),
          "location-button",
          className
        )}
        data-variant={variant}
        style={{
          // aplica CSS vars para garantir contraste por tema/variante
          ...(variant === 'default' && {
            backgroundColor: 'var(--location-button-primary-bg)',
            color: 'var(--location-button-primary-text)'
          }),
          ...(variant === 'outline' && {
            backgroundColor: 'var(--location-button-outline-bg)',
            color: 'var(--location-button-outline-text)',
            borderColor: 'var(--location-button-outline-border)'
          }),
          ...(variant === 'secondary' && {
            backgroundColor: 'var(--location-button-secondary-bg)',
            color: 'var(--location-button-secondary-text)'
          })
        }}
        aria-label={isLoading ? "Abrindo localização..." : `Ver localização: ${address}`}
        aria-describedby="location-button-description"
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        ) : (
          <MapPin className="w-5 h-5" aria-hidden="true" />
        )}
        <span className="location-button-text font-semibold">{children}</span>
        <ExternalLink className="w-4 h-4 opacity-80" aria-hidden="true" />
      </button>
      
      {/* Hidden description for screen readers */}
      <span id="location-button-description" className="sr-only">
        Clique para abrir a localização em seu aplicativo de mapas preferido
      </span>

      {/* Enhanced alternative service buttons for desktop */}
      <div className="hidden lg:flex gap-3" role="group" aria-label="Opções de aplicativos de mapa">
        {/* Google Maps Button */}
        <button
          onClick={openInGoogleMaps}
          disabled={isLoading || failedServices.has('google')}
          className={cn(
            mapServiceButtonVariants({ 
              service: failedServices.has('google') ? 'failed' : 'google',
              preferred: userPreference === 'google'
            }),
            "location-button group map-service-button google-maps",
          )}
          aria-label={failedServices.has('google') ? "Google Maps indisponível" : "Abrir no Google Maps"}
          title={failedServices.has('google') ? "Serviço temporariamente indisponível" : "Abrir localização no Google Maps"}
        >
          <div className="relative z-10 flex items-center gap-2">
            {loadingService === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : failedServices.has('google') ? (
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-sm" aria-hidden="true">⚠️</span>
              </div>
            ) : (
              <GoogleMapsIcon className="w-4 h-4 drop-shadow-sm" />
            )}
            <span className="location-button-text font-medium">
              Google Maps
            </span>
            {userPreference === 'google' && !failedServices.has('google') && (
              <div className="flex items-center">
                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full font-semibold" aria-label="Preferido">
                  ★
                </span>
              </div>
            )}
          </div>
          {/* Hover effect overlay */}
          {!failedServices.has('google') && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
          )}
        </button>
        
        {/* Waze Button */}
        <button
          onClick={openInWaze}
          disabled={isLoading || failedServices.has('waze')}
          className={cn(
            mapServiceButtonVariants({ 
              service: failedServices.has('waze') ? 'failed' : 'waze',
              preferred: userPreference === 'waze'
            }),
            "location-button group map-service-button waze",
          )}
          aria-label={failedServices.has('waze') ? "Waze indisponível" : "Abrir no Waze"}
          title={failedServices.has('waze') ? "Serviço temporariamente indisponível" : "Abrir navegação no Waze"}
        >
          <div className="relative z-10 flex items-center gap-2">
            {loadingService === 'waze' ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : failedServices.has('waze') ? (
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-sm" aria-hidden="true">⚠️</span>
              </div>
            ) : (
              <WazeIcon className="w-4 h-4 drop-shadow-sm" />
            )}
            <span className="location-button-text font-medium">
              Waze
            </span>
            {userPreference === 'waze' && !failedServices.has('waze') && (
              <div className="flex items-center">
                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full font-semibold" aria-label="Preferido">
                  ★
                </span>
              </div>
            )}
          </div>
          {/* Hover effect overlay */}
          {!failedServices.has('waze') && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
          )}
        </button>

        {/* Apple Maps Button (for Apple devices) */}
        {(platformInfo.platform === 'ios' || platformInfo.platform === 'macos') && (
          <button
            onClick={openInAppleMaps}
            disabled={isLoading || failedServices.has('apple')}
            className={cn(
              mapServiceButtonVariants({ 
                service: failedServices.has('apple') ? 'failed' : 'apple',
                preferred: userPreference === 'apple'
              }),
              "location-button group map-service-button apple-maps",
            )}
            aria-label={failedServices.has('apple') ? "Apple Maps indisponível" : "Abrir no Apple Maps"}
            title={failedServices.has('apple') ? "Serviço temporariamente indisponível" : "Abrir localização no Apple Maps"}
          >
            <div className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : failedServices.has('apple') ? (
                <div className="w-4 h-4 flex items-center justify-center">
                  <span className="text-sm" aria-hidden="true">⚠️</span>
                </div>
              ) : (
                <AppleMapsIcon className="w-4 h-4 drop-shadow-sm" />
              )}
              <span className="location-button-text font-medium">
                Apple Maps
              </span>
              {userPreference === 'apple' && !failedServices.has('apple') && (
                <div className="flex items-center">
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full font-semibold" aria-label="Preferido">
                    ★
                  </span>
                </div>
              )}
            </div>
            {/* Hover effect overlay */}
            {!failedServices.has('apple') && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// Export nomeado também
export { LocationButton }