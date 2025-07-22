'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWelcomeMessage } from '@/components/providers/NotificationProvider'
import { X, Calendar, ChefHat, MapPin, Users, Star, ArrowRight, Sparkles } from 'lucide-react'

export const WelcomeModal: React.FC = () => {
  const { welcomeMessage, hideWelcome } = useWelcomeMessage()
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (welcomeMessage?.show) {
      // Delay to allow for smooth entrance animation
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    }
  }, [welcomeMessage])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      hideWelcome()
      setIsVisible(false)
      setIsClosing(false)
    }, 300)
  }

  if (!welcomeMessage?.show) return null

  const isFirstVisit = welcomeMessage.type === 'first-visit'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
          transition-all duration-300 ease-out
          ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`
            relative max-w-lg w-full mx-auto
            transition-all duration-300 ease-out
            ${isVisible && !isClosing ? 
              'opacity-100 scale-100 translate-y-0' : 
              'opacity-0 scale-95 translate-y-4'
            }
          `}
        >
          {/* Main Modal Content */}
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
            
            {/* Sparkle Animation */}
            <div className="absolute top-4 right-4 text-amber-400">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-12 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
            </button>

            <div className="p-8 sm:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {isFirstVisit ? (
                    <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full">
                      <ChefHat className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full">
                      <Users className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white font-serif mb-2">
                  {welcomeMessage.content.title}
                </h2>
                
                {welcomeMessage.content.subtitle && (
                  <p className="text-xl text-amber-700 dark:text-amber-300 font-medium">
                    {welcomeMessage.content.subtitle}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <p className="text-lg text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                  {welcomeMessage.content.message}
                </p>
              </div>

              {/* Features (only for first visit) */}
              {isFirstVisit && welcomeMessage.content.features && (
                <div className="mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {welcomeMessage.content.features.map((feature, index) => {
                      const icons = [ChefHat, Calendar, MapPin, Star]
                      const IconComponent = icons[index] || Star
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {feature.replace(/^🍽️|📅|🏔️|👨‍🍳\s*/, '')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {welcomeMessage.content.actions && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {welcomeMessage.content.actions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      onClick={handleClose}
                      className={`
                        group inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold
                        transition-all duration-200 transform hover:scale-105
                        ${action.variant === 'primary'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-400 shadow-md hover:shadow-lg'
                        }
                      `}
                    >
                      <span>{action.label}</span>
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Skip Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleClose}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Talvez mais tarde
                </button>
              </div>

              {/* Footer Info */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>Santa Teresa, RJ</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>30+ Anos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChefHat className="h-3 w-3" />
                    <span>Culinária Tradicional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default WelcomeModal 