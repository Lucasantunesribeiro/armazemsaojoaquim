'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Wifi, WifiOff, Smartphone, Monitor, Tablet } from 'lucide-react'

interface MobileDebuggerProps {
  show?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const MobileDebugger: React.FC<MobileDebuggerProps> = ({ 
  show = false, 
  position = 'bottom-right' 
}) => {
  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: '',
    viewport: { width: 0, height: 0 },
    devicePixelRatio: 1,
    connectionType: 'unknown',
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    online: true
  })

  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!show) return

    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setDeviceInfo({
        userAgent: navigator.userAgent,
        viewport: { width, height },
        devicePixelRatio: window.devicePixelRatio || 1,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024,
        online: navigator.onLine
      })
    }

    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('online', updateDeviceInfo)
    window.addEventListener('offline', updateDeviceInfo)

    // Listen for console errors
    const originalError = console.error
    console.error = (...args) => {
      const errorMsg = args.join(' ')
      if (errorMsg.includes('image') || errorMsg.includes('Image') || errorMsg.includes('img')) {
        setErrors(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${errorMsg}`])
      }
      originalError.apply(console, args)
    }

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('online', updateDeviceInfo)
      window.removeEventListener('offline', updateDeviceInfo)
      console.error = originalError
    }
  }, [show])

  if (!show) return null

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="w-4 h-4" />
    if (deviceInfo.isTablet) return <Tablet className="w-4 h-4" />
    return <Monitor className="w-4 h-4" />
  }

  const getConnectionIcon = () => {
    if (!deviceInfo.online) return <WifiOff className="w-4 h-4 text-red-400" />
    if (deviceInfo.connectionType === 'slow-2g' || deviceInfo.connectionType === '2g') {
      return <WifiOff className="w-4 h-4 text-red-400" />
    }
    return <Wifi className="w-4 h-4 text-green-400" />
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-xs`}>
      <div className="bg-black/90 text-white text-xs p-3 rounded-lg shadow-lg space-y-2 max-h-96 overflow-y-auto">
        <div className="flex items-center space-x-2 font-semibold border-b border-white/20 pb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span>Debug Mobile</span>
        </div>

        {/* Device Info */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {getDeviceIcon()}
            <span>
              {deviceInfo.viewport.width}x{deviceInfo.viewport.height} 
              {deviceInfo.devicePixelRatio > 1 && ` @${deviceInfo.devicePixelRatio}x`}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {getConnectionIcon()}
            <span>{deviceInfo.connectionType} {!deviceInfo.online && '(Offline)'}</span>
          </div>

          <div className="text-white/70">
            {deviceInfo.isMobile && '📱 Mobile'}
            {deviceInfo.isTablet && '📟 Tablet'}
            {deviceInfo.isDesktop && '🖥️ Desktop'}
          </div>
        </div>

        {/* User Agent (truncated) */}
        <div className="border-t border-white/20 pt-2">
          <div className="text-white/70 text-[10px] break-all">
            {deviceInfo.userAgent.slice(0, 80)}...
          </div>
        </div>

        {/* Image Errors */}
        {errors.length > 0 && (
          <div className="border-t border-white/20 pt-2">
            <div className="text-red-400 font-semibold mb-1">Erros de Imagem:</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {errors.map((error, index) => (
                <div key={index} className="text-red-300 text-[10px] break-all">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Page Info */}
        <div className="border-t border-white/20 pt-2 text-[10px] text-white/70">
          URL: {typeof window !== 'undefined' ? window.location.pathname : ''}
        </div>
      </div>
    </div>
  )
}

export default MobileDebugger 