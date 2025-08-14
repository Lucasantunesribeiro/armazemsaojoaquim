'use client'

import React from 'react'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/ToastContainer'
import LocationButton from '@/components/ui/LocationButton'
import ToastTest from '@/components/test/ToastTest'
import { useToastNotifications } from '@/hooks/useToastNotifications'

function DemoContent() {
  const { showLocationSuccess, showLocationError, showSuccess, showError } = useToastNotifications()

  const handleLocationClick = () => {
    // Simulate location opening with toast feedback
    showLocationSuccess()
  }

  const handleLocationError = () => {
    showLocationError()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            UI Improvements Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Demonstração das melhorias implementadas no botão de localização e sistema de notificações toast.
          </p>
        </div>

        {/* Enhanced LocationButton Demo */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Enhanced LocationButton
          </h2>
          
          <div className="space-y-8">
            {/* Button Variants */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Button Variants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LocationButton 
                  variant="default"
                  size="lg"
                  onClick={handleLocationClick}
                >
                  Default
                </LocationButton>
                
                <LocationButton 
                  variant="outline"
                  size="lg"
                  onClick={handleLocationClick}
                >
                  Outline
                </LocationButton>
                
                <LocationButton 
                  variant="secondary"
                  size="lg"
                  onClick={handleLocationClick}
                >
                  Secondary
                </LocationButton>
                
                <LocationButton 
                  variant="ghost"
                  size="lg"
                  onClick={handleLocationClick}
                >
                  Ghost
                </LocationButton>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Button Sizes
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                <LocationButton 
                  variant="default"
                  size="sm"
                  onClick={handleLocationClick}
                >
                  Small
                </LocationButton>
                
                <LocationButton 
                  variant="default"
                  size="default"
                  onClick={handleLocationClick}
                >
                  Default
                </LocationButton>
                
                <LocationButton 
                  variant="default"
                  size="lg"
                  onClick={handleLocationClick}
                >
                  Large
                </LocationButton>
              </div>
            </div>

            {/* Real-world Example */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Real-world Example
              </h3>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Pousada Armazém São Joaquim
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  R. Alm. Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ
                </p>
                <LocationButton 
                  address="R. Alm. Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ"
                  coordinates={{ lat: -22.9150, lng: -43.1886 }}
                  variant="default"
                  size="lg"
                  onClick={handleLocationClick}
                >
                  Ver Localização
                </LocationButton>
              </div>
            </div>
          </div>
        </section>

        {/* Toast System Demo */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Modern Toast Notification System
          </h2>
          
          <ToastTest />
        </section>

        {/* Integration Example */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Integration Example
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Exemplo de como o LocationButton integra com o sistema de notificações:
            </p>
            
            <div className="flex flex-wrap gap-4">
              <LocationButton 
                variant="default"
                size="lg"
                onClick={() => {
                  showSuccess('Localização aberta com sucesso!', '📍 Localização')
                }}
              >
                Success Example
              </LocationButton>
              
              <LocationButton 
                variant="outline"
                size="lg"
                onClick={() => {
                  showError('Erro ao abrir localização', '📍 Erro')
                }}
              >
                Error Example
              </LocationButton>
            </div>
          </div>
        </section>

        {/* Dark Mode Test */}
        <section className="bg-gray-900 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Dark Mode Test
          </h2>
          
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <LocationButton 
                variant="default"
                size="lg"
                onClick={() => showSuccess('Dark mode success!', '🌙 Dark Mode')}
              >
                Default Dark
              </LocationButton>
              
              <LocationButton 
                variant="outline"
                size="lg"
                onClick={() => showError('Dark mode error!', '🌙 Dark Mode')}
              >
                Outline Dark
              </LocationButton>
              
              <LocationButton 
                variant="secondary"
                size="lg"
                onClick={() => showSuccess('Secondary in dark!', '🌙 Dark Mode')}
              >
                Secondary Dark
              </LocationButton>
            </div>
          </div>
        </section>

        {/* Features Summary */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ✨ Features Implemented
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                🎯 LocationButton Improvements
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>✅ Fixed text visibility and contrast issues</li>
                <li>✅ Enhanced Google Maps and Waze button designs</li>
                <li>✅ Added proper loading states and animations</li>
                <li>✅ Improved accessibility with ARIA labels</li>
                <li>✅ Added CSS custom properties for theming</li>
                <li>✅ Responsive design for all screen sizes</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                🔔 Toast System Features
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>✅ Modern toast notification foundation</li>
                <li>✅ Visual variants (success, error, warning, info)</li>
                <li>✅ Smooth animations and transitions</li>
                <li>✅ Mobile responsive with touch gestures</li>
                <li>✅ Auto-dismiss and manual dismiss</li>
                <li>✅ Accessibility features (ARIA, keyboard support)</li>
                <li>✅ Action buttons and interactive features</li>
                <li>✅ Theme support (light/dark)</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
      
      {/* Toast Container */}
      <ToastContainer position="top-right" />
    </div>
  )
}

export default function UIImprovementsDemo() {
  return (
    <ToastProvider maxToasts={5} defaultDuration={5000}>
      <DemoContent />
    </ToastProvider>
  )
}